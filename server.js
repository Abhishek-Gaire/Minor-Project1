const http = require("http");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const { parse } = require("querystring");
const bodyParser = require("body-parser");

const mongourl = "mongodb://localhost/27017";

//serve html form on GET request
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    fs.readFile(__dirname + "/index.html", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.method === "POST" && req.url === "/signup") {
    //Handle post request when post is submmitted
    let requestBody = "";
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });
    req.on("end", async () => {
      const formData = parse(requestBody);

      //Connect to MongoDB
      const client = new MongoClient(mongourl, {
        useNewUrlParser: true,
      });
      try {
        await client.connect();
        const db = client.db("signupForm");
        const collection = db.collection("users");

        // Create a new user document
        const newUser = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        // insert the new user document into MongoDB's collection
        await collection.insertOne(newUser);

        res.writeHead(302, { Location: "/login.html" });
        res.end();
      } catch (err) {
        console.err(err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } finally {
        // Close the Mongo DB connection
        await client.close();
      }
    });
  } else if (req.method === "GET" && req.url === "/login.html") {
    fs.readFile(__dirname + "/login.html", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 error");
  }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
