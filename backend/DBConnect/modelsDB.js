const { MongoClient, ObjectID } = require("mongodb");

const mongourl = "mongodb://localhost:27017";
const dbName = "Project";

let db;
const client = new MongoClient(mongourl);
const connectToModelsDB = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to Models Database");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const closeModelsDB = async () => {
  if (db) {
    await db.client.close();
    console.log("Models Database Connection Closed");
  }
};

const getCollectionName = () => {
  const collection = db.collection("Models");
  return collection;
};
module.exports = {
  connectToModelsDB,
  closeModelsDB,
  getCollectionName,
  getModelsDB: () => db,
};
