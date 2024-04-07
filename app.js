import http from "http";
import { URL } from "url";
import path from "path";

import dotenv from "dotenv";

import { connectToDB, closeDB } from "./helper/database.js";
import { serveStaticFile } from "./helper/appHelper.js";
import { routes } from "./helper/routes.js";
import { extractTokenFromCookie,authenticateUser } from "./middleware/userAuth.js";
import {extractAdminTokenFromCookie,authenticateAdmin}  from './middleware/adminAuth.js';

dotenv.config();

const __dirname = path.resolve();

const server = http.createServer(async (req, res) => {
    
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = parsedUrl;
    const { method } = req;
    
    if (method === 'GET'){ 
        if(pathname ==="/modelview" ||  pathname=="/" || pathname==="/book-car"){
            console.log(`Inside GET and ${pathname}`);
            return await extractTokenFromCookie(req, res, async () =>  {
                // console.log(req.token)
                return await authenticateUser(req, res, async () => {
                    // console.log(req.user);
                    return await routes[method][pathname](req, res);       
                });
            })
        }
        else if(pathname === "/admin" || pathname ==="/admin/dashboard" || pathname === "/admin/addVehicles" || pathname === "/admin/cars" || pathname === "/admin/manageUsers" || pathname === "/admin/bookedVehicles")
        {
            console.log(`Inside GET and ${pathname}`);
            return await extractAdminTokenFromCookie(req,res,async() =>{
                return await authenticateAdmin(req,res,async() => {
                    return await routes[method][pathname](req,res);
                })
            })
        } else if(routes[method] && routes[method][pathname]){
            return await routes[method][pathname](req, res);
        }
    }
    else {
        if(pathname === "/logout"){
            console.log("inside post and /logout")
            return await extractTokenFromCookie(req, res, async () =>  {
                // console.log(req.token)
                return await authenticateUser(req, res, async () => {
                    // console.log(req.user);
                    return await routes[method][pathname](req, res);       
                });
            })
        } else if(routes[method] && routes[method][pathname]){
            return await routes[method][pathname](req, res);
        }
    }
    let filePath;
    if(pathname.startsWith("/admin")){
        let newPathname; 
        newPathname = pathname.replace(/\/admin/, "");
        filePath = path.join(__dirname ,newPathname);
        return await serveStaticFile(req, res, filePath);
    }
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
