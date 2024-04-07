import { MongoClient } from "mongodb";
import  { config } from "dotenv"
config();

const dbName = "Project";

let db;

const client = new MongoClient(process.env.CONNECTION_STRING);

const connectToDB = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    
    console.log("Connected to Database");
    return db;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const closeDB = async () => {
  if (db) {
    await db.client.close();
    console.log("Database Connection Closed");
  }
};


export { connectToDB, closeDB,db };