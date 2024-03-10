const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
require("dotenv").config();

const routes = require("./helper/routes.js");
const {
  connectToModelsDB,
  closeModelsDB,
} = require("./backend/DBConnect/modelsDB.js");
const {
  connectToAuthDB,
  closeAuthDB,
} = require("./backend/DBConnect/authDB.js");
const serveFile = require("./helper/serveFile.js");

//create a server
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0]; // Remove query parameters for simplicity
  const parsedUrl = url.parse(req.url);
  
  const {pathname } = parsedUrl;
  const {method} = req;
  // Check if the method exists in routes
  if (routes[method]) {
        
    // Check if the URL exists in routes[method]
    const handler = routes[method][pathname];
    if (handler) {
      // If the handler exists, call it passing req and res
      return handler(req, res);
    }
  }

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
  }
  let filePath =path.join(__dirname, req.url);

  //fileExists or not
  const fileExists = await fsPromises
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  console.log(fileExists,filePath);
  if (fileExists) {
    //serve static file
    serveFile(filePath, contentType, res);
  }
});

const PORT = process.env.PORT || 3000;
// Connect to Models Database when the server starts
connectToModelsDB().then(() => {
  //Start the server once Models Database is connected
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
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
