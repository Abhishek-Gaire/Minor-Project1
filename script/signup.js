const { parse } = require("querystring");
const { connectToMongoDB, closeMongoDB, getClient } = require("./mongoConnect");

const signUP = async (req, res) => {
  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk.toString();
  });
  req.on("end", async () => {
    const formData = parse(requestBody);

    try {
      connectToMongoDB();
      const client = getClient();
      const db = client.db("signupForm");
      const collection = db.collection("users");

      // Create a new user document
      const newUser = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      // Insert the new user document into MongoDB's collection
      await collection.insertOne(newUser);

      // Set the response headers and status code
      res.writeHead(302, {
        Location: "/html/log.ejs",
      });
      res.end();
    } catch (err) {
      // Set the response headers and status code for error cases
      console.log(err);
      // res.writeHead(500, { ContentType: "text/plain" });
      // res.end("Internal Server Error");
    } finally {
      closeMongoDB();
    }
  });
};

module.exports = signUP;
