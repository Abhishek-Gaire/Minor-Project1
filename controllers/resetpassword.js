import crypto from"crypto";

import{transporter} from"../helper/nodemailerHelper.js";
import{getCollectionName, getUserByToken,getUserByEmail,addToken} from"../Models/user.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";


const postReset  = async(req,res) => {
    const formData = await parseFormData(req);
    
    const email = formData.email;
    if(!email){
        //should change to res.flash
        console.log("Email not provided");
        res.writeHead(302,{Location:"/forgot-password"})
        res.end();
        return;
    }
    const buffer = crypto.randomBytes(32);
    if(!buffer){
        console.log(err);
        res.writeHead(409, {Location: "/forgot-password"});
        res.end();
        return;
    }
    //create token
    const token = buffer.toString('hex');

    const collection = await getCollectionName();
    const user = await getUserByEmail(collection,email);
    if(!user){
        console.log("No user with that email");
        res.writeHead(302, {Location: "/forgot-password"});
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
                <p> Click this <a href="http://localhost:5173/reset-password?${token}">link </a> to set up a new password
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
        res.writeHead(409, {Location: "/forgot-password"});
        res.end();
        return;
    }
};

const getReset = async(req,res) => {
    const query = req.url.split("?")[1];
    // console.log(query);
    const filePath = "/views/auth/forgotPassword.ejs";
    if(query){
        const data = {
            admin:true,
        }
        return await renderPage(res,filePath,data);
    }
    const data = {
        admin:false,
    }
    return await renderPage(res,filePath,data);
}


const getUpdatePassword = async(req,res) => {
    // Extract the token parameter from the url
    const token = req.url.split("?")[1];

    if(!token){
        //flash messages
        res.writeHead(302,{Location:"/forgot-password"});
        return res.end();
    }
    const collection = await getCollectionName();
    const user = await getUserByToken(collection, token);

    const filePath = "/views/auth/new-password.ejs";

    if(!user){
        const data = {
            token:'',
            errorMessage: 'No user with that token exists.'
        }
        return await renderPage(res,filePath,data);
    }
    const data = {
        token:token,
        errorMessage: null,
    }
    await renderPage(res,filePath,data);
};

const postUpdatePassword = async(req,res) => {
    const filePath = "/views/auth/new-password.ejs";
    
    const formData = await parseFormData(req);
    
    const token = formData.resetToken;
    const password = formData.password;
    const confirm_password=formData.confirmPassword;

    if(password !== confirm_password){
        const data = {
            token:token,
            errorMessage: "Passwords have to match!",
        }
        return await renderPage(res,filePath,data);
    }
    const collection = await getCollectionName(); // Get the collection
    const user = await getUserByToken(collection, token); // Get the user by token
        
    // Check if user exists
    if (user) {
        // Update the user's password and resetToken
        user.password = password;
        user.resetToken = null;
            
        // Update the user document in the database
        await collection.updateOne({ _id: user._id }, { $set: { password: password, resetToken: null } });
            
        // Redirect to the login page
        res.writeHead(302, { Location: "/login" });
        res.end();
    } else {
        // User not found, handle the error or redirect to an error page
         const data = {
            token:'',
            errorMessage: "User With That Token Not Found",
        };
        await renderPage(res,filePath,data); 
    
    }
}
export {getUpdatePassword,getReset,postReset, postUpdatePassword};

