const { parse } = require("querystring");
const {
  getUserByEmail,
  getCollectionName,
  createUser,
} = require("../DBConnect/authDB");
const signUP = async (req, res) => {
  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk.toString();
  });
  req.on("end", async () => {
    const formData = parse(requestBody);
    const userName = formData.username;
    const email = formData.email;
    const password = formData.password;
    const Users = getCollectionName();
    const existingUser = await getUserByEmail(Users, email);

    if (existingUser) {
      res.writeHead(409, { Location: "../../frontend/html/log.html" });
      res.end();
    } else {
      const newUser = {
        username: userName,
        email: email,
        password: password,
      };
      // Insert the new user document into MongoDB's collection
      await createUser(Users, newUser);

      // Set the response headers and status code
      res.writeHead(302, {
        Location: "../../frontend/html/log.html",
      });
      res.end();
    }
  });
};

module.exports = signUP;
