const ejs = require("ejs");
const queryString = require("querystring");
const fs = require("fs");

const {getUserByEmail,
  getCollectionName,
  updateUser
} = require("../DBConnect/authDB");

const verify = async(req,res) => {
    let body='';
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async()=>{
      const formData = queryString.parse(body);
      const email = formData.email;
      const verificationCode = `${formData.digit1}${formData.digit2}${formData.digit3}${formData.digit4}${formData.digit5}${formData.digit6}`;
      
      const collection = getCollectionName();
      const user = await getUserByEmail(collection ,email);

      if(user.verificationCode === parseInt(verificationCode)){
        // Update user's verified status in MongoDB
        updateUser(collection,email);
        
        res.writeHead(302, { Location: "../../frontend/html/login.html" });
        res.end();

        return;
      }else {
        // Verification failed
        const verificationPage = fs.readFileSync(__dirname + "../../../ejs/verify.ejs" ,"utf8");
        const renderedPage = ejs.render(verificationPage, {email,
          digit1:formData.digit1,
          digit2:formData.digit2,
          digit3:formData.digit3,
          digit4:formData.digit4,
          digit5:formData.digit5,
          digit6:formData.digit6,
          message :"Verification code is incorrect.",
        });
        res.writeHead(400, {"Content-Type": "text/html"});
        res.end(renderedPage);
      }
    });
}
module.exports = verify;