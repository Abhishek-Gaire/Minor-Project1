const ejs = require("ejs");
const fsPromises = require("fs").promises;
const path = require("path");

const {getCollectionName} = require("../DBConnect/modelsDB")
const renderVehicles = async(req,res) =>{
    try{
        const collection = await getCollectionName();
        const filePath = path.join(__dirname+"../../../views/page/vehicles.ejs")
        const ejsData = await fsPromises.readFile(filePath, "utf8");
        
        const vehiclesData = await collection.find({}).toArray();

        const names = vehiclesData.map((item => item.name));
        const imageUrls = vehiclesData.map((item => item.imageUrl));
        const prices = vehiclesData.map((item => item.price));
        
        const renderedVehicles = ejs.render(ejsData,{imageUrls,names,prices}); 
        res.end(renderedVehicles);
        
    } catch(err){
        console.error(err);
    }
}
module.exports = renderVehicles;