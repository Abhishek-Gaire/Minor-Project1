const ejs = require("ejs");
const fsPromises = require("fs").promises;

const renderHTML = async (res, collection, filePath) => {
  try {
    const ejsData = await fsPromises.readFile(filePath, "utf8");

    const modelsData = await collection.find({}).toArray();
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

module.exports = renderHTML;
