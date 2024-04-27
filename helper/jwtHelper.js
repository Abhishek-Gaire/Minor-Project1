import jwt from "jsonwebtoken";

const generateToken = async(id) =>{
  const token = jwt.sign({ id }, process.env.USER_SECRET_KEY, { expiresIn: '1h' });
  return token;
}

const generateAdminToken = async(id) =>{
  const adminToken = jwt.sign({ id }, process.env.ADMIN_SECRET_KEY, { expiresIn: '5h' });
  return adminToken;
}

function generateVerificationCode(){
  return Math.floor(100000 + Math.random() * 900000);
};


export{generateToken,generateVerificationCode,generateAdminToken};