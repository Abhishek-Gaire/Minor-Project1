import{ parse } from "querystring";

import validator from "validator";
import bcrypt from "bcrypt";

import{
  getUserByEmail,
  getCollectionName,
  createUser,
} from"../Models/user.js";
import { generateToken,transporter,generateVerificationCode,mailOptions } from "../helper/jwtHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";


const postLogin = async (req, res) => {

  const filePath = "/views/auth/login.ejs";

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
      const message = "No user with that email exists!";
      return await renderPage(res,filePath,{message});
    }
    if (user && user.password === password) {
      // Generate JWT token
      const token = await generateToken(user._id);

      // Set JWT token in a cookie
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);

      res.writeHead(302, { Location:"/" });
      res.end();
    } else {
      //Invalid Credentials
      const message = "Invalid Username or Password";
      await renderPage(res,filePath,{message});
      return;
    }
  });
};
const getLogin = async(req,res) => {
  const fullQuery = req.url.split("?")[1];
  
  const filePath = "/views/auth/login.ejs";
  if(!fullQuery){
    const data = {
      message:'',
      redirect:false,
    }
    return await renderPage(res,filePath,data);
  }
  const query = fullQuery.split("=")[0];
  // console.log(query);
  if(query==="userExists"){
    const data = {
      message:"User Already Exists",
      redirect:false,
    }
    return await renderPage(res,filePath,data);
  }
  const data = {
    message:'',
    redirect:true,
  }
  return await renderPage(res,filePath,data)
}


const postSignUP = async (req, res) => {
  const filePath = "/views/auth/signup.ejs";
  
  const formData = await parseFormData(req);
   
  const {username,email,password}= formData;

  // // Validation for username
  if (!validator.isAlphanumeric(username) || validator.isEmpty(username)) {
    const errorMessage ='Username is not valid';
    return await renderPage(res,filePath,{errorMessage});
  }

  // Validation for email
  if (!validator.isEmail(email)) {
    const errorMessage ='Email is not valid';
    return await renderPage(res,filePath,{errorMessage});
  }

  // Validation for password
  if (!validator.isStrongPassword(password)) {
    const errorMessage ='Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    await renderPage(res,filePath,{errorMessage});
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

  const sendingMail = mailOptions(email,verificationCode);

  transporter.sendMail(sendingMail, (error, info) => {
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
    username: username,
    email: email,
    password: hashedPassword,
    verified: false,
    verificationCode: verificationCode,
    resetToken: null,
  };

  await createUser(Users, newUser);

  const verificationPage = "/views/auth/verify.ejs";
  const data =  {
    email,
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: '',
    message: null,
  }
  await renderPage(res,verificationPage,data);
};


const getSignUP = async(req,res) => {
  const filePath = "/views/auth/signup.ejs";
  const errorMessage ='';
  await renderPage(res,filePath,{errorMessage});
}

const postLogout = async(req,res)=> {
  const filePath= "/views/auth/login.ejs"
  // console.log(req.token);
  if(req.token){
    console.log("Inside If");
    res.setHeader('Set-Cookie', `token=; HttpOnly`);
    const message = "You are successfully logged out"
    await renderPage (res,filePath,{message});
    return;
  }
  console.log("Outside if in post Logout");
}
export {postSignUP,postLogin,getLogin,getSignUP,postLogout};

