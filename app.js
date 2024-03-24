import http from "http";
import { URL } from "url";
import path from "path";

import dotenv from "dotenv";

import { connectToDB, closeDB } from "./helper/database.js";
import { serveStaticFile } from "./helper/appHelper.js";
import { routes } from "./helper/routes.js";
import { extractTokenFromCookie,authenticateUser } from "./middleware/auth.js";
dotenv.config();

const __dirname = path.resolve();

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = parsedUrl;
    const { method } = req;
    // console.log(pathname)
    if (method === 'GET' && pathname ==="/modelview" ){
        console.log("Inside GET and modelview");
        return await extractTokenFromCookie(req, res, async () =>  {
            // console.log(req.token)
            return await authenticateUser(req, res, async () => {
                // console.log(req.user);
                return await routes[method][pathname](req, res);       
            });
        })
    } else if(method === "GET" && pathname==="/") {
        console.log("Inside GET and /");
        return await extractTokenFromCookie(req, res, async () =>  {
            // console.log(req.token)
            return await authenticateUser(req, res, async () => {
                // console.log(req.user);
                return await routes[method][pathname](req, res);       
            });
        })
    } else if (routes[method] && routes[method][pathname]) {
        // console.log(req.token);
        return await routes[method][pathname](req, res);
    }
    
    let filePath;
    filePath = path.join(__dirname ,pathname);
    await serveStaticFile(req, res, filePath);
});

const PORT = process.env.PORT || 3000;

connectToDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});

const handleShutdown = async () => {
    await closeDB().then(()=> {
        console.log("Server Shutting Down");
    });
    process.exit();
};

process.on("exit", handleShutdown);
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
