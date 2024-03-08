const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
require("dotenv").config();


const {getSignUP,postSignUP} = require("./backend/controllers/signup.js");
const {getLogin,postLogin} = require("./backend/controllers/login.js");
const {
  connectToModelsDB,
  closeModelsDB,
} = require("./backend/DBConnect/modelsDB.js");
const {
  connectToAuthDB,
  closeAuthDB,
} = require("./backend/DBConnect/authDB.js");
const serveFile = require("./helper/serveFile.js");
const verify= require("./backend/controllers/verification.js");
const {getReset,postReset} = require("./backend/controllers/resetpassword.js");
const renderVehicles = require("./backend/renderScript/renderVehicles.js");

//serve static files
const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0]; // Remove query parameters for simplicity
  
  const parsedUrl = url.parse(req.url);
  const { pathname, query } = parsedUrl;

  if (req.method === "POST") {
    if (req.url === "/signup") {
        return postSignUP(req, res);
    } else if (req.url === "/login") {
        return postLogin(req, res);
    } else if (req.url === "/verify") {
        return verify(req, res);
    } else if (req.url === "/reset-password") {
        return postReset(req, res);
    }
  } else if (req.method === "GET") {
    if (req.url === "/signup") {
        return getSignUP(req, res);
    } else if (req.url === "/login") {
        return getLogin(req, res);
    } else if (req.url === "/forgot-password") {
        return getReset(req, res);
    } else if (pathname === "/reset-password/:token") {
        return getNewPassword(req, res);
    } else if(req.url === "/vehicles"){
      return renderVehicles(req,res);
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
      ? path.join(__dirname,"views", "page","index.ejs")
        : contentType === "text/html" && req.url==="/vehicles.ejs"
          ? path.join(__dirname,"/ejs", req.url)
          : contentType === "text/html" && req.url === "/admin"
            ? path.join(__dirname, "/ejs", req.url)
              : //default
              path.join(__dirname, req.url);

  //fileExists or not
  const fileExists = await fsPromises
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
  console.log(fileExists,filePath);
  if (fileExists) {
    //serve the file
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
