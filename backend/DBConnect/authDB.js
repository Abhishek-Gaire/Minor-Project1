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
  try {
    // Retrieve user data from the database by email
    const user = await Users.findOne({ email });

    // If user exists, return user data
    if (user) {
        return user;
    } else {
        // If user does not exist, return null
        return null;
    }
  } catch (error) {
    // Handle any errors
    console.error("Error fetching user by email:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
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