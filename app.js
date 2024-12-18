import http from "http";
import { URL } from "url";
import path from "path";

import dotenv from "dotenv";

import { connectToDB, closeDB } from "./helper/database.js";
import { serveStaticFile } from "./helper/appHelper.js";
import { routes } from "./Routes/routes.js";

import {
  extractTokenFromCookie,
  authenticateUser,
} from "./middleware/userAuth.js";
import {
  extractAdminTokenFromCookie,
  authenticateAdmin,
} from "./middleware/adminAuth.js";

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// Middleware function for handling user authentication
const userMiddleware = async (req, res, next) => {
  try {
    await extractTokenFromCookie(req, res, async () => {
      await authenticateUser(req, res, next);
    });
  } catch (err) {
    console.error("User authentication failed:", err);
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
  }
};

// Middleware function for handling admin authentication
const adminMiddleware = async (req, res, next) => {
  try {
    await extractAdminTokenFromCookie(req, res, async () => {
      await authenticateAdmin(req, res, next);
    });
  } catch (err) {
    console.error("Admin authentication failed:", err);
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
  }
};

// Centralized route handler
const handleRoute = async (req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://${req.headers.host}`);
  const { pathname } = parsedUrl;

  const routeHandler = routes[method]?.[pathname];
  if (!routeHandler) {
    // If route not found, serve static files or return 404
    const filePath = path.join(__dirname, pathname);
    if (!(await serveStaticFile(req, res, filePath))) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
    return;
  }

  // Apply middleware based on the route type
  if (pathname.startsWith("/admin")) {
    await adminMiddleware(req, res, () => routeHandler(req, res));
  } else if (pathname.startsWith("/")) {
    await userMiddleware(req, res, () => routeHandler(req, res));
  } else {
    await routeHandler(req, res);
  }
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    await handleRoute(req, res);
  } catch (err) {
    console.error("Server Error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

// Start the server
connectToDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Graceful shutdown
const handleShutdown = async () => {
  try {
    await closeDB();
    console.log("Database connection closed. Server shutting down...");
  } catch (err) {
    console.error("Error during shutdown:", err);
  } finally {
    process.exit();
  }
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
