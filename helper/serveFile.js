
const path = require("path");
const fsPromises = require("fs").promises;

const { getModelsDB, connectToModelsDB, getCollectionName } = require("../backend/DBConnect/modelsDB")
const { getAuthDB, connectToAuthDB } = require("../backend/DBConnect/authDB")

const renderHTML = require("../backend/renderScript/renderModels");
const renderVehicles = require("../backend/renderScript/renderVehicles");


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

    // Check if Models Database is connected
    if (!getModelsDB) {
        //if not connected, try connecting
        try {
            await connectToModelsDB();
        } catch (err) {
            // If connection fails, handle the server
            response.writeHead(500, { contentType: "text/plain" });
            response.end("Cant connect to Models Database");
            console.log(err);
            return;
        }
    }

    //check if the auth database is connected
    if (!getAuthDB) {
        try {
            await connectToAuthDB();
        } catch (err) {
            response.writeHead(500, { contentType: "text/plain" });
            response.end("Cant connect to auth database");
            console.log(err);
            return;
        }
    }
    try {
        // console.log(filePath);
        if (
            contentType === "text/html" &&
            path.basename(filePath) === "index.ejs"
        ) {
            const collection = getCollectionName();
            renderHTML(response, collection, filePath);
        }
        //  else if (contentType==="text/html" && path.basename(filePath) === "vehicles.ejs") {

        //     const collection = getCollectionName();
        //     renderVehicles(response,collection,filePath);
        // }
        // else if(contentType === "text/html" && path.basename(filePath) === "verify"){

        // }
        else {
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
        }
    } catch (err) {
        console.error(err);
        response.writeHead(500, {
            "Content-Type": "text/plain",
        });
        response.end("Internal Server Error");
    }
};

module.exports = serveFile;