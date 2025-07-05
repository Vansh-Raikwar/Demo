const mongoose = require("mongoose");
const { Schema } = mongoose;
const listingSchema = new Schema({
    title: String,
    description : String,
    image:{
        filename:String,
        url:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true,
        },
        coordinates:{
            type:[Number],
            required:true,
        }
    }
});

const model = require("./model.js");
const Review = require("./review.js").default;

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = listingSchema;