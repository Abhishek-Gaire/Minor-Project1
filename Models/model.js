import { ObjectId } from "mongodb";
import { db } from "../helper/database.js";

// Generic helper to retrieve a collection
const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// Retrieve a model by ID
const getDataById = async (modelsCollection, id) => {
  try {
    const data = await modelsCollection.findOne({ _id: new ObjectId(id) });
    return data || null; // Return the data if found, otherwise null
  } catch (error) {
    console.error(`Error fetching data by ID (${id}):`, error);
    throw new Error("Unable to fetch data by ID.");
  }
};

// Create a new model
const createModel = async (modelsCollection, modelData) => {
  try {
    const result = await modelsCollection.insertOne(modelData);
    return result.insertedId; // Return the ID of the newly created model
  } catch (error) {
    console.error("Error creating model:", error);
    throw new Error("Unable to create model.");
  }
};

export { getCollection, getDataById, createModel };
