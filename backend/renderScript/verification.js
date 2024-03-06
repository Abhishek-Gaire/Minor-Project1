const ejs = require("ejs");
const queryString = require("querystring");
const fs = require("fs");

const verify = async(req,res) => {
    let body='';
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async()=>{
      const verifyData = queryString.parse(body);
      const email = verifyData.email;
      const code = verifyData.code;
      // console.log("Email",email, "Code" ,code);
      if(verificationCodes[email] === parseInt(code)){
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Email verified successfully!');
          // Update user's verified status in MongoDB
        db.collection('users').updateOne({ email }, { $set: { verified: true } });
      }else {
        // Verification failed
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid verification code.');
      }
    });
}
module.exports = verify;