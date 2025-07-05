const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
 
const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
})

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model("User",userSchema);
module.exports= userModel;