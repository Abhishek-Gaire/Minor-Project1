import{ parse } from"querystring";
import fs from"fs";
import path from"path";

import ejs from"ejs";
import nodemailer from"nodemailer";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import{
  getUserByEmail,
  getCollectionName,
  createUser,
} from"../Models/user.js";

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
const __dirname = path.resolve();

const postLogin = async (req, res) => {

  const filePath = path.join(__dirname,"/views/auth/login.ejs");
  const fileData = fs.readFileSync(filePath,"utf8");

  let requestBody = "";
  req.on("data", (chunk) => {
    requestBody += chunk;
  });
  req.on("end", async () => {
    const loginData = parse(requestBody);
    
    const email = loginData.email;
    const password = loginData.password;
    
    const Users = await getCollectionName();

    // Fetch user from the database by email
    const user = await getUserByEmail(Users, email);
    
    if (!user){
      res.end
        (ejs.render
          (fileData,
            { message:"No user with that email exists!"}
          )
        );
      return;
    }
    if (user && user.password === password) {
      // Generate JWT token
      const token = jwt.sign({ email: user.email }, 'PROCESS.ENV.SECRET_KEY', { expiresIn: '1h' });

      // Set JWT token in a cookie
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);

      res.writeHead(302, { Location:"/" });
      res.end();
    } else {
      //Invalid Credentials
      res.end
        (ejs.render
          (fileData,
            { message:"Invalid email or password!"}
          )
        );
      return;
    }
  });
};
const getLogin = async(req,res) => {
  const query = req.url.split("?")[1];
  const filePath = fs.readFileSync(path.join(__dirname, "/views/auth/login.ejs"), "utf8");
  const message = query ? "User Already Exists" : "";
  const renderPage = ejs.render(filePath, { message });
  res.end(renderPage);
}



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
   
    // // Validation for username
    if (!validator.isAlphanumeric(userName) || validator.isEmpty(userName)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid username');
      return;
    }

    // Validation for email
    if (!validator.isEmail(email)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid email');
      return;
    }

    // Validation for password
    if (!validator.isStrongPassword(password)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    const Users = await getCollectionName();
    
    const existingUser = await getUserByEmail(Users, email);
    
    if (existingUser) {
      
      res.writeHead(302, { Location: "/login?userExists=true" });
      res.end();
      return;
    } 
      const verificationCode = generateVerificationCode();
      const mailOptions = {
        from: "projectMinor1@gmail.com",
        to: `${email}`,
        subject: "SignUp Verification Code",
        text: `Your verification code for projectMinor is ${verificationCode}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending verification email:', error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        } else {
          console.log('Verification email sent:', info.response);
        }
      });

      // Hashing the password
      const hashedPassword = bcrypt.hash(password, 10);

      const newUser = {
        username: userName,
        email: email,
        password: hashedPassword,
        verified: false,
        verificationCode: verificationCode,
        resetToken: null,
      };

      await createUser(Users, newUser);

      const verificationPage = fs.readFileSync(__dirname, "/views/auth/verify.ejs", "utf8");
      const renderedPage = ejs.render(verificationPage, {
        email,
        digit1: '',
        digit2: '',
        digit3: '',
        digit4: '',
        digit5: '',
        digit6: '',
        message: null,
      });
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(renderedPage);
  });
};


const getSignUP = async(req,res) => {
  const filePath = fs.readFileSync(path.join(__dirname , "/views/auth/signup.html"),"utf8");
  const renderPage = ejs.render(filePath);
  res.end(renderPage);
}

export {postSignUP,postLogin,transporter,getLogin,getSignUP};

