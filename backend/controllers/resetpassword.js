const crypto = require("crypto");
const queryString = require("querystring");

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
                        <p> Click this <a href="http://localhost:3000/reset/${token}">link </a> to set up a new password
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
                res.writeHead(302, {Location: "../../views/login.html"});
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

module.exports = postReset;
// exports.getNewPassword = (req,res,next) => {
//     const token = req.params.token;
//     User.findOne(
//         {
//             resetToken:token, 
//             resetTokenExpiration:{
//                 $gt:Date.now()
//             }
//         }
//     )
//     .then(user => {
//         let message = req.flash("error");
//         if(message.length > 0){
//             message = message[0];
//         } else{
//             message = null;
//         }
//         res.render("auth/reset-password", {
//         path:"/reset-password",
//         pageTitle: "Update Password",
//         errorMessage: message,
//         passwordToken: token,
//         userId: user._id.toString(),
//         })
//     })
//     .catch(err =>{
//         const error = new Error(err);
//             error.httpStatusCode = 500;
//             return next(error);
//     })
    
// };
