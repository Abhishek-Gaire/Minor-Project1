import { ObjectId } from "mongodb";

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

    if(!vehicleID){
        const errorMessage = "No Vehicle with that ID exists";
        return await renderPage(res,filePath,{errorMessage});
    }
    const collection = await getCollectionName();
    const vehicleData = await getDataById(collection,vehicleID);

    const users = await Users.getCollectionName();
    const userData = await Users.getUserByID(users,userId);

    const data = {
        vehicleData,
        userData
    }
    await renderPage(res,filePath,data);
}
const postBookCar = async(req,res) => {
    const formData = await parseFormData(req);

    const firstName  = formData.firstName;
    const lastName = formData.lastName;
    const address = formData.address;
    const phoneNumber = formData.phoneNumber;
    const email = formData.email;
    const color = formData.color;

    const userID = formData.userId;
    const vehicleID = formData.vehicleId;

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
    const orderCreated = await orderCollection.insertOne({
        FullName:`${firstName} ${lastName}`,
        carName:modelData.name,
        email:email,
        contactNumber:phoneNumber,
        status:"pending",
        createdAt: new Date()
    });
    if(!orderCreated){
        res.writeHead(500, {Location:"/500-error"});
        res.end();
        return;
    }
    const mailOptions = {
        from: "projectMinor1@gmail.com",
        to: `${email}`,
        subject:"Booked Car Successful",
        text:`Dear ${firstName}, Your booking of the car ${carName} of price${price} with selected color of ${color} has been successfully booked.`
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
export{getBookCar,postBookCar};