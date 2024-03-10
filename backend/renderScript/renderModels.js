const ejs = require("ejs");
const fsPromises = require("fs").promises;
const path = require('path');

const {getCollectionName} = require("../DBConnect/modelsDB");
const renderHomePage = async (req,res) => {
  try {
    const filePath = path.join(__dirname + "../../../views/page/index.ejs");
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

module.exports = renderHomePage;
