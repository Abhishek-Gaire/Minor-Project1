import path from "path";
import fsPromises from "fs/promises";
import {parse} from "querystring"
import ejs from "ejs";

import {serveFile} from "./serveFile.js";

const __dirname = path.resolve();

const getContentType = (extension) => {
  const contentTypeMap = {
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".jpg": "image/jpeg",
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
  res.end(renderedHTML);
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