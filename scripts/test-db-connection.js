import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
    const envLocal = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envLocal) {
        process.env[k] = envLocal[k];
    }
}

async function testConnection() {
    console.log("1. Starting DB Test...");
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("❌ ERROR: MONGODB_URI is undefined in .env");
        process.exit(1);
    }

    console.log(`2. URI found (starts with): ${uri.substring(0, 15)}...`);

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ 3. Connected to MongoDB successfully.");

        const db = client.db('dortel-db');
        const collection = db.collection('users');

        // Test Read
        const count = await collection.countDocuments();
        console.log(`ℹ️  4. Current User Count: ${count}`);

        // Test Write (Insert)
        const testUser = {
            email: `test_db_script_${Date.now()}@test.com`,
            name: "DB Script Test",
            role: "test",
            createdAt: new Date().toISOString()
        };

        const result = await collection.insertOne(testUser);
        console.log(`✅ 5. Inserted Test User: ${result.insertedId}`);

        // Test Read (Find)
        const foundUser = await collection.findOne({ _id: result.insertedId });
        if (foundUser) {
            console.log(`✅ 6. Found Inserted User: ${foundUser.email}`);
        } else {
            console.error("❌ 6. Could NOT find inserted user immediately after insert.");
        }

        // Clean up
        await collection.deleteOne({ _id: result.insertedId });
        console.log("✅ 7. Cleaned up test user.");

    } catch (error) {
        console.error("❌ ERROR during DB operations:", error);
    } finally {
        await client.close();
        console.log("8. Connection closed.");
    }
}

testConnection();
