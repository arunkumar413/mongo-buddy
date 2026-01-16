// Native fetch is available in Node.js 18+

const API_URL = 'http://localhost:3001/api';

async function testBackend() {
    try {
        console.log('Testing Backend...');

        // 1. Connect (using a public test DB or local if available, but let's try a mock connection string that might fail but test the endpoint)
        // We'll assume the user has a local mongo running or we can mock the success if we can't really connect.
        // For this test, let's just check if the server is up and responds to a bad request.

        const connectRes = await fetch(`${API_URL}/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uri: 'mongodb://localhost:27017' })
        });

        console.log('Connect Status:', connectRes.status);
        const connectData = await connectRes.json();
        console.log('Connect Response:', connectData);

        // If connection failed (likely in this env), we can't test other endpoints fully, 
        // but we verified the server is running and routing requests.

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testBackend();
