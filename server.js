const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const connectDB = require("./script/db");

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
    default:
      contentType = "text/html";
  }
  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "html", req.url)
      : //default
        path.join(__dirname, req.url);
  // makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") filePath += ".html";

  //fileExists or not
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    //serve the file
    serveFile(filePath, contentType, res);
  }
  // POST request handling
  server.on("request", (req, res) => {
    if (req.method === "POST" && req.url === "/log") {
      try {
        connectDB(req, res);
        serveFile(filePath, contentType, res);
      } catch (err) {
        console.err(err);
      }
    }
  });
});
const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
