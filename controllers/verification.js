import ejs from"ejs";
import queryString from"querystring";
import fs from"fs";
import path from "path";

import{getUserByEmail,
  getCollectionName
} from"../Models/user.js";

const __dirname = path.resolve();

const verify = async(req,res) => {
    let body='';
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async()=>{
      const formData = queryString.parse(body);
      const email = formData.email;
      const verificationCode = `${formData.digit1}${formData.digit2}${formData.digit3}${formData.digit4}${formData.digit5}${formData.digit6}`;
      
      const collection = getCollectionName();
      const user = await getUserByEmail(collection ,email);

      if(user.verificationCode === parseInt(verificationCode)){
        
        // Update the user document in the database
        await collection.updateOne({ _id: user._id }, { $set: { verified: true, verificationCode:null } });
            
        // Redirect to the login page
        res.writeHead(302, { Location: "/login" });
        res.end();
      }else {
        // Verification failed
        const verificationPage = fs.readFileSync(__dirname + "../../../views/auth/verify.ejs" ,"utf8");
        const renderedPage = ejs.render(verificationPage, {email,
          digit1:formData.digit1,
          digit2:formData.digit2,
          digit3:formData.digit3,
          digit4:formData.digit4,
          digit5:formData.digit5,
          digit6:formData.digit6,
          message :"Verification code is incorrect.",
        });
        res.writeHead(400, {"Content-Type": "text/html"});
        res.end(renderedPage);
      }
    });
}
export {verify};
