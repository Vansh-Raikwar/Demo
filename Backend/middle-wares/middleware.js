const model = require("../models/model.js")

const isLogedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.originalUrl = req.originalUrl;
        req.flash("error","you must be logged in to access this page");
        return res.redirect("/login");
    }
    next();
}
 
const originalUrl = (req,res,next)=>{
    if(req.session.originalUrl){
        res.locals.originalUrl = req.session.originalUrl;
    }
    next();
}

async function isOwner(req, res, next) {
    const { id } = req.params;
    await model.findById(id).then((result) => {
        if ( res.locals.currUser && !res.locals.currUser._id.equals(result.owner)) {
            req.flash("error", "You are not the owner of this listing");
            return res.redirect(`/listings/${id}`);
        }else{
            next();
        }
    });
}


module.exports = {isLogedin , originalUrl , isOwner};