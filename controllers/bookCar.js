import { ObjectId } from "mongodb";
import { URL } from "url";
import jwt from "jsonwebtoken"
import { getCollectionName,getDataById } from "../Models/model.js";
import * as Users from "../Models/user.js";
import * as Orders from "../Models/order.js"

import { renderPage } from "../helper/appHelper.js";
import { parseFormData } from "../helper/appHelper.js";
import { transporter } from "../helper/nodemailerHelper.js";



const getBookCar = async(req,res)=> {
    
    if(!req.user){
        res.writeHead(302,{Location: "/login"});
        res.end();
        return ;
    }
    const filePath = "/views/page/bookcar.ejs";

    const userId = req.user.id;

    const vehicleID = req.url.split("?")[1];

    const collection = await getCollectionName();
    const vehicleData = await getDataById(collection,vehicleID);

    const isAvailable = vehicleData.stocks;
    const users = await Users.getCollectionName();
    const userData = await Users.getUserByID(users,userId);

    if(isAvailable === 0){
        const data = {
            vehicleData,
            userData,
            message:"This car is not available at the moment!",
            isAvailable:false
        }
        await renderPage(res,filePath,data);
    }
    const data = {
        vehicleData,
        userData,
        message:'',
        isAvailable:true,
    }
    await renderPage(res,filePath,data);
}
const postBooking = async(req,res) => {
    if(!req.user){
        res.writeHead(302,{Location: "/login"});
        res.end();
        return ;
    }
    const query = req.url.split("?")[1];
    const hasStocks = query.split("=")[1];
   
    const formData = await parseFormData(req);
    const modelId = formData.vehicleId;
    const advancePayment = formData.advancePayment;

    const userId = req.user.id;

    const userCollection = await Users.getCollectionName();
    const userData = await Users.getUserByID(userCollection,userId)
    const filePath = "/views/page/confirmBookCar.ejs";
    if(hasStocks === "true"){
        
        const data = {
            userData:userData,
            modelId:modelId,
            hasStocks:true,
            advancePayment:Number(advancePayment),
        }
        return await renderPage(res,filePath,data);
    }
    const data = {
        userData:userData,
        modelId:modelId,
        hasStocks:false,
        advancePayment:advancePayment,
    }
   await renderPage(res,filePath,data);    
}
const postConfirmBookCar = async(req,res) => {
    if(!req.user){
        res.writeHead(302,{Location: "/login"});
        res.end();
        return ;
    }
    const formData = await parseFormData(req);

    const firstName  = formData.firstName;
    const lastName = formData.lastName;
    const address = formData.address;
    const phoneNumber = formData.phoneNumber;
    const email = formData.email;
    const color = formData.color;
    
    const stocks = formData.stocks || '';
    
    const userID = req.user.id;
    const vehicleID = formData.vehicleId;
    const advancePayment = formData.advancePayment;

    const modelCollection = await getCollectionName();
    const userCollection = await Users.getCollectionName();
    const orderCollection = await Orders.getOrderCollectionName();

    const modelData = await getDataById(modelCollection,vehicleID);
    
    const userUpdated = await userCollection.updateOne({
        _id: new ObjectId(userID)},{
            $set:{
                firstName:firstName,
                lastName:lastName,
                address:address,
                contactNumber:phoneNumber
            }
        }
    );
    if(!userUpdated){
        res.writeHead(500, {Location:"/500-error"});
        res.end();
        return;
    }
    const token = jwt.sign({email},process.env.USER_SECRET_KEY,{expiresIn:'1715335080'});

    if(stocks === "0"){
        console.log("Inside 0")
        const orderCreated = await orderCollection.insertOne({
            FullName:`${firstName} ${lastName}`,
            carName:modelData.name,
            email:email,
            contactNumber:phoneNumber,
            colorOfCar:color,
            status:"noStocks",
            advancePayment:advancePayment,
            createdAt: new Date()
        });
        if(!orderCreated){
            res.writeHead(500, {Location:"/500-error"});
            res.end();
            return;
        }
        const orderID = orderCreated.insertedId.toString();
        
        const mailOptions = {
            from: "projectMinor1@gmail.com",
            to: `${email}`,
            subject:"Booked Car Successful",
            html:`Dear ${firstName}, Your booking of the car ${modelData.name} of price ${modelData.price} with selected color of ${color} has been successful. But we don't have the car right now. Once stock is added, we will email you. If you want to cancel the booking Go <a href="http://localhost:5173/cancelBooking?id=${orderID}&token=${token}">Here</a>. This link will expire in 7 days.`
        }
        transporter.sendMail(mailOptions, async(error, info) => {
            if (error) {
              console.error('Error sending verification email:', error);
              res.writeHead(500,{Location:'/500-error'}).end();
              return;
            } else {
              console.log('Verification email sent:', info.response);
            }
        });
        // Redirect to the success page
        res.writeHead(302,{Location:`/modelview?${vehicleID}`});
        return res.end();
    }
    await modelCollection.updateOne({_id:new ObjectId(vehicleID)}, {
        $set:{
            stocks:Number(modelData.stocks) -1,
        }
    })
    
    const orderCreated = await orderCollection.insertOne({
        FullName:`${firstName} ${lastName}`,
        carName:modelData.name,
        email:email,
        contactNumber:phoneNumber,
        colorOfCar:color,
        status:"pending",
        advancePayment:advancePayment,
        createdAt: new Date()
    });
    if(!orderCreated){
        res.writeHead(500, {Location:"/500-error"});
        res.end();
        return;
    }
    const orderID = orderCreated.insertedId.toString();

    const mailOptions = {
        from: "projectMinor1@gmail.com",
        to: `${email}`,
        subject:"Booked Car Successful",
        html:`Dear ${firstName}, Your booking of the car ${modelData.name} of price ${modelData.price} with selected color of ${color} has been successful.If you want to cancel the booking Go <a href="http://localhost:5173/cancelBooking?id=${orderID}&token=${token}">Here</a>. This link will expire in 7 days.`
    }
    transporter.sendMail(mailOptions, async(error, info) => {
        if (error) {
          console.error('Error sending verification email:', error);
          res.writeHead(500,{Location:'/500-error'}).end();
          return;
        } else {
          console.log('Verification email sent:', info.response);
        }
    });
    // Redirect to the success page
    res.writeHead(302,{Location:`/modelview?${vehicleID}`});
    res.end();
}
const cancelBooking = async(req,res) => {
    if(!req.user){
        return res.writeHead(302,{Location:"/login"}).end();
    }
    const parsedUrl = new URL(req.url,`http://${req.headers.host}`);
    const query = parsedUrl.searchParams;
    const orderId = query.get("id");
    const token = query.get("token");

    if (!orderId || !token) {
      return res.writeHead(404,{Location:"/404-error"}).end();
    }

    const decoded = jwt.verify(token,process.env.USER_SECRET_KEY);

    if(!decoded){
        return res.writeHead(401).end("You are not authorized");//Unauthorized
    }
    const user = decoded;
    const userEmail = user.email;
    
    const userCollection = await Users.getCollectionName();
    const orderCollection = await Orders.getOrderCollectionName();
    const userData = await Users.getUserByID(userCollection,req.user.id);
    if(userEmail !== userData.email){
        return res.writeHead(401).end("You are not authorized");//Unauthorized
    }
    const updated = await orderCollection.updateOne(
        {_id :new ObjectId(orderId)},
        {
            $set:{Status :"Cancel"}
        },
        {upsert:true}
    )
    console.log(updated);
    if(updated){
        const mailOptions = {
            from: "projectMinor1@gmail.com",
            to: `${userEmail}`,
            subject:"Cancelled Car Successful",
            html:`Dear ${userData.firstName}, Your booking of the car has been cancelled.`
        }
        transporter.sendMail(mailOptions, async(error, info) => {
            if (error) {
            console.error('Error sending verification email:', error);
              res.writeHead(500,{Location:'/500-error'}).end();
                return;
            } else {
                console.log('Verification email sent:', info.response);
            }
        });
        res.writeHead(302,{Location:"/"}).end();
    }
   
}
export{getBookCar,postConfirmBookCar,postBooking,cancelBooking};