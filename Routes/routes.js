import { verify, getVerify } from "../controllers/verification.js";
import * as PasswordControllers from "../controllers/resetpassword.js";

import * as PageControllers from "../controllers/render.js";
import * as AdminControllers from "../controllers/admin.js";

import * as AuthControllers from "../controllers/login.js";

import {
  getBookCar,
  postBooking,
  postConfirmBookCar,
  cancelBooking,
} from "../controllers/bookCar.js";

// Organize routes into logical categories
const routes = {
  POST: {
    // Authentication
    "/signup": AuthControllers.postSignUP,
    "/login": AuthControllers.postLoginUser,
    "/verify": verify,
    "/reset-password": PasswordControllers.postReset,
    "/update-password": PasswordControllers.postUpdatePassword,
    "/logout": AuthControllers.postLogoutUser,
    "/adminLogin": AdminControllers.postLoginAdmin,

    // Admin actions
    "/addVehicles": AdminControllers.postAddVehicles,
    "/editVehicles": AdminControllers.postEditVehicles,

    // Booking actions
    "/booking": postBooking,
    "/confirmBookCar": postConfirmBookCar,
  },

  GET: {
    // Page rendering
    "/": PageControllers.renderHomePage,
    "/modelview": PageControllers.renderModelView,
    "/vehicles": PageControllers.renderVehicles,
    "/about": PageControllers.renderAboutPage,
    "/contact": PageControllers.renderContactPage,
    "/500-error": PageControllers.get500Error,

    // Authentication
    "/signup": AuthControllers.getSignUP,
    "/login": AuthControllers.getLogin,
    "/forgot-password": PasswordControllers.getReset,
    "/reset-password": PasswordControllers.getUpdatePassword,

    // Admin pages
    "/admin": AdminControllers.getAdmin,
    "/admin/dashboard": AdminControllers.getAdmin,
    "/admin/addVehicles": AdminControllers.getAddVehicles,
    "/admin/cars": AdminControllers.getCarsAdmin,
    "/admin/manageUsers": AdminControllers.getManageUsers,
    "/admin/bookedVehicles": AdminControllers.getBookedCarAdmin,
    "/admin/car-details": AdminControllers.getCarDetails,
    "/adminLogout": AdminControllers.postLogoutAdmin,
    "/adminModelView": AdminControllers.getAdminModelView,

    // Admin actions
    "/admin/deleteModel": AdminControllers.deleteModel,
    "/admin/changeStatus": AdminControllers.changeStatus,
    "/admin/cancelModel": AdminControllers.cancelModel,
    "/admin/changeHomePage": AdminControllers.changeTopSelling,
    "/admin/addStocks": AdminControllers.addStocks,
    "/admin/removeStocks": AdminControllers.removeStocks,

    // Booking actions
    "/book-car": getBookCar,
    "/verify": getVerify,
    "/cancelBooking": cancelBooking,
  },
};

export { routes };
