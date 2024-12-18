import { getCollectionName, getDataById } from "../Models/model.js";
import { renderPage } from "../helper/appHelper.js";
import { getCounterCollectionName } from "../Models/order.js";

const handleError = async (res, err) => {
  console.error(err);
  await renderPage(res, "/views/500-error.html", {
    data: "Something went wrong",
  });
};

const renderHomePage = async (req, res) => {
  try {
    const collection = await getCollectionName();
    const modelsData = await collection.find({ isHomePage: true }).toArray();

    const counterCollection = await getCounterCollectionName();
    await counterCollection.findOneAndUpdate(
      {},
      { $inc: { loadCount: 1 } }, // Increment the loadCount field by 1
      { upsert: true, returnDocument: "after" } // Create the document if it doesn't exist
    );

    const isLoggedIn = !!req.user;
    await renderPage(res, "/views/page/index.ejs", {
      isLoggedIn,
      models: modelsData,
    });
  } catch (err) {
    await handleError(res, err);
  }
};

const renderVehicles = async (req, res) => {
  try {
    const collection = await getCollectionName();
    const vehiclesData = await collection.find({}).toArray();

    await renderPage(res, "/views/page/vehicles.ejs", { vehiclesData });
  } catch (err) {
    await handleError(res, err);
  }
};

const renderModelView = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const vehicleID = url.searchParams.get("id");

    const collectionName = await getCollectionName();
    const vehicleData = await getDataById(collectionName, vehicleID);

    const isLoggedIn = !!req.user;
    await renderPage(res, "/views/page/modelview.ejs", {
      isLoggedIn,
      models: vehicleData,
    });
  } catch (err) {
    await handleError(res, err);
  }
};

const renderAboutPage = async (req, res) => {
  try {
    await renderPage(res, "/views/page/aboutPage.html", { data: "" });
  } catch (err) {
    await handleError(res, err);
  }
};

const renderContactPage = async (req, res) => {
  try {
    await renderPage(res, "/views/page/contactPage.html", { data: "" });
  } catch (err) {
    await handleError(res, err);
  }
};

const get500Error = async (req, res) => {
  try {
    await renderPage(res, "/views/500-error.html", { data: "" });
  } catch (err) {
    console.error(err);
  }
};

export {
  renderHomePage,
  renderModelView,
  renderVehicles,
  renderAboutPage,
  renderContactPage,
  get500Error,
};
