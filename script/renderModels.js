const ejs = require("ejs");

const fsPromises = require("fs").promises;
const { closeMongoDB } = require("./mongoConnect");

const renderHTML = async (res, collection, filePath) => {
  try {
    const ejsData = await fsPromises.readFile(filePath, "utf8");
    const modelsData = await collection.find().toArray();
    const models = modelsData.map((model) => model.name);
    console.log(models);
    const renderedHTML = ejs.render(ejsData, { models });
    // console.log(renderedHTML);
    res.end(renderedHTML);
    closeMongoDB();
  } catch (err) {
    console.error(err);
  }
};

module.exports = renderHTML;
