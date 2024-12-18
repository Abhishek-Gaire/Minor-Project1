import validator from "validator";
import bcrypt from "bcrypt";
import {
  getUserByEmail,
  getCollectionName,
  createUser,
} from "../Models/user.js";
import {
  generateToken,
  generateVerificationCode,
} from "../helper/jwtHelper.js";
import { renderPage, parseFormData } from "../helper/appHelper.js";
import { mailOptions, transporter } from "../helper/nodemailerHelper.js";
import { deleteCookie } from "../helper/adminHelper.js";

const postLoginUser = async (req, res) => {
  try {
    const filePath = "/views/auth/login.ejs";

    const { email, password } = await parseFormData(req);

    const Users = await getCollectionName();
    const user = await getUserByEmail(Users, email);

    if (!user) {
      return renderPage(res, filePath, {
        message: "No user with that email exists!",
        admin: false,
      });
    }

    const matched = await bcrypt.compare(password, user.password);

    if (matched) {
      const token = await generateToken(user._id);
      res.setHeader("Set-Cookie", `userToken=${token}; HttpOnly`);
      res.writeHead(302, { Location: "/" });
      return res.end();
    } else {
      return renderPage(res, filePath, {
        message: "Invalid Password",
        admin: false,
      });
    }
  } catch (error) {
    console.error("Error in postLoginUser:", error);
  }
};
const getLogin = async (req, res) => {
  try {
    const fullQuery = req.url.split("?")[1];
    const filePath = "/views/auth/login.ejs";

    if (!fullQuery) {
      return renderPage(res, filePath, { message: "", admin: false });
    }

    const query = fullQuery.split("=")[0];

    if (query === "userExists") {
      return renderPage(res, filePath, {
        message: "User Already Exists",
        admin: false,
      });
    }

    return renderPage(res, filePath, {
      message: "Welcome to Admin Login",
      admin: true,
    });
  } catch (error) {
    console.error("Error in getLogin:", error);
  }
};

const postSignUP = async (req, res) => {
  try {
    const filePath = "/views/auth/signup.ejs";

    const { username, email, password } = await parseFormData(req);

    const validationErrors = validateSignupFields(username, email, password);

    if (validationErrors) {
      return renderPage(res, filePath, {
        ...validationErrors,
        username,
        email,
        password,
      });
    }

    const Users = await getCollectionName();
    const existingUser = await getUserByEmail(Users, email);

    if (existingUser) {
      res.writeHead(302, { Location: "/login?userExists=true" });
      res.end();
      return;
    }
    const verificationCode = generateVerificationCode();
    const sendingMail = mailOptions(email, verificationCode);

    transporter.sendMail(sendingMail, async (error) => {
      if (error) {
        console.error("Error sending verification email:", error);
        return renderPage(res, filePath, {
          errorMessage:
            "Email is not valid! Please try again with another email",
        });
      }
    });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      username: username,
      email: email,
      password: hashedPassword,
      verified: false,
      verificationCode: verificationCode,
      resetToken: null,
    };

    await createUser(Users, newUser);
    const token = await generateToken(email);
    res.writeHead(302, { Location: `/verify?token=${token}` });
    res.end();
  } catch (error) {
    console.error("Error in postSignUP:", error);
  }
};

const getSignUP = async (req, res) => {
  try {
    const filePath = "/views/auth/signup.ejs";
    await renderPage(res, filePath, {
      errorMessage: "",
      username: "",
      password: "",
      email: "",
    });
  } catch (error) {
    console.error("Error in getSignUP:", error);
  }
};

const postLogoutUser = async (req, res) => {
  try {
    const filePath = "/views/auth/login.ejs";
    if (req.token) {
      deleteCookie(res, "userToken");
      return renderPage(res, filePath, {
        message: "You are successfully logged out",
        admin: false,
      });
    }
  } catch (error) {
    console.error("Error in postLogoutUser:", error);
  }
};

const validateSignupFields = (username, email, password) => {
  if (!validator.isAlphanumeric(username) || validator.isEmpty(username)) {
    return { errorMessage: "Username is not valid" };
  }

  if (!validator.isEmail(email)) {
    return { errorMessage: "Email is not valid" };
  }

  if (!validator.isStrongPassword(password)) {
    return {
      errorMessage:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };
  }

  return null;
};

export { postSignUP, postLoginUser, getLogin, getSignUP, postLogoutUser };
