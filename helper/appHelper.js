import path from "path";
import fsPromises from "fs/promises";
import {parse} from "querystring"
import ejs from "ejs";


const __dirname = path.resolve();

const serveFile = async (filePath, contentType, response) => {
  const validContentTypes = [
      "text/plain",
      "application/json",
      "image/jpeg",
      "image/png",
      "image/ico",
      "text/css",
      "application/javascript",
  ];

  if (!validContentTypes.includes(contentType)) {
      console.error(`Invalid content type: ${contentType}`);
      response.writeHead(400, {
          "Content-Type": "text/plain",
      });
      response.end(`Cant load this file with extension:${contentType}`);
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

const getContentType = (extension) => {
  const contentTypeMap = {
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".jpg": "image/jpeg",
      ".JPG":"image/jpeg",
      ".png": "image/png",
      ".ico":"image/ico",
  };
  return contentTypeMap[extension] 
  // || "application/octet-stream";
};

const serveStaticFile = async (req, res, filePath) => {
  try {
    const extension = path.extname(filePath);
    const contentType = getContentType(extension);
    await serveFile(filePath, contentType, res);
  } catch (err) {
    res.statusCode = 404;
    res.end();
  }
};

const renderPage = async(res,templatePath,message) =>{
  const filePath = path.join(__dirname, templatePath);
  
  const fileData = await fsPromises.readFile(filePath,"utf8");
  const renderedHTML = ejs.render(fileData,message);

  return res.end(renderedHTML);
}

const parseFormData = async (req) => {
  return new Promise((resolve, reject) => {
    let requestBody = "";
    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });
    req.on("end", () => {
      const formData = parse(requestBody);
      resolve(formData);
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
};
export {serveStaticFile,renderPage,parseFormData};