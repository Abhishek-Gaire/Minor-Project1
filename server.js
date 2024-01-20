const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const signUP = require("./script/signup");
const renderHTML = require("./script/loadHomePage");

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

  try {
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
  } catch (err) {
    console.error(err);
    response.writeHead(500, {
      "Content-Type": "text/plain",
    });
    response.end("Internal Server Error");
  }
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

  // POST request handling
  if (req.method === "POST" && req.url === "/log") {
    if (!res.headersSent) {
      signUP(req, res);
    }
  }

  // Handle rendering the homepage
  if (
    (req.url === "/",
    async (req, res) => {
      try {
        await renderHTML(res);
      } catch (err) {
        console.err(err);
        res.status(500), send("Internal Server Error");
      }
    })
  );
});

server.setMaxListeners(100);
const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
