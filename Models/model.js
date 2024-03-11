import {db} from "../helper/database.js";

// let db;
// db = dbFunctions.getDB();

const getCollectionName = () => {
  const collection = db.collection("Models");
  return collection;
};

export {
  getCollectionName,
};
