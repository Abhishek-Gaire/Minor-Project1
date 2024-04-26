
import validator from "validator";
import bcrypt from "bcrypt";

import{
  getUserByEmail, getCollectionName,createUser,
} from"../Models/user.js";
import { 
  generateToken,generateVerificationCode
} from "../helper/jwtHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";
import { mailOptions,transporter } from "../helper/nodemailerHelper.js";
import { deleteCookie } from "../helper/adminHelper.js";


const postLoginUser = async (req, res) => {
  const filePath = "/views/auth/login.ejs";

  const  formData = await parseFormData(req);
    
  const {email,password} = formData;
    
  const Users = await getCollectionName();

  // Fetch user from the database by email
  const user = await getUserByEmail(Users, email);
    
  if (!user){
    const data = {
      message : "No user with that email exists!",
      admin:false,
    }
    return await renderPage(res,filePath,data);
  }
 
  const matched =  await bcrypt.compare(password, user.password);
  if (matched) {
    // Generate JWT token
    const token = await generateToken(user._id);

    // Set JWT token in a cookie
    res.setHeader('Set-Cookie', `userToken=${token}; HttpOnly`);

    res.writeHead(302, { Location:"/" });
    res.end();
  } else {
    //Invalid Credentials
    const data = {
      message : "Invalid Password",
      admin:false,
    }
    await renderPage(res,filePath,data);
  }
};
const getLogin = async(req,res) => {
  // console.log(req.searchParams);
  const fullQuery = req.url.split("?")[1];
  // console.log(fullQuery);
  const filePath = "/views/auth/login.ejs";
  if(!fullQuery){
    const data = {
      message:'',
      admin:false,
    }
    return await renderPage(res,filePath,data);
  }
  const query = fullQuery.split("=")[0];
  // console.log(query)
  if(query === "userExists"){
    const data = {
      message:"User Already Exists",
      admin:false,
    }
    return await renderPage(res,filePath,data)
  }
  const data = {
    message:"Welcome to Admin Login",
    admin:true,
  }
  return await renderPage(res,filePath,data);
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
 
  const sendingMail = mailOptions(email,verificationCode);

  transporter.sendMail(sendingMail, async(error, info) => {
    if (error) {
      console.error('Error sending verification email:', error);
      const errorMessage = "Email is not valid!  Please try again with another email";
      await renderPage(res,filePath,{errorMessage});
      return;
    } else {
      console.log('Verification email sent:', info.response);
    }
  });

  const verificationCode = generateVerificationCode();
  // Hashing the password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const newUser = {
    username: username,
    email: email,
    password: hashedPassword,
    verified: false,
    verificationCode: verificationCode,
    resetToken: null,
  };

  await createUser(Users, newUser);

  const token = await generateToken(email);
  console.log(token);
  res.writeHead(302,{Location: `/verify?token=${token}`});
  res.end();
};

const getSignUP = async(req,res) => {
  const filePath = "/views/auth/signup.ejs";
  const errorMessage ='';
  await renderPage(res,filePath,{errorMessage});
}

const postLogoutUser = async(req,res)=> {
  const filePath= "/views/auth/login.ejs"
  // console.log(req.token);
  if(req.token){
    // console.log("Inside If");
    deleteCookie(res,"userToken");
    const data = {
      message :"You are successfully logged out",
      admin:false,
    }
    await renderPage (res,filePath,data);
    return;
  }
  console.log("Outside if in post Logout");
}
export {postSignUP,postLoginUser,getLogin,getSignUP,postLogoutUser};

