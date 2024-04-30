import http from "http";
import { URL } from "url";
import path from "path";

import dotenv from "dotenv";

import { connectToDB, closeDB } from "./helper/database.js";
import { serveStaticFile } from "./helper/appHelper.js";
import { routes } from "./Routes/routes.js";

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
            return  await extractTokenFromCookie(req, res, async () =>  {
                return await authenticateUser(req, res, async () => {
                    return await routes[method][pathname](req, res);       
                });
            })
        }
        else if(pathname === "/admin" || pathname ==="/admin/dashboard" || pathname === "/admin/addVehicles" || pathname === "/admin/cars" || pathname === "/admin/manageUsers" || pathname === "/admin/bookedVehicles" || pathname==="/admin/car-details" || pathname==="/adminLogout" || pathname === "/adminModelView" || pathname === "/admin/deleteModel" || pathname === "/admin/changeStatus" || pathname === "/admin/cancelModel" || pathname === "/admin/changeHomePage" || pathname === "/admin/addStocks" || pathname === "/admin/removeStocks")
        {
            console.log(`Inside GET and ${pathname}`);
            return await extractAdminTokenFromCookie(req,res,async() =>{
                return await authenticateAdmin(req,res,async() => {
                    return await routes[method][pathname](req,res);
                })
            })
        } else if(routes[method] && routes[method][pathname]){
            console.log(`Inside GET and ${pathname}`);
            return await routes[method][pathname](req, res);
        }
    }
    else {
        if(pathname === "/logout" || pathname === "/booking" || pathname === "/confirmBookCar"){
            console.log(`inside post and ${pathname}`)
            return await extractTokenFromCookie(req, res, async () =>  {
                return await authenticateUser(req, res, async () => {
                    return await routes[method][pathname](req, res);       
                });
            })
        } else if(pathname === "/addVehicles" || pathname === "/editVehicles"){
            console.log(`inside post and ${pathname}`)
            return await extractAdminTokenFromCookie(req, res, async () =>  {
                return await authenticateAdmin(req, res, async () => {
                    return await routes[method][pathname](req, res);       
                });
            })
        }
        else if(routes[method] && routes[method][pathname]){
            console.log(`Inside POST and ${pathname}`);
            return await routes[method][pathname](req, res);
        }
    }
    
    let filePath;
    filePath = path.join(__dirname ,pathname);
    await serveStaticFile(req, res, filePath);
});

const PORT =  process.env.PORT || 5000;

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
