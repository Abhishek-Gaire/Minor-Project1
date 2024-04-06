import { ObjectId } from "mongodb";
import {db} from "../helper/database.js";


const getAdminCollectionName = () => {
  const collection = db.collection("Admin");
  return collection;
};

const getAdminByEmail = async (collection, email) => {
    try {
      // Retrieve user data from the database by email
      const user = await collection.findOne({ email }) || null;
      
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
export {
  getAdminCollectionName,getAdminByEmail
};
