import bcrypt from "bcrypt";
// import { getCollectionName } from "../Models/model.js";
import {getAdminCollectionName,getAdminByEmail} from "../Models/admin.js"
import { generateToken } from "../helper/adminHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";

const getAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        res.end();
    }
    const filePath = "/views/admin/admin.ejs";
    const data = {
        title: "Admin Dashboard",
    }
    await renderPage(res,filePath,data);
    // const data = await readFileAsync(filePath);
    // const adminFile = ejs.render(data);
    // res.end(adminFile);
}
const getAddVehicles = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        res.end();
    }
    const filePath = "/views/admin/addVehicle.html"    
    const data = '';
    await renderPage(res,filePath,{data});
}
const postAddVehicles = async(req,res) => {
    //nothing right now
}
const postLoginAdmin = async (req, res) => {

    const filePath = "/views/auth/login.ejs";
  
    const formData = await parseFormData(req); 
      
    const{email,password} = formData;
      
    const collectionName = await getAdminCollectionName();
  
    // Fetch admin from the database by email
    const admin = await getAdminByEmail(collectionName, email);
      
    if (!admin){
        const data = {
            admin:true,
            message:"No admin with that email exists! Please contact your system administrator.",
        }
        return await renderPage(res,filePath,data);
    }
    const match = await bcrypt.compare(password,admin.password);
    if(match){
        // Generate JWT token
        const adminToken = await generateToken(admin._id);
  
        // Set JWT token in a cookie
        res.setHeader('Set-Cookie', `adminToken=${adminToken}; HttpOnly`);
  
        res.writeHead(302, { Location:"/admin" });
        res.end();
    } else {
        //Invalid Credentials
        const data = {
            message :"Invalid Email or Password",
            admin:true,
        }
        await renderPage(res,filePath,data);
        return;
    }
};
export {getAdmin,getAddVehicles,postAddVehicles,postLoginAdmin};