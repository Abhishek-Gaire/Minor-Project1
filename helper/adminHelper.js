import jwt from "jsonwebtoken";

const generateToken = async(id) =>{
    const adminToken = jwt.sign({ id }, process.env.ADMIN_SECRET_KEY, { expiresIn: '1h' });
    return adminToken;
}

export {generateToken};