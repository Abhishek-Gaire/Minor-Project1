import http from "http";
import { URL } from "url";
import path from "path";
import dotenv from "dotenv";
import { connectToDB, closeDB } from "./helper/database.js";
import { serveFile } from "./helper/serveFile.js";
import { routes } from "./helper/routes.js";

dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// console.log(__dirname);
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
        const contentType = getContentType(extension);
        serveFile(filePath, contentType, res);
    } catch (err) {
        res.statusCode = 404;
        res.end("File not found");
    }
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = parsedUrl;
    const { method } = req;

    if (routes[method] && routes[method][pathname]) {
      return routes[method][pathname](req, res);
    }

    let filePath;

    // Adjust file paths for assets and public files
    if (pathname.startsWith("/public")) {
        filePath = path.join(__dirname, pathname);
    } else if (pathname.startsWith("/assets")) {
        filePath = path.join(__dirname, pathname);
    }
    // Remove leading backslashes
    filePath = filePath.replace(/^\\/, '');

    await serveStaticFile(req, res, filePath);
});

const PORT = process.env.PORT || 3000;

connectToDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});

const handleShutdown = async () => {
    await closeDB();
    console.log("Server Shutting Down");
    process.exit();
};

process.on("exit", handleShutdown);
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
