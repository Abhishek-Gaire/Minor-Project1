const { MongoClient } = require("mongodb");

const mongourl = "mongodb://localhost:27017";
const client = new MongoClient(mongourl);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Propagate the error to handle it elsewhere
  }
}

async function closeMongoDB() {
  try {
    await client.close();
    console.log("Closed MongoDB connection");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error; // Propagate the error to handle it elsewhere
  }
}

module.exports = { connectToMongoDB, closeMongoDB, getClient: () => client };
