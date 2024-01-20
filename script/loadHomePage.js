const ejs = require("ejs");
const { connectToMongoDB, closeMongoDB, getClient } = require("./db");

const renderHTML = async (res) => {
  try {
    connectToMongoDB();
    const client = getClient();
    const collection = client.db("Project").collection("Models");

    // Retrieve all documents from the users collection
    const documents = await collection.find({}).toArray();

    // Extract the 'name' values from the documents
    const names = documents.map((doc) => doc.name);

    // Render the EJS template with the 'data' object containing the 'names' array
    const html = await ejs.renderFile("index.ejs", { data: names });

    // Send the rendered HTML to the client
    res.send(html);
  } catch (err) {
    console.error(err);
  } finally {
    closeMongoDB();
  }
};

module.exports = renderHTML;
