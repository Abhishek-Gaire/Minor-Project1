import bcrypt from "bcrypt";
import fs from "fs/promises"
import { ObjectId } from "mongodb";

import  * as Models from "../Models/model.js";
import {getAdminCollectionName,getAdminByEmail} from "../Models/admin.js";
import { getCounterCollectionName,getOrderCollectionName } from "../Models/order.js";
import { generateAdminToken } from "../helper/jwtHelper.js";
import { renderPage,parseFormData } from "../helper/appHelper.js";
import {getDate,parseFormDataWithImage,deleteCookie} from "../helper/adminHelper.js"
import { getCollectionName } from "../Models/user.js";


const getAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        res.end();
        return ;
    }
    const collection = await getAdminCollectionName();
    const counterCollection = await getCounterCollectionName();
    const modelCollection = await Models.getCollectionName();
    const bookedCollection =await getOrderCollectionName();

    const adminData = await getAdminByEmail(collection,req.admin.id);
    let counterCount = await counterCollection.findOne({});
    const models = await  modelCollection.find().toArray();
    const bookedCar = await bookedCollection.find().toArray();
    
    const filePath = "/views/admin/admin2.ejs";
    const data = {
        title: "Admin Dashboard",
        adminData:adminData,
        loadCount:counterCount.loadCount,
        cars:models.length,
        bookedCar:bookedCar.length,
    }
    await renderPage(res,filePath,data);
}

const getAddVehicles = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const filePath = "/views/admin/addVehicle.ejs";
    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);
    const query = req.url.split("?")[1];
    if(!query){
        const data = {
            title: "Admin Add Car",
            adminData:adminData,
            errorMessage:'',
            isEditing: false,
            models:'',
        }
        return await renderPage(res,filePath,data);
    }
    const isEdit= query.split("=")[1];
    if(isEdit){
        const modelId = query.split("&")[1].split("=")[1];
        
        const modelCollection = await Models.getCollectionName();
        const modelData = await Models.getDataById(modelCollection,modelId);
        const data = {
            title: "Admin Edit Car",
            adminData:adminData,
            errorMessage:'',
            isEditing: true,
            models:modelData,
        }
        await renderPage(res,filePath,data);
        return;
    }
}
const getManageUsers = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const userCollection = await getCollectionName();

    const adminData = await getAdminByEmail(collection,req.admin.id);
    const users = await userCollection.find({}).toArray();


    const filePath = "/views/admin/manageUser_admin.ejs";
    const data = {
        title: "Manage User",
        adminData:adminData,
        userData:users,
    }
    await renderPage(res,filePath,data);
}
const getBookedCarAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const orderCollection = await  getOrderCollectionName();

    const adminData = await getAdminByEmail(collection,req.admin.id);
    const orders = await orderCollection.find({}).toArray();


    const filePath = "/views/admin/booking_admin.ejs";
    const data = {
        title: "Booked Cars",
        adminData:adminData,
        orderData:orders,
    }
    await renderPage(res,filePath,data);
}
const getCarsAdmin = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const collection = await getAdminCollectionName();
    const modelCollection = await Models.getCollectionName();

    const adminData = await getAdminByEmail(collection,req.admin.id);
    const modelData = await modelCollection.find({}).toArray();
    const filePath = "/views/admin/admin_car.ejs";
    const data = {
        title: "All Cars",
        adminData:adminData,
        modelData:modelData,
    }
    await renderPage(res,filePath,data);
}
const postAddVehicles = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:"/login?adminExists=false"})
        return res.end();
    }
    const filePath = "/views/admin/addVehicle.ejs";

    const collection = await getAdminCollectionName();
    const adminData = await getAdminByEmail(collection,req.admin.id);

    const modelCollection = await Models.getCollectionName();

    const formData = await parseFormDataWithImage(req);

    const {fields,files} = formData;
    const model3D = files.model[0];
    const imageFile = files.image[0];
    const{name,price,year,descriptionCar,descriptionEngine,descriptionTyre,typeNames} = fields;
    
    
    if(imageFile.mimetype === "image/png" || imageFile.mimetype === "image/jpeg" || imageFile.mimetype === "image/jpg"){

        const exists = await modelCollection.findOne({
            name:name[0],
            price:Number(price[0]),
            modelYear:Number(year[0]),
            type:typeNames[0]
        });
        if(exists){
            console.log("modelExists");
            await modelCollection.updateOne({_id:new ObjectId(exists._id)},{$set:{stocks:Number(exists.stocks)+1}});

            res.writeHead(302,{Location:`/admin/car-details?id=${exists._id}`});
            res.end();
            return;
        }

        const fileUploadPathForImages = "./assets/CarImages";
        const fileUploadPathForModels = "./assets/CarGLBModel";

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

        const newModel = {
            name:name[0],
            price:Number(price[0]),
            descriptionOfCar:descriptionCar[0],
            imageUrl:newPathForImages,
            modelUrl:newPathForModels,
            type:typeNames[0],
            modelYear:Number(year[0]),
            descriptionOfEngine:descriptionEngine[0],
            descriptionOfTyre:descriptionTyre[0],
            stocks:1,
        }
        const uploaded = await Models.createModel(modelCollection,newModel);
        const uploadedCarID = uploaded.insertedId.toString();
        
        if (!uploaded) {
            res.writeHead(500,{Location:"/500-error"});
            res.end();
            return;
        }
        res.writeHead(302,{Location:`/admin/car-details?id=${uploadedCarID}`});
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
const getCarDetails = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:'/login?adminExists=false'});
        res.end();
        return;
    }
    const filePath = "/views/admin/car_details.ejs";
    const query = req.url.split("?")[1];
    const id = query.split("=")[1];

    const modelCollection = await Models.getCollectionName();
    const vehicleData = await Models.getDataById(modelCollection,id);

    if(!vehicleData){
        res.writeHead(500,{Location:"/500-err0r"})
        return res.end();
    }

    const data = {
        vehicleData:vehicleData
    };
    await renderPage(res,filePath,data);
}
const getAdminModelView = async(req,res) => {
    if(!req.admin){
        res.writeHead(302,{Location:'/login?adminExists=false'});
        res.end();
        return;
    }
    const filePath  = "/views/admin/adminModelView.ejs";
    const query = req.url.split("?")[1];
    const id = query.split("=")[1];

    const modelCollection = await Models.getCollectionName();
    const modelData = await Models.getDataById(modelCollection,id);
    
    await renderPage(res,filePath,{models : modelData});

}
export {getAdmin,getAddVehicles,postAddVehicles,postLoginAdmin,getManageUsers,getBookedCarAdmin,getCarsAdmin,postLogoutAdmin,getCarDetails,getAdminModelView};