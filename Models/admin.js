import { db } from "../helper/database.js";

// Generic helper to retrieve a collection
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// Retrieve an admin by email
const getAdminByEmail = async (adminCollection, email) => {
  try {
    const admin = await adminCollection.findOne({ email });
    return admin || null; // Return admin data if found, otherwise null
  } catch (error) {
    console.error(`Error fetching admin by email (${email}):`, error);
    throw new Error("Unable to fetch admin by email.");
  }
};

export { getCollection, getAdminByEmail };
