import { ObjectId } from "mongodb";
import {db} from "../helper/database.js";


const getCollectionName = () => {
  const collection = db.collection("Models");
  return collection;
};

const getDataById = async(collection,id) => {
  return await collection.findOne({_id: new ObjectId(id)});
}

const createModel = async (collection, modelData) => {
  return collection.insertOne(modelData);
};
export {
  getCollectionName,getDataById, createModel
};
