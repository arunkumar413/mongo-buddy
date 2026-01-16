const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let client = null;
let activeDb = null;

// Middleware to check if connected
const requireConnection = (req, res, next) => {
    if (!client) {
        return res.status(400).json({ error: 'Not connected to any database' });
    }
    next();
};

app.post('/api/connect', async (req, res) => {
    const { uri } = req.body;
    if (!uri) {
        return res.status(400).json({ error: 'URI is required' });
    }

    try {
        if (client) {
            await client.close();
        }
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        res.json({ success: true, message: 'Connected successfully' });
    } catch (error) {
        console.error('Connection failed:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/databases', requireConnection, async (req, res) => {
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

app.get('/api/collections/:dbName', requireConnection, async (req, res) => {
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

app.get("/api/fields/:dbName/:collectionName", async (req, res) => {
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

app.post('/api/execute', requireConnection, async (req, res) => {
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
    // Basic parsing logic
    // Expected format: db.collection.find(...) or db.collection.aggregate(...)

    // Remove 'db.' prefix if present
    const cleanQuery = queryStr.trim();

    // Regex to extract collection name and operation
    const match = cleanQuery.match(/^db\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\((.*)\)$/s);

    if (!match) {
        throw new Error('Invalid query format. Use db.collection.operation(...)');
    }

    const [, collectionName, operation, argsStr] = match;
    const collection = db.collection(collectionName);

    if (typeof collection[operation] !== 'function') {
        throw new Error(`Operation ${operation} not supported on collection`);
    }

    // Parse arguments
    // This is the tricky part. We need to safely evaluate the arguments string to JSON/Objects.
    // For now, we'll use a safer evaluation approach or JSON.parse if possible, 
    // but MongoDB queries often contain non-JSON types like ObjectId, ISODate, etc.
    // For this MVP, we will use `eval` with a restricted context or a library if available.
    // Given the constraints and the "developer tool" nature, we'll use `new Function` with some context.

    const args = parseArgs(argsStr);

    let cursor = collection[operation](...args);

    // Handle cursor methods like .sort(), .limit(), .toArray() if they are chained
    // The current regex only captures the main call. 
    // To support chaining, we'd need a more robust parser.
    // For now, let's assume the user might want to see results, so if it's a cursor, we convert to array.

    if (cursor && typeof cursor.toArray === 'function') {
        const results = await cursor.toArray();
        return results;
    }

    return cursor;
}

function parseArgs(argsStr) {
    // This is a very naive parser. In a real app, use a proper JS parser.
    // We want to support objects like { name: "John" } which isn't strict JSON.
    try {
        // Wrap in array to handle multiple arguments
        // Replace common MongoDB types with placeholders or implementations if needed
        // For now, let's just try to evaluate it as JS code returning an array of args
        const func = new Function(`return [${argsStr}]`);
        return func();
    } catch (e) {
        console.error("Error parsing arguments:", e);
        throw new Error("Failed to parse query arguments. Ensure valid syntax.");
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
