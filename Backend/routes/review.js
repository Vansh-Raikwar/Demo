const express = require('express');
const router = express.Router()

const wrapAsy = require("../utility/wrapAsync.js");
const ExpressError = require("../utility/ExpressErrors.js");
const model = require('../models/model.js');
const {reviewSchema} = require("../Schema.js");
const Review = require("../models/review.js").default;
const flash = require("connect-flash");
const {isLogedin , originalUrl} = require("../middle-wares/middleware.js");
const reviewController = require("../controllers/review.js");

const checkValidateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        next(new ExpressError(error.message,400));
    }else{
        next();
    }
}

// review request
router.post("/:id/reviews",isLogedin,checkValidateReview,
    wrapAsy(reviewController.createReview)
)


// delete review route
router.delete("/:id/reviews/:review_id",
    wrapAsy(reviewController.destroy)
)

module.exports = router;