const verify= require("../backend/controllers/verification.js");
const {getReset,postReset} = require("../backend/controllers/resetpassword.js");
const {getUpdatePassword,postUpdatePassword} = require("../backend/controllers/newpassword.js")
const renderVehicles = require("../backend/renderScript/renderVehicles.js");
const renderHomePage = require("../backend/renderScript/renderModels.js");
const renderModelView = require("../backend/renderScript/modelView");

const {getSignUP,postSignUP} = require("../backend/controllers/signup.js");
const {getLogin,postLogin} = require("../backend/controllers/login.js");

const routes = {
    "POST": {
        "/signup": postSignUP,
        "/login": postLogin,
        "/verify": verify,
        "/reset-password": postReset,
        "/update-password":postUpdatePassword
    },
    "GET": {
        "/":renderHomePage,
        "/modelview":renderModelView,
        "/vehicles":renderVehicles,
        "/signup": getSignUP,
        "/login": getLogin,
        "/forgot-password": getReset,
        "/reset-password": getUpdatePassword,
    }
}; 

module.exports = routes;