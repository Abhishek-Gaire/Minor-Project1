import { getCollectionName,getDataById } from "../Models/model.js";
import { renderPage } from "../helper/appHelper.js";
import { getCounterCollectionName } from "../Models/order.js";

const renderHomePage = async (req, res) => {
    try {

        const collection = await getCollectionName();
        const modelsData = await collection.find({isHomePage:true}).toArray();

        const counterCollection = await  getCounterCollectionName() ; 
        await counterCollection.findOneAndUpdate(
            {},
            { $inc: { loadCount: 1 } }, // Increment the loadCount field by 1
            { upsert: true, returnDocument: 'after' } // Create the document if it doesn't exist
        );
        
        if(!req.user){
            return await renderPage( res, "/views/page/index.ejs", {isLoggedIn:false,models:modelsData });
        } else{
            return await renderPage( res, "/views/page/index.ejs", { isLoggedIn:true,models:modelsData});
        }
    } catch (err) {
        console.error(err);
    }
};

const renderVehicles = async (req, res) => {
    try {
        const collection = await getCollectionName();
        const vehiclesData = await collection.find({}).toArray();
        
        await renderPage(res, "/views/page/vehicles.ejs", { vehiclesData });
    } catch (err) {
        console.error(err);
    }
};

const renderModelView = async (req, res) => {
    try {
        const vehicleID= req.url.split("?")[1];
        
        const collectionName = await getCollectionName();
        const vehicleData = await getDataById(collectionName,vehicleID);

        if(!req.user){
            await renderPage(res,"/views/page/modelview.ejs",{models:vehicleData,isLoggedIn:false});
        } else{
            await renderPage(res,"/views/page/modelview.ejs",{isLoggedIn:true,models:vehicleData});
        }
    } catch (err) {
        console.error(err);
    }
};
const renderAboutPage = async (req, res) => {
    try {
        await renderPage(res, "/views/page/aboutPage.html", { data:"" });
    } catch (err) {
        console.error(err);
    }
};
const renderContactPage = async (req, res) => {
    try {
        await renderPage(res, "/views/page/contactPage.html", {data:''});
    } catch (err) {
        console.error(err);
    }
};
const get500Error = async(req,res) => {
    const filePath = "/views/500-error.html";
    await renderPage(res,filePath,{data:''});
}
export { renderHomePage, renderModelView, renderVehicles,renderAboutPage,renderContactPage,get500Error };
