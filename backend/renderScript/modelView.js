const ejs = require("ejs");
const fsPromises = require("fs").promises;
const path = require("path");

// const {getCollectionName} = require("../DBConnect/modelsDB")
const renderModelView = async(req,res) =>{
    try{
        // const collection = await getCollectionName();
        const filePath = path.join(__dirname+"../../../views/page/modelview.html")
        const ejsData = await fsPromises.readFile(filePath, "utf8");
        
        // const vehiclesData = await collection.find({}).toArray();
        
        // const names = vehiclesData.map((item => item.name));
        // const imageUrls = vehiclesData.map((item => item.imageUrl));
        // const prices = vehiclesData.map((item => item.price));
        
        const renderedVehicles = ejs.render(ejsData); 
        res.end(renderedVehicles);
        
    } catch(err){
        console.error(err);
    }
}
module.exports = renderModelView;