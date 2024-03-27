import ejs from "ejs";
import fsPromises from "fs/promises";
import path from 'path';

import { getCollectionName } from "../Models/model.js";

const __dirname = path.resolve();

const readFileAsync = async (filePath) => {
  return await fsPromises.readFile(filePath, "utf8");
};

const renderPage = async (req, res, templatePath, data) => {
  try {
    const filePath = path.join(__dirname, templatePath);
    // console.log(filePath)
    const ejsData = await readFileAsync(filePath);
    const renderedHTML = ejs.render(ejsData, data);
    // console.log(renderedHTML);
    res.end(renderedHTML);
  }catch (err) {
    console.error(err);
  }
};

const renderHomePage = async (req, res) => {
    try {
        const collection = await getCollectionName();
        const modelsData = await collection.find({}).toArray();
        const { names, heads, descriptions, prices, imageUrls } = modelsData.reduce((acc, item) => {
            acc.names.push(item.name);
            acc.heads.push(item.head);
            acc.descriptions.push(item.description);
            acc.prices.push(item.price);
            acc.imageUrls.push(item.imageUrl);
            return acc;
        }, { names: [], heads: [], descriptions: [], prices: [], imageUrls: [] });
        if(!req.user){
            // console.log("Inside If");
            await renderPage(req, res, "/views/page/index.ejs", { names, heads, descriptions, prices, imageUrls,isLoggedIn:false });
        } else{
            await renderPage(req, res, "/views/page/index.ejs", { names, heads, descriptions, prices, imageUrls,isLoggedIn:true });
        }
    } catch (err) {
        console.error(err);
    }
};

const renderVehicles = async (req, res) => {
    try {
        const collection = await getCollectionName();
        const vehiclesData = await collection.find({}).toArray();
        await renderPage(req, res, "/views/page/vehicles.ejs", { vehiclesData });
    } catch (err) {
        console.error(err);
    }
};

const renderModelView = async (req, res) => {
    try {
        // console.log("Inside ModelView Render")
        const vehicleid = req.url.split("?")[1];

        if(!req.user){
            // console.log("Inside If");
            await renderPage(req,res,"/views/page/modelview.ejs",{isLoggedIn:false});
        } else{
            // console.log("Outside if");
            await renderPage(req,res,"/views/page/modelview.ejs",{isLoggedIn:true,vehicleID:vehicleid});
        }
        
    } catch (err) {
        console.error(err);
    }
};

export { renderHomePage, renderModelView, renderVehicles };
