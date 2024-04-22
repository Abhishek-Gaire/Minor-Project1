

import { getCollectionName,getDataById } from "../Models/model.js";
import { renderPage } from "../helper/appHelper.js";


const renderHomePage = async (req, res) => {
    try {
        const collection = await getCollectionName();
        const modelsData = await collection.find({}).toArray();
        const { names, heads, descriptions, prices, imageUrls,ids } = modelsData.reduce((acc, item) => {
            acc.names.push(item.name);
            acc.heads.push(item.head);
            acc.descriptions.push(item.description);
            acc.prices.push(item.price);
            acc.imageUrls.push(item.imageUrl);
            acc.ids.push(item._id);
            return acc;
        }, { names: [], heads: [], descriptions: [], prices: [], imageUrls: [] ,ids:[]});
        if(!req.user){
            return await renderPage( res, "/views/page/index.ejs", { names, heads, descriptions, prices, imageUrls,ids,isLoggedIn:false });
        } else{
            return await renderPage( res, "/views/page/index.ejs", { names, heads, descriptions, prices, imageUrls,ids,isLoggedIn:true });
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
        console.log(vehicleID);
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
export { renderHomePage, renderModelView, renderVehicles,renderAboutPage,renderContactPage };
