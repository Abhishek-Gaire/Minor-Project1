import ejs from "ejs";
import fsPromises from "fs/promises";
import path from 'path';

// import { getCollectionName } from "../Models/model.js";

const __dirname = path.resolve();

const readFileAsync = async (filePath) => {
  return await fsPromises.readFile(filePath, "utf8");
};
const getAdmin = async(req,res) => {
    const filePath = path.join(__dirname,"/views/admin/admin.ejs");
    const data = await readFileAsync(filePath);
    const adminFile = ejs.render(data);
    res.end(adminFile);
}
const getAddVehicles = async(req,res) => {
    const filePath = path.join(__dirname,"/views/admin/addVehicle.html");    
    const data = await readFileAsync(filePath);
    res.end(ejs.render(data));
}
const postAddVehicles = async(req,res) => {
    //nothing right now
}
export {getAdmin,getAddVehicles,postAddVehicles};