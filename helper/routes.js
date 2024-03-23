import {verify} from"../controllers/verification.js";
import {getReset,postReset,getUpdatePassword,postUpdatePassword} from"../controllers/resetpassword.js";

import {renderVehicles,renderModelView,renderHomePage} from"../controllers/render.js";
import { getAdmin ,getAddVehicles,postAddVehicles} from "../controllers/admin.js";

import {getLogin,postLogin,getSignUP,postSignUP} from"../controllers/login.js";

const routes = {
    "POST": {
        "/signup": postSignUP,
        "/login": postLogin,
        "/verify": verify,
        "/reset-password": postReset,
        "/update-password":postUpdatePassword,
        "/addVehicles": postAddVehicles,
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
    }
}; 

export {routes};