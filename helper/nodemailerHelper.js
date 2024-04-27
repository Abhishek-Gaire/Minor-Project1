import nodemailer from "nodemailer"


const mailOptions = (email,verificationCode) => {
  return  ({
    from: "projectMinor1@gmail.com",
    to: `${email}`,
    subject: "SignUp Verification Code",
    text: `Your verification code for projectMinor is ${verificationCode}`,
  })
};

const transporter = nodemailer.createTransport({
  service :"gmail",
  auth: {
    // from gmail APP SERVICES
    user: "abhisekgaire7@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
})

export {mailOptions,transporter}