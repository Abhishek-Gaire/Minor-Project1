import crypto from "crypto";
import bcrypt from "bcrypt";

import { transporter } from "../helper/nodemailerHelper.js";
import {
  getCollectionName,
  getUserByToken,
  getUserByEmail,
  addToken,
} from "../Models/user.js";
import { renderPage, parseFormData } from "../helper/appHelper.js";

const redirectWithMessage = (
  res,
  location,
  message = null,
  statusCode = 302
) => {
  if (message) console.log(message);
  res.writeHead(statusCode, { Location: location });
  res.end();
};

const postReset = async (req, res) => {
  try {
    const formData = await parseFormData(req);
    const email = formData.email;

    if (!email) {
      return redirectWithMessage(res, "/forgot-password", "Email not provided");
    }

    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    const collection = await getCollectionName();
    const user = await getUserByEmail(collection, email);

    if (!user) {
      return redirectWithMessage(
        res,
        "/forgot-password",
        "No user with that email"
      );
    }
    const addedToken = await addToken(token, collection, user._id);

    if (addedToken) {
      const mailOptions = {
        from: "projectMinor1@gmail.com",
        to: email,
        subject: "Password Reset Token",
        html: `<p>You requested a password reset</p><p>Click this <a href="http://localhost:5173/reset-password?${token}">link</a> to set up a new password</p>`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending reset token email:", error);
          return redirectWithMessage(
            res,
            "/forgot-password",
            "Internal Server Error",
            500
          );
        }
        console.log("Reset token email sent.");
      });

      return redirectWithMessage(res, "/login");
    } else {
      return redirectWithMessage(res, "/forgot-password", "Error adding token");
    }
  } catch (err) {
    console.error("Error in postReset:", err);
    return redirectWithMessage(
      res,
      "/forgot-password",
      "Internal Server Error",
      500
    );
  }
};

const getReset = async (req, res) => {
  try {
    const query = req.url.split("?")[1];
    const admin = Boolean(query);
    const data = { admin };
    await renderPage(res, "/views/auth/forgotPassword.ejs", data);
  } catch (err) {
    console.error("Error in getReset:", err);
    return redirectWithMessage(res, "/500", "Internal Server Error", 500);
  }
};

const getUpdatePassword = async (req, res) => {
  try {
    const token = req.url.split("?")[1];

    if (!token) {
      return redirectWithMessage(res, "/forgot-password", "Token not provided");
    }

    const collection = await getCollectionName();
    const user = await getUserByToken(collection, token);

    const data = user
      ? { token, errorMessage: null }
      : { token: "", errorMessage: "No user with that token exists." };

    await renderPage(res, "/views/auth/new-password.ejs", data);
  } catch (err) {
    console.error("Error in getUpdatePassword:", err);
    return redirectWithMessage(res, "/500", "Internal Server Error", 500);
  }
};

const postUpdatePassword = async (req, res) => {
  try {
    const formData = await parseFormData(req);
    const {
      resetToken: token,
      newPassword: password,
      confirmPassword,
    } = formData;

    if (password !== confirmPassword) {
      const data = { token, errorMessage: "Passwords have to match!" };
      return await renderPage(res, "/views/auth/new-password.ejs", data);
    }

    const collection = await getCollectionName();
    const user = await getUserByToken(collection, token);

    if (user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await collection.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword, resetToken: null } }
      );
      return redirectWithMessage(res, "/login");
    } else {
      const data = {
        token: "",
        errorMessage: "User with that token not found",
      };
      return await renderPage(res, "/views/auth/new-password.ejs", data);
    }
  } catch (err) {
    console.error("Error in postUpdatePassword:", err);
    return redirectWithMessage(res, "/500", "Internal Server Error", 500);
  }
};
export { getUpdatePassword, getReset, postReset, postUpdatePassword };
