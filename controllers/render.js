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
        const ejsData = await readFileAsync(filePath);
        const renderedHTML = ejs.render(ejsData, data);
        res.end(renderedHTML);
  } catch (err) {
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

        await renderPage(req, res, "/views/page/index.ejs", { names, heads, descriptions, prices, imageUrls });
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
        const filePath = path.join(__dirname, "views/page/modelview.html");
        const ejsData = await readFileAsync(filePath);
        const renderedModelView = ejs.render(ejsData);
        res.end(renderedModelView);
    } catch (err) {
        console.error(err);
    }
};

export { renderHomePage, renderModelView, renderVehicles };
