const { MongoClient, ObjectId } = require("mongodb");
const mongourl = "mongodb://localhost:27017";
const dbName = "Authorization";

let db;

const connectToAuthDB = async () => {
  try {
    const client = await MongoClient.connect(mongourl);
    db = client.db(dbName);
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
  return db.collection("users");
};

const getUserByEmail = async (Users, email) => {
  try {
    // Retrieve user data from the database by email
    const user = await Users.findOne({ email }) || null;

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
const getUserByToken = async(Users,token) => {
  return Users.findOne({ resetToken:token });
}


const addToken = async (token,users, userId) => {
  try {
    const userID = new ObjectId(userId);
    // Update the user document where the userId matches
    await users.updateOne({_id:userID},{ $set: { resetToken: token } },{ upsert: true });
    console.log("Update Successful");
    return true;    
  } catch (error) {
    // An error occurred during the update
    console.error("Error adding token:", error);
    return false;
  }
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
  addToken,
  getUserByToken,
  getAuthDB: () => db,
};
