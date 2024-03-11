import http from "http";
import url from "url";
import path from "path";
import fs from "fs";
import "dotenv/config";

import {routes} from "./helper/routes.js";
import {
  connectToDB,
  closeDB,
} from "./helper/database.js";

import {serveFile} from "./helper/serveFile.js";
const __dirname = path.resolve();
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
  const fileExists = await fs.promises
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
// Connect toDatabase when the server starts
connectToDB().then(() => {
  //Start the server once Database is connected
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
});

// Handles server shutdown to close the Database Connection
process.on("exit", async () => {
  await closeDB();
  console.log("Server Shutting Down");
});

process.on("SIGINT", async () => {
  await closeDB();
  process.exit();
});

process.on("SIGTERM", async () => {
  await closeDB();
  process.exit();
});
