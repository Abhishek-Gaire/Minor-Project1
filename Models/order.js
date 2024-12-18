import { db } from "../helper/database.js";

// Generic helper to retrieve a collection
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// Retrieve order by email
const getOrderByEmail = async (ordersCollection, email) => {
  try {
    const order = await ordersCollection.findOne({ email });
    return order || null; // Return order if found, otherwise null
  } catch (error) {
    console.error(`Error fetching order by email (${email}):`, error);
    throw new Error("Unable to fetch order by email.");
  }
};

export { getCollection, getOrderByEmail };
