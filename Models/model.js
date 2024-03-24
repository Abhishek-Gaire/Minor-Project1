import {db} from "../helper/database.js";

const getCollectionName = () => {
  const collection = db.collection("Models");
  return collection;
};

export {
  getCollectionName,
};
