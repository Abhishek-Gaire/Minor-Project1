const { parse } = require("querystring");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const { getUserByEmail, getCollectionName } = require("../DBConnect/authDB");

const postLogin = async (req, res) => {
  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk;
  });
  req.on("end", async () => {
    const loginData = parse(requestBody);
    const email = loginData.email;
    const password = loginData.password;
    const Users = getCollectionName();
    // Fetch user from the database by email
    const user = await getUserByEmail(Users, email);

    if (user && user.password === password) {

      // Successful Login

      // const sessionId = generateSessionId();
      // sessions[sessionId] = user._id;
      res.writeHead(302, { Location:"../../index.ejs" });
      res.end();
    } else {
      //Invalid Credentials
      res.writeHead(401, { "Content-Type": "text/plain" });
      res.end("Invalid credentials");
    }
  });
};
const getLogin = async(req,res) => {
  const filePath = fs.readFileSync(path.join(__dirname + "../../../views/auth/login.html"),"utf8");
  const renderPage = ejs.render(filePath);
  res.end(renderPage);
}
module.exports = {postLogin,getLogin};
