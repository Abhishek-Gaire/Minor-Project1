import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();

let db = null; // Holds the database connection
let client = null; // MongoDB client instance

/**
 * Connects to the MongoDB database.
 * @param {string} dbName - Name of the database to connect to.
 * @returns {Promise<Db>} - The database instance.
 */

const connectToDB = async (dbName = "Project") => {
  if (!process.env.CONNECTION_STRING) {
    throw new Error("CONNECTION_STRING environment variable is not set.");
  }

  if (!client) {
    client = new MongoClient(process.env.CONNECTION_STRING);
  }

  try {
    if (!client.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB");
    }

    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    throw err;
  }
};

/**
 * Closes the MongoDB connection.
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  if (client) {
    try {
      await client.close();
      console.log("MongoDB connection closed.");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err.message);
    } finally {
      db = null;
      client = null;
    }
  }
};

/**
 * Retrieves the current database instance.
 * @returns {db | null} - The connected database instance, or null if not connected.
 */
const getDB = () => {
  if (!db) {
    throw new Error(
      "Database is not connected. Please call connectToDB first."
    );
  }
  return db;
};

export { connectToDB, closeDB, getDB };
