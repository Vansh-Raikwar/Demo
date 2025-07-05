const mongoose = require("mongoose");
const schema = require("./listing.js");
const model = mongoose.model("Wonderlust",schema);
module.exports=model;