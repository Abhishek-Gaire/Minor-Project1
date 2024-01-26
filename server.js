const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const signUP = require("./backend/script/signup.js");
const Login = require("./backend/script/login.js");
const renderHTML = require("./backend/script/renderModels.js");
const {
  connectToModelsDB,
  closeModelsDB,
  getModelsDB,
  getCollectionName,
} = require("./backend/DBConnect/modelsDB.js");
const {
  connectToAuthDB,
  closeAuthDB,
  Users,
  getAuthDB,
} = require("./backend/DBConnect/authDB.js");

const serveFile = async (filePath, contentType, response) => {
  const validContentTypes = [
    "text/plain",
    "text/html",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/css",
    "application/javascript",
  ];

  if (!validContentTypes.includes(contentType)) {
    console.error(`Invalid content type: ${contentType}`);
    response.writeHead(400, {
      "Content-Type": "text/plain",
    });
    response.end("Bad Request");
    return;
  }

  // Check if Models Database is connected
  if (!getModelsDB) {
    //if not connected, try connecting
    try {
      await connectToModelsDB();
    } catch (err) {
      // If connection fails, handle the server
      response.writeHead(500, { contentType: "text/plain" });
      response.end("Cant connect to Models Databse");
      console.log(err);
      return;
    }
  }

  //check if the auth database is connected
  if (!getAuthDB) {
    try {
      await connectToAuthDB();
    } catch (err) {
      response.writeHead(500, { contentType: "text/palin" });
      response.end("Cant connect to auth database");
      console.log(err);
      return;
    }
  }
  try {
    if (
      contentType === "text/html" &&
      path.basename(filePath) === "index.ejs"
    ) {
      const collection = getCollectionName();
      renderHTML(response, collection, filePath);
    } else {
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
    }
  } catch (err) {
    console.error(err);
    response.writeHead(500, {
      "Content-Type": "text/plain",
    });
    response.end("Internal Server Error");
  }
};

//serve static files
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0]; // Remove query parameters for simplicity
  const extension = path.extname(urlPath);
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
      ? path.join(__dirname, req.url)
      : //default
        path.join(__dirname, req.url);
  console.log(filePath);
  // makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") filePath += ".html";

  //fileExists or not
  const fileExists = await fsPromises
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  if (fileExists) {
    //serve the file
    serveFile(filePath, contentType, res);
  }

  // POST request handling
  if (req.method === "POST" && req.url === "/signup") {
    signUP(req, res);
  } else if (req.method === "POST" && req.url === "/login") {
    Login(req, res);
  }
});

const PORT = process.env.PORT || 5173;
// Connect to Models Database when the server starts
connectToModelsDB().then(() => {
  //Start the server once Models Database is connected
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    //const collection = getCollectionName();
    //console.log(collection);
  });
});

// Connect to Auth Database when the server starts
connectToAuthDB().then(() => {
  console.log("Connected to Auth Database");
});

// Handles server shutdown to close the Models and Auth Database Connection
process.on("exit", async () => {
  await closeModelsDB();
  await closeAuthDB();
  console.log("Server Shutting Down");
});

process.on("SIGINT", async () => {
  await closeModelsDB();
  await closeAuthDB();
  process.exit();
});

process.on("SIGTERM", async () => {
  await closeModelsDB();
  await closeAuthDB();
  process.exit();
});
