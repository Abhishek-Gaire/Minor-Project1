import {verify,getVerify} from"../controllers/verification.js";
import * as PasswordControllers from"../controllers/resetpassword.js";

import * as PageControllers from"../controllers/render.js";
import * as AdminControllers from "../controllers/admin.js";

import * as AuthControllers from"../controllers/login.js";

import { getBookCar,postBookCar } from "../controllers/bookCar.js";


const routes = {
    "POST": {
        "/signup": AuthControllers.postSignUP,
        "/login": AuthControllers.postLoginUser,
        "/verify": verify,
        "/reset-password": PasswordControllers.postReset,
        "/update-password":PasswordControllers.postUpdatePassword,
        "/addVehicles": AdminControllers.postAddVehicles,
        "/logout":AuthControllers.postLogoutUser,
        "/adminLogin":AdminControllers.postLoginAdmin,
        "/editVehicles":AdminControllers.postEditVehicles,
        
        "/confirmBookCar":postBookCar,
    },
    "GET": {
        "/":PageControllers.renderHomePage,
        "/modelview":PageControllers.renderModelView,
        "/vehicles":PageControllers.renderVehicles,
        "/about":PageControllers.renderAboutPage,
        "/contact":PageControllers.renderContactPage,
        "/signup": AuthControllers.getSignUP,
        "/login": AuthControllers.getLogin,
        "/forgot-password": PasswordControllers.getReset,
        "/reset-password": PasswordControllers.getUpdatePassword,
        "/admin" :AdminControllers.getAdmin,
        "/admin/dashboard": AdminControllers.getAdmin,
        "/admin/addVehicles": AdminControllers.getAddVehicles,
        "/admin/cars": AdminControllers.getCarsAdmin,
        "/admin/manageUsers" :AdminControllers.getManageUsers,
        "/admin/bookedVehicles" :AdminControllers.getBookedCarAdmin,
        "/admin/car-details": AdminControllers.getCarDetails,
        "/book-car":getBookCar,
        "/verify":getVerify,
        "/500-error":PageControllers.get500Error,
        "/adminLogout":AdminControllers.postLogoutAdmin,
        "/adminModelView":AdminControllers.getAdminModelView,
        "/admin/deleteModel":AdminControllers.deleteModel,
        "/admin/changeStatus":AdminControllers.changeStatus,
        "/admin/cancelModel":AdminControllers.cancelModel,
        "/admin/changeHomePage":AdminControllers.changeTopSelling,
        "/admin/addStocks":AdminControllers.addStocks,
        "/admin/removeStocks":AdminControllers.removeStocks,
    }
}; 


export {routes};