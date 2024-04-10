import jwt from "jsonwebtoken";

import{getUserByEmail,getCollectionName} from"../Models/user.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";

const getVerify = async(req,res) => {
  const query = req.url.split("?")[1];
  if(!query){
    res.writeHead(302,{"Location":"/signup"});
    return res.end();
  }
  const token = query.split("=")[1];
  const decoded = jwt.verify(token,process.env.USER_SECRET_KEY);
  const verificationPage = "/views/auth/verify.ejs";
  const data =  {
    email:decoded.id,
    digit1: '',
    digit2: '',
    digit3: '',
    digit4: '',
    digit5: '',
    digit6: '',
    message: null,
  }
  await renderPage(res,verificationPage,data);
}
const verify = async(req,res) => {
  const formData = await parseFormData(req);
  const verificationCode = `${formData.digit1}${formData.digit2}${formData.digit3}${formData.digit4}${formData.digit5}${formData.digit6}`;
  const email = formData.email;

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
    const verificationPage = "/views/auth/verify.ejs";
    const data =  {email,
      digit1:formData.digit1,
      digit2:formData.digit2,
      digit3:formData.digit3,
      digit4:formData.digit4,
      digit5:formData.digit5,
      digit6:formData.digit6,
      message :"Verification code is incorrect.",
    };
    await renderPage(res,verificationPage,data);
  }
}
export {verify,getVerify};
