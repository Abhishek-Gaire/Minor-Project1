const { MongoClient, ObjectId } = require("mongodb");
const mongourl = "mongodb://localhost:27017";
const dbName = "Authorization";

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
const getCollectionName = () => {
  const collection = db.collection("users");
  return collection;
};

const getUserByEmail = async (Users, email) => {
  return Users.findOne({ email });
};

const createUser = async (Users, userData) => {
  return Users.insertOne(userData);
};
const getUserByID = async (Users, userID) => {
  return Users.findOne({ _id: new ObjectId(userID) });
};
module.exports = {
  connectToAuthDB,
  closeAuthDB,
  getCollectionName,
  getUserByEmail,
  createUser,
  getUserByID,
  getAuthDB: () => db,
};
