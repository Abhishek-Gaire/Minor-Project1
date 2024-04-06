import { getCollectionName,getDataById } from "../Models/model.js";
import * as Users from "../Models/user.js";
import { renderPage } from "../helper/appHelper.js";

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
        vehicleData,userData
    }
    await renderPage(res,filePath,data);
}
export{getBookCar};