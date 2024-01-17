const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { MongoClient } = require("mongodb");
const { parse } = require("querystring");

const mongourl = "mongodb://localhost:27017";
const serveFile = async (filePath, contentType, response) => {
  const rawData = await fsPromises.readFile(
    filePath,
    !contentType.includes("image") ? "utf8" : ""
  );
  const data =
    contentType === "application/json" ? JSON.parse(rawData) : rawData;
  response.writeHead(filePath.includes("404.html") ? 404 : 200, {
    "Content-Type": contentType,
  });
  response.end(
    contentType === "application/json" ? JSON.stringify(data) : data
  );
};

//serve static files
const server = http.createServer((req, res) => {
  const extension = path.extname(req.url);
  let contentType;
  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;
    case ".js":
      contentType = "application/javascript";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".jpg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".txt":
      contentType = "text/plain";
      break;
    case ".ejs":
      contentType = "text/html";
      break;
    default:
      contentType = "text/html";
  }
  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "index.ejs")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, req.url, "index.ejs")
      : contentType === "text/html"
      ? path.join(__dirname, "html", req.url)
      : //default
        path.join(__dirname, req.url);
  // makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") filePath += ".ejs";

  //fileExists or not
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    //serve the file
    serveFile(filePath, contentType, res);
  }
  // connect to MongoDB's URL\ localhost
  const client = new MongoClient(mongourl);
  // POST request handling
  if (req.method === "POST" && req.url === "/log") {
    let requestBody = "";
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });
    req.on("end", async () => {
      const formData = parse(requestBody);

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
        // Insert the new users document into MongoDB's collection
        await collection.insertOne(newUser);
        res.writeHead(302, {
          Location: "/html/log.html#login",
        });
        res.end();
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } finally {
        await client.close();
        // serveFile(filePath, contentType, res);
      }
    });
  }
  // Get the database collection
  const collection = client.db("Project").collection("models");

  // Find all documents in the collection
  collection.find({}).toArray((err, documents) => {
    if (err) throw err;

    // Render the EJS template with the data
    ejs.renderFile("./index.ejs", { data: documents }, (err, html) => {
      if (err) throw err;

      // Replace the contents of the div with the class "database" with the rendered HTML
      const databaseDiv = document.querySelector(".models");
      databaseDiv.innerHTML = html;
    });
  });
});
server.setMaxListeners(100);
const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
