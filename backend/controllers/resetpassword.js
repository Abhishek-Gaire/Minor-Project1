const crypto = require("crypto");
const queryString = require("querystring");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const {transporter} = require("./signup");
const {getCollectionName, getUserByEmail,addToken} = require("../DBConnect/authDB");

const postReset  = async(req,res) => {
    let body="";
    req.on("data" , (chunk) => {
        body += chunk.toString();
    })
    req.on("end"  , async ()=>{
        let formData = queryString.parse(body);
    
        const email = formData.email;
        crypto.randomBytes(32,async (err,buffer)=>{
            if(err){
                console.log(err);
                res.writeHead(409, {Location: "../../views/forgot-password.html"});
                res.end();
                return;
            }
            //create token
            const token = buffer.toString('hex');

            const collection = await getCollectionName();
            const user = await getUserByEmail(collection,email);
            if(!user){
                console.log("No user with that email");
                res.writeHead(409, {Location: "../../views/forgot-password.html"});
                res.end();
                return;
            }
            const addedToken = await addToken(token,collection,user._id);

            if(addedToken){
                const mailOptions = {
                    from: "projectMinor1@gmail.com",
                    to: email,
                    subject: "Password Reset Token",
                    html: `
                        <p> You requested a password reset </p>
                        <p> Click this <a href="http://localhost:5173/reset-password/${token}">link </a> to set up a new password
                    `,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if(error){
                      console.error('Error sending reset token email:', error);
                      res.writeHead(500, { 'Content-Type': 'text/plain' });
                      res.end('Internal Server Error');
                      return;
                    } else{
                      console.log('Reset token email sent:', info.response);
                    }
                });
                res.writeHead(302, {Location: "/login"});
                res.end();
            } else{
                console.log("Error Sending Token");
                res.writeHead(409, {Location: "../../views/forgot-password.html"});
                res.end();
                return;
            }
        })
    });
};
const getReset = async(req,res) => {
    const filePath = fs.readFileSync(path.join(__dirname + "../../../views/auth/forgot-password.html"),"utf8");
    const renderPage = ejs.render(filePath);
    res.end(renderPage);
}
module.exports = {getReset,postReset};

