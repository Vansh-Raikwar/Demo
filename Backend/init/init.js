const mongoose = require("mongoose");
const model = require("../models/model.js");
const initdata = require("./data.js");
const schema = require("../models/listing.js");

async function main(){
   await mongoose.connect("mongodb://127.0.0.1:27017/Wonderlust");
}
main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
})

const initdb = async()=>{
    await model.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj , owner : "6783cdf90a08f2e58d903943"}))
    await model.insertMany(initdata.data);
    console.log("succesfull saved");
}
initdb();