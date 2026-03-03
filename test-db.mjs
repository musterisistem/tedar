import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://musterisistem_db_user:DELAmPBdqrDHI4k1@dorteltedarik.ysqtiqi.mongodb.net/dortel-db?retryWrites=true&w=majority";

async function run() {
    try {
        console.log("Connecting...");
        const client = new MongoClient(uri);
        await client.connect();
        console.log("Connected successfully!");
        await client.close();
    } catch (err) {
        console.error("Connection failed:");
        console.error(err);
    }
}

run();
