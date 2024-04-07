import bcrypt from "bcrypt";
// import { getCollectionName } from "../Models/model.js";
import {getAdminCollectionName,getAdminByEmail} from "../Models/admin.js"
import { generateToken } from "../helper/adminHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";

// Function to delete a cookie
function deleteCookie(res, cookieName) {
    // console.log(cookieName);
    res.setHeader('Set-Cookie', [`${cookieName}=; Max-Age=0`]);
}

const getAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        res.end();
        return ;
    }
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);
    
    const filePath = "/views/admin/admin.ejs";
    const data = {
        title: "Admin Dashboard",
        adminData:adminData,
    }
    await renderPage(res,filePath,data);
}

const getAddVehicles = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const filePath = "/views/admin/addVehicle.ejs";
    const data = {
        title: "Admin Dashboard",
        adminData:adminData,
    }
    await renderPage(res,filePath,data);
}
const getManageUsers = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const filePath = "/views/admin/manageUser_admin.ejs";
    const data = {
        title: "Manage User",
        adminData:adminData,
    }
    await renderPage(res,filePath,data);
}
const getBookedCarAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const filePath = "/views/admin/booking_admin.ejs";
    const data = {
        title: "Booked Cars",
        adminData:adminData,
    }
    await renderPage(res,filePath,data);
}
const getCarsAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const filePath = "/views/admin/admin_car.ejs";
    const data = {
        title: "All Cars",
        adminData:adminData,
    }
    await renderPage(res,filePath,data);
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
        const adminToken = await generateToken(admin.email);
  
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
const postLogoutAdmin = async(req,res)=> {
    const filePath= "/views/auth/login.ejs"
    // console.log(req.token);
    if(req.adminToken){
      // console.log("Inside If");
      deleteCookie(res,"adminToken");
      const data = {
        message :"You are successfully logged out",
        admin:true,
      }
      await renderPage (res,filePath,data);
      return;
    }
    console.log("Outside if in post Logout");
  }
export {getAdmin,getAddVehicles,postAddVehicles,postLoginAdmin,getManageUsers,getBookedCarAdmin,getCarsAdmin,postLogoutAdmin};