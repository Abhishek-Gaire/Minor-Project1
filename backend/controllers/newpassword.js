const ejs = require("ejs");
const fs = require("fs");
const path = require('path');
const queryString = require("querystring");

const {getUserByToken, getCollectionName} = require("../DBConnect/authDB");

const getUpdatePassword = async(req,res) => {
    // Extract the token parameter from the url
    const token = req.url.split("?")[1];

    const collection = await getCollectionName();
    const user = await getUserByToken(collection, token);

    const filePath =  fs.readFileSync(path.join(__dirname+"../../../views/auth/new-password.ejs"),"utf-8");

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
    const filePath =  fs.readFileSync(path.join(__dirname+"../../../views/auth/new-password.ejs"),"utf-8");
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
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User not found');
        }
    })

}
module.exports = {getUpdatePassword, postUpdatePassword};