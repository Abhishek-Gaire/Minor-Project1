
import fsPromises from  "fs/promises";
// import fs from "fs"

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
        // console.log(contentType)
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

export {serveFile};