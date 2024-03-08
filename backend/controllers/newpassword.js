const ejs = require("ejs");
const fs = require("fs");
const path = require('path');
const url = require("url");

const {getUserByToken, getCollectionName} = require("../DBConnect/authDB");

const getNewPassword = async(req,res) => {
    const parsedUrl = url.parse(req.url, true);

    const collection = getCollectionName();

    // Extract the token parameter from the query string
    const token = parsedUrl.query.token;

    const user = await  getUserByToken(collection, token);

    const filePath =  fs.readFileSync(path.join(__dirname+"../../views/new-password.ejs"),"utf-8");

    if(!user){
        const renderPage = ejs.render(filePath,{
            token:'',
            userId:'',
            errorMessage: 'No user with that token exists.'
        })
        res.end(renderPage);
        return;
    }
    const renderPage = ejs.render(filePath,{
        token:token,
        userId:user._id.toString(),
        errorMessage: null,
    })
    res.end(renderPage);
};
module.exports = getNewPassword;