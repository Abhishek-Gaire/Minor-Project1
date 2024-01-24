const { MongoClient, ObjectId } = require("mongodb");
const mongourl = "mongodb://localhost:27017";
const dbName = "authDB";

let db;

const connectToAuthDB = async () => {
  try {
    const client = await MongoClient.connect(mongourl);
    db = client.db(dbName);
    console.log("Connected to Authentication Database");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const closeAuthDB = async () => {
  if (db) {
    await db.client.close();
    console.log("Authentication Database Closed");
  }
};

const Users = db.collection("Users");

module.exports = { connectToAuthDB, closeAuthDB, Users, getAuthDB: () => db };
