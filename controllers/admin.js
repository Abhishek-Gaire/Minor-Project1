import bcrypt from "bcrypt";
import fs from "fs/promises";
import { ObjectId } from "mongodb";

import * as Models from "../Models/model.js";
import { getAdminCollectionName, getAdminByEmail } from "../Models/admin.js";
import {
  getCounterCollectionName,
  getOrderCollectionName,
} from "../Models/order.js";
import { generateAdminToken } from "../helper/jwtHelper.js";
import { renderPage, parseFormData } from "../helper/appHelper.js";
import {
  getDate,
  parseFormDataWithImage,
  deleteCookie,
} from "../helper/adminHelper.js";
import { getCollectionName } from "../Models/user.js";

const checkAdmin = (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    res.end();
    return false;
  }
  return true;
};

const parseQuery = (req) => {
  const query = req.url.split("?")[1];
  if (!query) return {};
  return Object.fromEntries(new URLSearchParams(query));
};

const getAdmin = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const collection = await getAdminCollectionName();
  const counterCollection = await getCounterCollectionName();
  const modelCollection = await Models.getCollectionName();
  const bookedCollection = await getOrderCollectionName();

  const adminData = await getAdminByEmail(collection, req.admin.id);
  const counterCount = await counterCollection.findOne({});
  const models = await modelCollection.find().toArray();
  const bookedCars = await bookedCollection.find().toArray();

  const filePath = "/views/admin/admin2.ejs";
  const data = {
    title: "Admin Dashboard",
    adminData,
    loadCount: counterCount?.loadCount || 0,
    cars: models.length,
    bookedCar: bookedCars.length,
  };
  await renderPage(res, filePath, data);
};

const getAddVehicles = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const filePath = "/views/admin/addVehicle.ejs";
  const collection = await getAdminCollectionName();
  const adminData = await getAdminByEmail(collection, req.admin.id);
  const { isEdit, modelId } = parseQuery(req);

  if (isEdit && modelId) {
    const modelCollection = await Models.getCollectionName();
    const modelData = await Models.getDataById(modelCollection, modelId);
    const data = {
      title: "Admin Edit Car",
      adminData,
      errorMessage: "",
      isEditing: true,
      models: modelData,
    };
    await renderPage(res, filePath, data);
    return;
  }

  const data = {
    title: "Admin Add Car",
    adminData,
    errorMessage: "",
    isEditing: false,
    models: "",
  };
  await renderPage(res, filePath, data);
};

const getManageUsers = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const collection = await getAdminCollectionName();
  const userCollection = await getCollectionName();
  const adminData = await getAdminByEmail(collection, req.admin.id);
  const users = await userCollection.find({}).toArray();

  const filePath = "/views/admin/manageUser_admin.ejs";
  const data = {
    title: "Manage Users",
    adminData,
    userData: users,
  };
  await renderPage(res, filePath, data);
};

const getBookedCarAdmin = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const collection = await getAdminCollectionName();
  const orderCollection = await getOrderCollectionName();

  const adminData = await getAdminByEmail(collection, req.admin.id);
  const orders = await orderCollection.find({}).toArray();

  const filePath = "/views/admin/booking_admin.ejs";
  const data = {
    title: "Booked Cars",
    adminData: adminData,
    orderData: orders,
  };
  await renderPage(res, filePath, data);
};

const getCarsAdmin = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const collection = await getAdminCollectionName();
  const modelCollection = await Models.getCollectionName();

  const adminData = await getAdminByEmail(collection, req.admin.id);
  const modelData = await modelCollection.find({}).toArray();
  const filePath = "/views/admin/admin_car.ejs";
  const data = {
    title: "All Cars",
    adminData: adminData,
    modelData: modelData,
  };
  await renderPage(res, filePath, data);
};

const postAddVehicles = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const filePath = "/views/admin/addVehicle.ejs";
  const collection = await getAdminCollectionName();
  const adminData = await getAdminByEmail(collection, req.admin.id);
  const modelCollection = await Models.getCollectionName();
  const { fields, files } = await parseFormDataWithImage(req);

  const {
    name,
    price,
    year,
    descriptionCar,
    descriptionEngine,
    descriptionTyre,
    typeNames,
  } = fields;

  const model3D = files.model[0];
  const imageFile = files.image[0];

  if (
    imageFile.mimetype === "image/png" ||
    imageFile.mimetype === "image/jpeg" ||
    imageFile.mimetype === "image/jpg"
  ) {
    const exists = await modelCollection.findOne({
      name: name[0],
      price: Number(price[0]),
      modelYear: Number(year[0]),
      type: typeNames[0],
    });

    if (exists) {
      await modelCollection.updateOne(
        { _id: new ObjectId(exists._id) },
        { $set: { stocks: Number(exists.stocks) + 1 } }
      );

      res.writeHead(302, { Location: `/admin/car-details?id=${exists._id}` });
      res.end();
      return;
    }

    const fileUploadPathForImages = "./assets/CarImages";
    const fileUploadPathForModels = "./assets/CarGLBModel";
    const date = getDate();

    const imageName = `${date}-${imageFile.originalFilename}`;
    const modelName = `${date}-${model3D.originalFilename}`;

    const newPathForImages = `${fileUploadPathForImages}/${imageName}`;
    const newPathForModels = `${fileUploadPathForModels}/${modelName}`;

    await fs.rename(imageFile.filepath, newPathForImages);
    await fs.rename(model3D.filepath, newPathForModels);

    const newModel = {
      name: name[0],
      price: Number(price[0]),
      descriptionOfCar: descriptionCar[0],
      imageUrl: newPathForImages,
      modelUrl: newPathForModels,
      type: typeNames[0],
      modelYear: Number(year[0]),
      descriptionOfEngine: descriptionEngine[0],
      descriptionOfTyre: descriptionTyre[0],
      stocks: 1,
    };
    const uploaded = await Models.createModel(modelCollection, newModel);
    if (!uploaded) {
      res.writeHead(500, { Location: "/500-error" });
      res.end();
      return;
    }

    res.writeHead(302, {
      Location: `/admin/car-details?id=${uploaded.insertedId}`,
    });
    res.end();
    return;
  }
  const data = {
    title: "Add Car",
    adminData: adminData,
    errorMessage: "Invalid File Type! Please upload an Image",
    isEditing: false,
  };
  return await renderPage(res, filePath, data);
};

const postEditVehicles = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const filePath = "/views/admin/addVehicle.ejs";

  const collection = await getAdminCollectionName();
  const adminData = await getAdminByEmail(collection, req.admin.id);

  const modelCollection = await Models.getCollectionName();

  const formData = await parseFormDataWithImage(req);

  const { fields, files } = formData;
  const model3D = files.model[0];
  const imageFile = files.image[0];
  const {
    name,
    price,
    year,
    descriptionCar,
    descriptionEngine,
    descriptionTyre,
    typeNames,
    modelID,
  } = fields;

  const id = modelID[0].replace(/ /g, "");
  if (
    imageFile.mimetype === "image/png" ||
    imageFile.mimetype === "image/jpeg" ||
    imageFile.mimetype === "image/jpg"
  ) {
    const fileUploadPathForImages = "./assets/CarImages";
    const fileUploadPathForModels = "./assets/CarGLBModel";

    const oldImageFileName = imageFile.originalFilename;
    const oldModelFileName = model3D.originalFilename;

    const date = getDate();

    const imageName = `${date}-${oldImageFileName}`;
    const modelName = `${date}-${oldModelFileName}`;

    const newPathForImages = `${fileUploadPathForImages}/${imageName}`;
    const newPathForModels = `${fileUploadPathForModels}/${modelName}`;

    // Move the imagFile to the images folder
    await fs.rename(imageFile.filepath, newPathForImages);
    // Move the 3d model to the CarGLBModel folder
    await fs.rename(model3D.filepath, newPathForModels);

    await modelCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name[0],
          price: Number(price[0]),
          descriptionOfCar: descriptionCar[0],
          imageUrl: newPathForImages,
          modelUrl: newPathForModels,
          type: typeNames[0],
          modelYear: Number(year[0]),
          descriptionOfEngine: descriptionEngine[0],
          descriptionOfTyre: descriptionTyre[0],
        },
      }
    );

    res.writeHead(302, { Location: `/admin/car-details?id=${id}` });
    res.end();
  }
  const data = {
    title: "Add Car",
    adminData: adminData,
    errorMessage: "Invalid File Type! Please upload an Image",
    isEditing: false,
  };
  return await renderPage(res, filePath, data);
};

const postLoginAdmin = async (req, res) => {
  const filePath = "/views/auth/login.ejs";

  const formData = await parseFormData(req);

  const { email, password } = formData;

  const collectionName = await getAdminCollectionName();

  // Fetch admin from the database by email
  const admin = await getAdminByEmail(collectionName, email);

  if (!admin) {
    const data = {
      admin: true,
      message:
        "No admin with that email exists! Please contact your system administrator.",
    };
    return await renderPage(res, filePath, data);
  }
  const match = await bcrypt.compare(password, admin.password);
  if (match) {
    // Generate JWT token
    const adminToken = await generateAdminToken(admin.email);

    // Set JWT token in a cookie
    res.setHeader("Set-Cookie", `adminToken=${adminToken}; HttpOnly`);

    res.writeHead(302, { Location: "/admin" });
    res.end();
  } else {
    //Invalid Credentials
    const data = {
      message: "Invalid Email or Password",
      admin: true,
    };
    await renderPage(res, filePath, data);
    return;
  }
};

const postLogoutAdmin = async (req, res) => {
  const filePath = "/views/auth/login.ejs";
  if (req.adminToken) {
    // console.log("Inside If");
    deleteCookie(res, "adminToken");
    const data = {
      message: "You are successfully logged out",
      admin: true,
    };
    await renderPage(res, filePath, data);
    return;
  }
  console.log("Outside if in post Logout");
};

const getCarDetails = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    res.end();
    return;
  }
  const filePath = "/views/admin/car_details.ejs";
  const query = req.url.split("?")[1];
  const id = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();
  const vehicleData = await Models.getDataById(modelCollection, id);

  if (!vehicleData) {
    res.writeHead(500, { Location: "/500-err0r" });
    return res.end();
  }

  const data = {
    vehicleData: vehicleData,
  };
  return await renderPage(res, filePath, data);
};

const getAdminModelView = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    res.end();
    return;
  }
  const filePath = "/views/admin/adminModelView.ejs";
  const query = req.url.split("?")[1];
  const id = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();
  const modelData = await Models.getDataById(modelCollection, id);

  await renderPage(res, filePath, { models: modelData });
};

const deleteModel = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const query = req.url.split("?")[1];
  const modelID = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();

  const deleted = await modelCollection.deleteOne({
    _id: new ObjectId(modelID),
  });

  if (deleted) {
    res.writeHead(302, { Location: "/admin/cars" });
    return res.end();
  }
};

const changeTopSelling = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const query = req.url.split("?")[1];
  const modelID = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();

  await modelCollection.updateOne(
    { isHomePage: true },
    {
      $set: {
        isHomePage: false,
      },
    }
  );

  const isHomePageUpdated = modelCollection.updateOne(
    { _id: new ObjectId(modelID) },
    { $set: { isHomePage: true } }
  );

  if (isHomePageUpdated) {
    res.writeHead(302, { Location: "/admin/cars" });
    return res.end();
  }
};

const changeStatus = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }

  const query = req.url.split("?")[1];

  const modelId = query.split("=")[1].split("&")[0];

  const status = query.split("&")[1];

  const orderCollection = await getOrderCollectionName();

  if (status === "pending") {
    await orderCollection.updateOne(
      { _id: new ObjectId(modelId) },
      {
        $set: { status: "approved" },
      }
    );
    res.writeHead(302, { Location: "/admin/bookedVehicles" });
    return res.end();
  } else if (status === "approved") {
    await orderCollection.updateOne(
      { _id: new ObjectId(modelId) },
      {
        $set: { status: "pending" },
      }
    );
    res.writeHead(302, { Location: "/admin/bookedVehicles" });
    return res.end();
  } else {
    res.writeHead(302, { Location: "/admin/bookedVehicles" });
    return res.end();
  }
};

const cancelModel = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const query = req.url.split("?")[1];
  const modelId = query.split("=")[1];
  const ordersCollection = await getOrderCollectionName();

  await ordersCollection.updateOne(
    { _id: new ObjectId(modelId) },
    {
      $set: { status: "cancel" },
    }
  );
  res.writeHead(302, { Location: "/admin/bookedVehicles" });
  res.end();
};

const addStocks = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const query = req.url.split("?")[1];
  const modelId = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();

  const added = modelCollection.findOneAndUpdate(
    { _id: new ObjectId(modelId) },
    {
      $inc: { stocks: 1 },
    }
  );

  if (!added) {
    res.writeHead(500, { Location: "/500-error" });
    return res.end();
  }
  res.writeHead(302, { Location: "/admin/cars" });
  res.end();
};

const removeStocks = async (req, res) => {
  if (!req.admin) {
    res.writeHead(302, { Location: "/login?adminExists=false" });
    return res.end();
  }
  const query = req.url.split("?")[1];
  const modelId = query.split("=")[1];

  const modelCollection = await Models.getCollectionName();

  const modelData = await Models.getDataById(modelCollection, modelId);
  await modelCollection.findOneAndUpdate(
    { _id: new ObjectId(modelId) },
    {
      $set: {
        stocks: Number(modelData.stocks) - 1,
      },
    }
  );

  res.writeHead(302, { Location: "/admin/cars" });
  res.end();
};

export {
  getAdmin,
  getAddVehicles,
  postAddVehicles,
  postLoginAdmin,
  getManageUsers,
  getBookedCarAdmin,
  getCarsAdmin,
  postLogoutAdmin,
  getCarDetails,
  getAdminModelView,
  deleteModel,
  changeTopSelling,
  changeStatus,
  cancelModel,
  postEditVehicles,
  addStocks,
  removeStocks,
};
