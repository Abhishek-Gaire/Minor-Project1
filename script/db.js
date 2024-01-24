const { MongoClient } = require("mongodb");
const { parse } = require("querystring");

const mongourl = "mongodb://localhost:27017";

const connectDB = async (req, res) => {
  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk.toString();
  });
  req.on("end", async () => {
    const formData = parse(requestBody);

    // connect to MongoDB's URL\ localhost
    const client = new MongoClient(mongourl, {
      useNewUrlParser: true,
    });
    try {
      await client.connect();
      const db = client.db("signupForm");
      const collection = db.collection("users");

      // Create a new user document
      const newUser = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      // Insert the new users document into MongoDB's collection

      await collection.insertOne(newUser);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } finally {
      await client.close();
    }
  });
};
module.exports = connectDB;

//   // Serve login.html file when redirected
//   else if (req.method === "GET" && req.url === "/login.html") {
//     fs.readFile(__dirname + "./html/log.html", "utf8", (err, data) => {
//       if (err) {
//         res.writeHead(500, { "content-Type": "text/plain" });
//         res.end("Internal Server Error");
//       } else {
//         res.writeHead(200, { "Content-Type": "text/html" });
//         res.end(data);
//       }
//     });
//   } else {
//     res.writeHead(404, { "Content-Type": "text/plain" });
//     res.end("404 error");
//   }
//else {
//   switch (path.parse(filePath).base) {
//     case "modelview.html":
//       res.writeHead(301, { Location: "/modelview.html" });
//       res.end();
//       break;
//     // case "/signup":
//     //   try {
//     //     connectDB(req, res);
//     //     res.writeHead(301, { Location: "/html/log.html" });
//     //     res.end();
//     //   } catch (err) {
//     //     console.err(err);
//     //   }
//     //   break;
//     default:
//       // serve a 404 response
//       serveFile(path.join(__dirname, "html", "404.html"), "text/html", res);
//   }
