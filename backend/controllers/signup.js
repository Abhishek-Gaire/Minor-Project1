const { parse } = require("querystring");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");


const {
  getUserByEmail,
  getCollectionName,
  createUser,
} = require("../DBConnect/authDB");

const transporter = nodemailer.createTransport({
  service :"gmail",
  auth: {
    // from gmail APP SERVICES
    user: "abhisekgaire7@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});
function generateVerificationCode(){
  return Math.floor(100000 + Math.random() * 900000);
};

const postSignUP = async (req, res) => {
  
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
      // req.flash()
      res.writeHead(409, { Location: "/login" });
      res.end();
      return;
    } else {
      const verificationCode = generateVerificationCode();
      const mailOptions = {
        from: "projectMinor1@gmail.com",
        to: `${email}`,
        subject: "SignUp Verification Code",
        text: `Your verification code for projectMinor is ${verificationCode}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if(error){
          console.error('Error sending verification email:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        } else{
          console.log('Verification email sent:', info.response);
        }
      });
      const newUser = {
        username: userName,
        email: email,
        password: password,
        verified: false,
        verificationCode: verificationCode,
        resetToken:null,
      };

      // Insert the new user document into MongoDB's collection
      await createUser(Users, newUser);

      // console.log(__dirname);
      const verificationPage = fs.readFileSync(__dirname + "../../../views/auth/verify.ejs" ,"utf8");
      const renderedPage = ejs.render(verificationPage, {email,
        digit1:'',
        digit2:'',
        digit3:'',
        digit4:'',
        digit5:'',
        digit6:'',
        message:null,
      });
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(renderedPage);
    }
  });
};

const getSignUP = async(req,res) => {
  const filePath = fs.readFileSync(path.join(__dirname + "../../../views/auth/signup.html"),"utf8");
  const renderPage = ejs.render(filePath);
  res.end(renderPage);
}

module.exports = {postSignUP,transporter,getSignUP};
