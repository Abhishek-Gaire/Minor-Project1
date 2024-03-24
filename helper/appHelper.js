import path from "path";

import {serveFile} from "./serveFile.js";
const getContentType = (extension) => {
  const contentTypeMap = {
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".jpg": "image/jpeg",
      ".png": "image/png",
  };
  return contentTypeMap[extension] || "application/octet-stream";
};

const serveStaticFile = async (req, res, filePath) => {
  try {
    const extension = path.extname(filePath);
    // console.log(
    //   "Inside ServeStaticFile",
    //   `Requested File: ${filePath}, Extension: ${extension}`
    // )
    const contentType = getContentType(extension);
    await serveFile(filePath, contentType, res);
  } catch (err) {
    res.statusCode = 404;
    res.end();
  }
};

export {serveStaticFile};