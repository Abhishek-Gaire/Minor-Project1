import { ObjectId } from "mongodb";
import { getCollectionName } from "../../Models/model.js";



const sendModelData = async(req,res) => {
    const query = req.url.split("?")[1];

    const id = query.split("=")[1];

    const collection = await getCollectionName();

    const data = await collection.findOne({_id: new ObjectId(id)});

    res.writeHead(200,{ContentType: 'application/json'});
    res.end(JSON.stringify(data));
}

export {sendModelData};