const { connectToMongoDB, getClient } = require("./mongoConnect");

connectToMongoDB();
const client = getClient();
const collection = client.db("Project").collection("Models");

module.exports = collection;
