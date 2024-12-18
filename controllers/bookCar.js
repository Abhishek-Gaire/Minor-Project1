import { ObjectId } from "mongodb";
import { URL } from "url";
import jwt from "jsonwebtoken";
import { getCollectionName, getDataById } from "../Models/model.js";
import * as Users from "../Models/user.js";
import * as Orders from "../Models/order.js";

import { renderPage } from "../helper/appHelper.js";
import { parseFormData } from "../helper/appHelper.js";
import { transporter } from "../helper/nodemailerHelper.js";

const redirectToLogin = (res) => {
  res.writeHead(302, { Location: "/login" });
  res.end();
};

const sendMail = (options, res) => {
  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.writeHead(500, { Location: "/500-error" }).end();
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

const getBookCar = async (req, res) => {
  if (!req.user) return redirectToLogin(res);

  const filePath = "/views/page/bookcar.ejs";
  const userId = req.user.id;
  const vehicleID = req.url.split("?")[1];

  const collection = await getCollectionName();
  const vehicleData = await getDataById(collection, vehicleID);

  const users = await Users.getCollectionName();
  const userData = await Users.getUserByID(users, userId);

  const isAvailable = vehicleData.stocks > 0;
  const data = {
    vehicleData,
    userData,
    message: isAvailable ? "" : "This car is not available at the moment!",
    isAvailable,
  };

  await renderPage(res, filePath, data);
};

const postBooking = async (req, res) => {
  if (!req.user) return redirectToLogin(res);

  const query = req.url.split("?")[1];
  const hasStocks = query.split("=")[1] === "true";
  const formData = await parseFormData(req);
  const { vehicleId: modelId, advancePayment } = formData;

  const userId = req.user.id;
  const userCollection = await Users.getCollectionName();
  const userData = await Users.getUserByID(userCollection, userId);
  const filePath = "/views/page/confirmBookCar.ejs";

  const data = {
    userData,
    modelId,
    hasStocks,
    advancePayment: Number(advancePayment),
  };

  await renderPage(res, filePath, data);
};

const postConfirmBookCar = async (req, res) => {
  if (!req.user) return redirectToLogin(res);
  const formData = await parseFormData(req);

  const {
    firstName,
    lastName,
    address,
    phoneNumber,
    email,
    color,
    stocks,
    vehicleId,
    advancePayment,
  } = formData;

  const userID = req.user.id;
  const modelCollection = await getCollectionName();
  const userCollection = await Users.getCollectionName();
  const orderCollection = await Orders.getOrderCollectionName();
  const modelData = await getDataById(modelCollection, vehicleId);

  const userUpdated = await userCollection.updateOne(
    {
      _id: new ObjectId(userID),
    },
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        address: address,
        contactNumber: phoneNumber,
      },
    }
  );
  if (!userUpdated) {
    res.writeHead(500, { Location: "/500-error" });
    res.end();
    return;
  }
  const token = jwt.sign({ email }, process.env.USER_SECRET_KEY, {
    expiresIn: "7d",
  });

  const orderData = {
    FullName: `${firstName} ${lastName}`,
    carName: modelData.name,
    email,
    contactNumber: phoneNumber,
    colorOfCar: color,
    advancePayment,
    createdAt: new Date(),
  };

  if (stocks === "0") {
    orderData.status = "noStocks";
    const orderCreated = await orderCollection.insertOne(orderData);

    if (!orderCreated) {
      res.writeHead(500, { Location: "/500-error" });
      res.end();
      return;
    }

    const orderID = orderCreated.insertedId.toString();

    sendMail(
      {
        from: "projectMinor1@gmail.com",
        to: email,
        subject: "Booked Car Successful",
        html: `Dear ${firstName}, Your booking of the car ${modelData.name} has been successful, but we are out of stock. Once stock is added, we will notify you. To cancel, click <a href="http://localhost:5173/cancelBooking?id=${orderID}&token=${token}">here</a>. This link expires in 7 days.`,
      },
      res
    );
    // Redirect to the success page
    res.writeHead(302, { Location: `/modelview?${vehicleID}` });
    return res.end();
  }
  await modelCollection.updateOne(
    { _id: new ObjectId(vehicleId) },
    {
      $set: {
        stocks: Number(modelData.stocks) - 1,
      },
    }
  );

  orderData.status = "pending";
  const orderCreated = await orderCollection.insertOne(orderData);

  if (!orderCreated) {
    res.writeHead(500, { Location: "/500-error" });
    res.end();
    return;
  }
  const orderID = orderCreated.insertedId.toString();

  sendMail(
    {
      from: "projectMinor1@gmail.com",
      to: email,
      subject: "Booked Car Successful",
      html: `Dear ${firstName}, Your booking of the car ${modelData.name} has been successful. To cancel, click <a href="http://localhost:5173/cancelBooking?id=${orderID}&token=${token}">here</a>. This link expires in 7 days.`,
    },
    res
  );
  // Redirect to the success page
  res.writeHead(302, { Location: `/modelview?${vehicleID}` });
  res.end();
};

const cancelBooking = async (req, res) => {
  if (!req.user) return redirectToLogin(res);
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const orderId = parsedUrl.searchParams.get("id");
  const token = parsedUrl.searchParams.get("token");

  if (!orderId || !token) {
    return res.writeHead(404, { Location: "/404-error" }).end();
  }

  const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);

  if (!decoded) {
    return res.writeHead(401).end("You are not authorized"); //Unauthorized
  }

  const userEmail = decoded.email;
  const userCollection = await Users.getCollectionName();
  const orderCollection = await Orders.getOrderCollectionName();
  const userData = await Users.getUserByID(userCollection, req.user.id);

  if (userEmail !== userData.email) {
    res.writeHead(401).end("Unauthorized");
    return;
  }

  const updated = await orderCollection.updateOne(
    { _id: new ObjectId(orderId) },
    { $set: { status: "Cancelled" } }
  );

  if (updated) {
    sendMail(
      {
        from: "projectMinor1@gmail.com",
        to: userEmail,
        subject: "Cancelled Car Successful",
        html: `Dear ${userData.firstName}, Your booking has been cancelled.`,
      },
      res
    );

    res.writeHead(302, { Location: "/" }).end();
  }
};
export { getBookCar, postConfirmBookCar, postBooking, cancelBooking };
