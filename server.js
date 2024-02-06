const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const signUP = require("./backend/script/signup.js");
const Login = require("./backend/script/login.js");
const {
  connectToModelsDB,
  closeModelsDB,
} = require("./backend/DBConnect/modelsDB.js");
const {
  connectToAuthDB,
  closeAuthDB,
} = require("./backend/DBConnect/authDB.js");
const serveFile = require("./backend/script/serveFile.js")


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
        // : contentType === "text/html" && req.url === "/admin"
        //   ? path.join(__dirname, "/admin.ejs")
        : contentType === "text/html"
          ? path.join(__dirname, req.url)
          : //default
          path.join(__dirname, req.url);
  // console.log(filePath);
  // console.log(path.basename(filePath))
  // makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") filePath += ".ejs";

  //fileExists or not
  const fileExists = await fsPromises
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  if (fileExists) {
    // console.log(fileExists)
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
