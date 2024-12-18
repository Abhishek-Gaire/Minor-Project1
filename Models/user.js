import { ObjectId } from "mongodb";
import { db } from "../helper/database.js";

// Helper function to get a collection
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// Retrieve user by email
const getUserByEmail = async (users, email) => {
  try {
    const user = await users.findOne({ email });
    return user || null; // Return user if found, otherwise null
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Unable to fetch user by email.");
  }
};

// Create a new user
const createUser = async (users, userData) => {
  try {
    const result = await users.insertOne(userData);
    return result.insertedId; // Return the ID of the newly created user
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Unable to create user.");
  }
};

// Retrieve user by token
const getUserByToken = async (users, token) => {
  try {
    const user = await users.findOne({ resetToken: token });
    return user || null; // Return user if found, otherwise null
  } catch (error) {
    console.error("Error fetching user by token:", error);
    throw new Error("Unable to fetch user by token.");
  }
};

// Add or update a token for a user
const addToken = async (users, token, userId) => {
  try {
    const userID = new ObjectId(userId);
    const result = await users.updateOne(
      { _id: userID },
      { $set: { resetToken: token } },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0; // Return true if successful
  } catch (error) {
    console.error("Error adding token:", error);
    throw new Error("Unable to add token to user.");
  }
};

// Retrieve user by ID
const getUserByID = async (users, userId) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });
    return user || null; // Return user if found, otherwise null
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Unable to fetch user by ID.");
  }
};
export {
  getCollection,
  getUserByEmail,
  createUser,
  getUserByID,
  addToken,
  getUserByToken,
};
