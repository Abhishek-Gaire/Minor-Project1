import bcrypt from "bcrypt";
import fs from "fs/promises"

import { getCollectionName,createModel } from "../Models/model.js";
import {getAdminCollectionName,getAdminByEmail} from "../Models/admin.js"
import { generateAdminToken } from "../helper/jwtHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";
import {getDate,parseFormDataWithImage,deleteCookie} from "../helper/adminHelper.js"
// import { setFlashMessage,getFlashMessage } from "../helper/flashMessage.js";

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
        title: "Admin Car",
        adminData:adminData,
        errorMessage:'',
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
    const filePath = "/views/admin/addVehicle.ejs";
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }

    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const formData = await parseFormDataWithImage(req);

    const {fields,files} = formData;
    const model3D = files.model[0];
    const imageFile = files.image[0];
    const{name,price,description} = fields;
    
    if(imageFile.mimetype === "image/png" || imageFile.mimetype === "image/jpeg" || imageFile.mimetype === "image/jpg"){
        const fileUploadPathForImages = "./assets/CarImages";
        const fileUploadPathForModels = "./assets/CarGLBModel"
        const oldImageFileName = imageFile.originalFilename;
        const oldModelFileName = model3D.originalFilename;

        const date = getDate();

        const imageName = `${date}-${oldImageFileName}`;
        const modelName = `${date}-${oldModelFileName}`;

        const newPathForImages = `${fileUploadPathForImages}/${imageName}`;
        const newPathForModels = `${fileUploadPathForModels}/${modelName}`;

        // Move the imagFile to the images folder
        await fs.rename(imageFile.filepath, newPathForImages);
        // Move the 3d model to the CarGLBModel folder
        await fs.rename(model3D.filepath, newPathForModels);

        const ModelCollection = await getCollectionName();
        const newModel = {
            name:name[0],
            price:Number(price[0]),
            description:description[0],
            imageUrl:newPathForImages,
            modelUrl:newPathForModels,
        }
        const uploaded = await createModel(ModelCollection,newModel);
        if (!uploaded) {
            res.writeHead(500,{Location:"/500-error"});
            res.end();
            return;
        }
        res.writeHead(302,{Location:"/admin/car-details"})
        res.end();
    }
    const data = {
        title: "Add Car",
        adminData:adminData,
        errorMessage:"Invalid File Type! Please upload an Image",
    }
    
    return await renderPage(res,filePath,data);
    
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
        const adminToken = await generateAdminToken(admin.email);
  
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