const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(express.json());

let client = null;
let activeDb = null;

// Load environments from .env
const environments = {};
Object.keys(process.env).forEach(key => {
    if (key.startsWith('DB_URI_')) {
        const envName = key.replace('DB_URI_', '');
        environments[envName] = process.env[key];
    }
});

// Middleware to check if connected
const requireConnection = (req, res, next) => {
    if (!client) {
        return res.status(400).json({ error: 'Not connected to any database' });
    }
    next();
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    });
};

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.AUTH_PASSWORD) {
        const accessToken = jwt.sign({ name: 'user' }, process.env.JWT_SECRET);
        res.json({ accessToken });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

app.get('/api/environments', authenticateToken, (req, res) => {
    res.json(Object.keys(environments));
});

app.post('/api/connect', authenticateToken, async (req, res) => {
    const { environment } = req.body;

    if (!environment) {
        return res.status(400).json({ error: 'Environment is required' });
    }

    const uri = environments[environment];
    if (!uri) {
        return res.status(400).json({ error: 'Invalid environment' });
    }

    try {
        if (client) {
            await client.close();
        }
        client = new MongoClient(uri);
        await client.connect();
        console.log(`Connected to MongoDB (${environment})`);
        res.json({ success: true, message: `Connected to ${environment} successfully` });
    } catch (error) {
        console.error('Connection failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/databases', authenticateToken, requireConnection, async (req, res) => {
    try {
        const adminDb = client.db().admin();
        const result = await adminDb.listDatabases();

        // Enrich with collection counts (approximate)
        const databases = await Promise.all(result.databases.map(async (dbInfo) => {
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            return {
                name: dbInfo.name,
                collections: collections.map(c => ({
                    name: c.name,
                    type: c.type
                })),
                sizeOnDisk: dbInfo.sizeOnDisk
            };
        }));

        res.json(databases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/collections/:dbName', authenticateToken, requireConnection, async (req, res) => {
    try {
        const { dbName } = req.params;
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();

        const detailedCollections = await Promise.all(collections.map(async (col) => {
            const stats = await db.command({ collStats: col.name });
            return {
                name: col.name,
                documentCount: stats.count,
                size: formatBytes(stats.size)
            };
        }));

        res.json(detailedCollections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/fields/:dbName/:collectionName", authenticateToken, async (req, res) => {
    if (!client) {
        return res.status(400).json({ error: "Not connected to database" });
    }

    try {
        const { dbName, collectionName } = req.params;
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Get a single document to infer schema
        const doc = await collection.findOne({});

        if (!doc) {
            return res.json([]);
        }

        // Extract all keys including nested ones
        const fields = getDotNotationKeys(doc);
        res.json(fields);
    } catch (err) {
        console.error("Error fetching fields:", err);
        res.status(500).json({ error: "Failed to fetch fields" });
    }
});

app.post('/api/execute', authenticateToken, requireConnection, async (req, res) => {
    const { query, dbName } = req.body;

    if (!query || !dbName) {
        return res.status(400).json({ error: 'Query and database name are required' });
    }

    try {
        const db = client.db(dbName);
        const result = await executeQuery(db, query);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Helper to format bytes
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper to get all dot-notation keys from an object
function getDotNotationKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        keys.push(newKey);
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date) && !(obj[key]._bsontype)) {
            keys = keys.concat(getDotNotationKeys(obj[key], newKey));
        }
    }
    return keys;
}

// Simple query parser and executor
// WARNING: This is a basic implementation and has security risks if exposed publicly.
// It is intended for a local developer tool.
async function executeQuery(db, queryStr) {
    // Create a proxy to handle db.collectionName
    const proxyDb = new Proxy({}, {
        get: (target, colName) => {
            if (typeof colName !== 'string') return undefined;
            return db.collection(colName);
        }
    });

    // Execution context with common MongoDB types
    const context = {
        db: proxyDb,
        ObjectId: require('mongodb').ObjectId,
        ISODate: (d) => d ? new Date(d) : new Date(),
        // Add other helpers if needed
    };

    const keys = Object.keys(context);
    const values = Object.values(context);

    // Execute the query string
    // We wrap it in an async function to support await if needed, 
    // though most mongo driver methods return promises that we handle below.
    const func = new Function(...keys, `return ${queryStr.trim()}`);
    let result = await func(...values);

    // If the result is a cursor, convert to array
    if (result && typeof result.toArray === 'function') {
        return await result.toArray();
    }

    return result;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
