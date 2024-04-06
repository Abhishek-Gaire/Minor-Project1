import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const generateToken = async(id) =>{
  const token = jwt.sign({ id }, process.env.USER_SECRET_KEY, { expiresIn: '1h' });
  return token;
}

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

const mailOptions = (email,verificationCode) => {
  return  ({
  from: "projectMinor1@gmail.com",
  to: `${email}`,
  subject: "SignUp Verification Code",
  text: `Your verification code for projectMinor is ${verificationCode}`,
  })
};
export{generateToken,transporter,generateVerificationCode,mailOptions};