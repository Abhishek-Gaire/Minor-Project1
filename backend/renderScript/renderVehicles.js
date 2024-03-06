const ejs = require("ejs");
const fsPromises = require("fs").promises;

const renderVehicles = async(response,collection,filePath) =>{
    try{
        const ejsData = await fsPromises.readFile(filePath, "utf8");
        
        const vehiclesData = await collection.find({}).toArray();

        const names = vehiclesData.map((item => item.name));
        const imageUrls = vehiclesData.map((item => item.imageUrl));
        const prices = vehiclesData.map((item => item.price));
        
        const renderedVehicles = ejs.render(ejsData,{imageUrls,names,prices}); 
        response.end(renderedVehicles);
        
    } catch(err){
        console.error(err);
    }
}
module.exports = renderVehicles;