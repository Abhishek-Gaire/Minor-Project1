import { MongoClient } from "mongodb";

const mongourl = "mongodb://localhost:27017";
const dbName = "Project";

let db;

const client = new MongoClient(mongourl);
const connectToDB = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to Database");
    return db;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const closeDB = async () => {
  if (db) {
    await db.client.close();
    console.log("Database Connection Closed");
  }
};

// const getDB = () => {
//   if(db){
//       console.log(db);
//       return db;
//   } else{
//     console.log("No Database Found");
//   }
// }
// export const dbFunctions = {
//   getDB: () => db
// };
export { connectToDB, closeDB,db };