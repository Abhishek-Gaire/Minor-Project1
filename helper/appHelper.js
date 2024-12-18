import path from "path";
import fsPromises from "fs/promises";
import { parse } from "querystring";
import ejs from "ejs";

const __dirname = path.resolve();

/**
 * Serves a file to the response with the appropriate content type.
 * @param {string} filePath - The path to the file to serve.
 * @param {string} contentType - The MIME type of the file.
 * @param {http.ServerResponse} response - The HTTP response object.
 */

const serveFile = async (filePath, contentType, response) => {
  try {
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") && contentType !== "model/gltf-binary"
        ? "utf8"
        : null
    );

    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "Content-Type": contentType,
    });
    response.end(rawData);
  } catch (err) {
    console.error(`Error serving file: ${filePath}\n`, err.message);
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.end("Internal Server Error");
  }
};

/**
 * Maps file extensions to content types.
 * @param {string} extension - The file extension.
 * @returns {string} - The corresponding content type or null if unsupported.
 */
const getContentType = (extension) => {
  const contentTypeMap = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".JPG": "image/jpeg",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".glb": "model/gltf-binary",
  };
  return contentTypeMap[extension] || null;
};

/**
 * Serves a static file based on the request and file path.
 * @param {http.IncomingMessage} req - The HTTP request object.
 * @param {http.ServerResponse} res - The HTTP response object.
 * @param {string} filePath - The file path to serve.
 */
const serveStaticFile = async (req, res, filePath) => {
  const extension = path.extname(filePath);
  const contentType = getContentType(extension);

  if (!contentType) {
    res.writeHead(415, { "Content-Type": "text/plain" });
    res.end(`Unsupported file type: ${extension}`);
    return;
  }

  await serveFile(filePath, contentType, res);
};

/**
 * Renders an EJS template and sends the response.
 * @param {http.ServerResponse} res - The HTTP response object.
 * @param {string} templatePath - The path to the EJS template.
 * @param {Object} message - Data to be injected into the template.
 */
const renderPage = async (res, templatePath, message) => {
  try {
    const filePath = path.join(__dirname, templatePath);
    const fileData = await fsPromises.readFile(filePath, "utf8");
    const renderedHTML = ejs.render(fileData, message);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(renderedHTML);
  } catch (err) {
    console.error(`Error rendering template: ${templatePath}\n`, err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};

/**
 * Parses form data from an HTTP request.
 * @param {http.IncomingMessage} req - The HTTP request object.
 * @returns {Promise<Object>} - Parsed form data as an object.
 */
const parseFormData = async (req) => {
  return new Promise((resolve, reject) => {
    let requestBody = "";
    const timeout = setTimeout(
      () => reject(new Error("Request timed out")),
      5000
    ); // Timeout in 5 seconds

    req.on("data", (chunk) => {
      requestBody += chunk.toString();
    });

    req.on("end", () => {
      clearTimeout(timeout);
      try {
        const formData = parse(requestBody);
        resolve(formData);
      } catch (err) {
        reject(new Error("Failed to parse form data"));
      }
    });

    req.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};
export { serveStaticFile, renderPage, parseFormData };
