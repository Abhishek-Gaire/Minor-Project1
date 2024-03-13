import ejs from"ejs";
import fsPromises from"fs/promises";
import path from'path';
import url from "url";
import{getCollectionName} from "../Models/model.js";
const __dirname = path.resolve();
const renderHomePage = async (req,res) => {
  try {
    const filePath = path.join(__dirname + "/views/page/index.ejs");
    const ejsData = await fsPromises.readFile(filePath, "utf8");
    const collection = await getCollectionName();
    const modelsData = await collection.find({}).toArray();
    // console.log(modelsData);
    const names = modelsData.map((item) => item.name);
    const heads = modelsData.map((item) => item.head);
    const descriptions = modelsData.map((item) => item.description);
    const prices = modelsData.map((item) => item.price);
    const imageUrls = modelsData.map((item) => item.imageUrl)

    const renderedHTML = ejs.render(ejsData, { names,heads,descriptions,prices,imageUrls});
    res.end(renderedHTML);
    
  } catch (err) {
    console.error(err);
  }
};

const renderVehicles = async(req,res) =>{
    try{
        const collection = await getCollectionName();
        const filePath = path.join(__dirname,"views/page/vehicles.ejs")
        const ejsData = await fsPromises.readFile(filePath, "utf8");
        
        const vehiclesData = await collection.find({}).toArray();
        
        const renderedVehicles = ejs.render(ejsData,{vehiclesData}); 
        res.end(renderedVehicles);
        
    } catch(err){
        console.error(err);
    }
};

const renderModelView = async(req,res) =>{
    try{
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      
      // Extract the token parameter from the url
      const token = parsedUrl.search.slice(1);
      console.log(token); 
        
      const filePath = path.join(__dirname,"views/page/modelview.html")
      const ejsData = await fsPromises.readFile(filePath, "utf8");
        
      const renderedVehicles = ejs.render(ejsData); 
      res.end(renderedVehicles);
        
    } catch(err){
        console.error(err);
    }
}
export{ renderHomePage,renderModelView,renderVehicles};