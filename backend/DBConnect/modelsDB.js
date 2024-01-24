const { MongoClient, ObjectID } = require("mongodb");
const mongourl = "mongodb://localhost:27017";
const dbName = "Project";

let db;
const connectToModelsDB = async () => {
  try {
    const client = await MongoClient.connect(mongourl);
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
const collection = db.collection("Models");
module.exports = {
  connectToModelsDB,
  closeModelsDB,
  collection,
  getModelsDB: () => db,
};
