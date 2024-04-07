import {verify,getVerify} from"../controllers/verification.js";
import {getReset,postReset,getUpdatePassword,postUpdatePassword} from"../controllers/resetpassword.js";

import {renderVehicles,renderModelView,renderHomePage} from"../controllers/render.js";
import { getAdmin ,getAddVehicles,postAddVehicles,postLoginAdmin} from "../controllers/admin.js";

import {getLogin,postLoginUser,getSignUP,postSignUP,postLogoutUser} from"../controllers/login.js";

import { getBookCar } from "../controllers/bookCar.js";
const routes = {
    "POST": {
        "/signup": postSignUP,
        "/login": postLoginUser,
        "/verify": verify,
        "/reset-password": postReset,
        "/update-password":postUpdatePassword,
        "/addVehicles": postAddVehicles,
        "/logout":postLogoutUser,
        "/adminLogin":postLoginAdmin,
    },
    "GET": {
        "/":renderHomePage,
        "/modelview":renderModelView,
        "/vehicles":renderVehicles,
        "/signup": getSignUP,
        "/login": getLogin,
        "/forgot-password": getReset,
        "/reset-password": getUpdatePassword,
        "/admin" :getAdmin,
        "/addVehicles": getAddVehicles,
        "/book-car":getBookCar,
        "/verify":getVerify,
    }
}; 

export {routes};