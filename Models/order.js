
import {db} from "../helper/database.js";

const getCounterCollectionName = () => {
  const collection = db.collection("Counters");
  return collection;
}
const getOrderCollectionName = () => {
  const collection = db.collection("Orders");
  return collection;
};

const getOrderByEmail = async (collection, email) => {
  try {
    // Retrieve user data from the database by email
    const order = await collection.findOne({ email }) || null;
      
    // If user exists, return user data
    if (order) {
      return order;
    } else {
      // If user does not exist, return null
      return null;
    }
  } catch (error) {
    // Handle any errors
    console.error("Error fetching order by email:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export {
  getOrderCollectionName,getOrderByEmail,getCounterCollectionName
};
