const ejs = require("ejs");
const fsPromises = require("fs").promises;

const renderHTML = async (res, collection, filePath) => {
  try {
    const ejsData = await fsPromises.readFile(filePath, "utf8");

    const modelsData = await collection.find({}).toArray();
    const names = modelsData.map((item) => item.name);
    const imageUrls = modelsData.map((item) => item.imageUrl)

    const renderedHTML = ejs.render(ejsData, { names, imageUrls });
    res.end(renderedHTML);
  } catch (err) {
    console.error(err);
  }
};

module.exports = renderHTML;
