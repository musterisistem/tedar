import { MongoClient } from 'mongodb';

const uri = "mongodb://musterisistem_db_user:DELAmPBdqrDHI4k1@ac-sdvb7m0-shard-00-00.ysqtiqi.mongodb.net:27017,ac-sdvb7m0-shard-00-01.ysqtiqi.mongodb.net:27017,ac-sdvb7m0-shard-00-02.ysqtiqi.mongodb.net:27017/dortel-db?ssl=true&replicaSet=atlas-13ntrd-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
    try {
        console.log("Connecting directly using mongodb:// ...");
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
