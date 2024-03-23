import crypto from"crypto";
import queryString from"querystring";
import fs from"fs";
import path from"path";
import ejs from"ejs";

import{transporter} from"./login.js";
import{getCollectionName, getUserByToken,getUserByEmail,addToken} from"../Models/user.js";

const __dirname = path.resolve();

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
                res.writeHead(409, {Location: "/forgot-password"});
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
        })
    });
};
const getReset = async(req,res) => {
    const filePath = fs.readFileSync(path.join(__dirname , "/views/auth/forgot-password.html"),"utf8");
    const renderPage = ejs.render(filePath);
    res.end(renderPage);
}


const getUpdatePassword = async(req,res) => {
    // Extract the token parameter from the url
    const token = req.url.split("?")[1];

    const collection = await getCollectionName();
    const user = await getUserByToken(collection, token);

    const filePath =  fs.readFileSync(path.join(__dirname,"/views/auth/new-password.ejs"),"utf-8");

    if(!user){
        const renderPage = ejs.render(filePath,{
            token:'',
            errorMessage: 'No user with that token exists.'
        })
        res.end(renderPage);
        return;
    }
    const renderPage = ejs.render(filePath,{
        token:token,
        errorMessage: null,
    })
    res.end(renderPage);
    // console.log(renderPage);
};

const postUpdatePassword = async(req,res) => {
    const filePath =  fs.readFileSync(path.join(__dirname,"/views/auth/new-password.ejs"),"utf-8");
    let body = '';
    req.on('data', (chunk)=>{
        body += chunk.toString()
    });
    req.on('end',async ()=>{
        formData = queryString.parse(body);
        
        const token = formData.resetToken;
        const password = formData.password;
        const confirm_password=formData.confirmPassword;
        

        if(password !== confirm_password){
            const renderPage = ejs.render(filePath,{
                token:token,
                errorMessage: "Passwords have to match!",
            })
            res.end(renderPage);
            return;
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
            const renderPage = ejs.render(filePath,{
                token:'',
                errorMessage: "User With That Token Not Found",
            })
            res.end(renderPage);
        }
    })

}
export {getUpdatePassword,getReset,postReset, postUpdatePassword};

