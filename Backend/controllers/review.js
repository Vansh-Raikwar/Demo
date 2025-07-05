const Review = require("../models/review.js").default;
const model = require('../models/model.js');


module.exports.createReview = async (req,res,next)=>{
    let review_id =  await model.findById(req.params.id);
    let review = new Review(req.body.review);
    review.author = req.user._id;
    review_id.reviews.push(review);
    await review.save();
    await review_id.save();
    req.flash("success","New review is created");
    res.redirect(`/listings/${req.params.id}`);
}
module.exports.destroy = async(req,res,next)=>{
    await model.findByIdAndUpdate(req.params.id, {$pull:{reviews : req.params.review_id}});
    await Review.findByIdAndDelete(req.params.review_id);
    req.flash("success","Review is deleted");
    res.redirect(`/listings/${req.params.id}`);
}