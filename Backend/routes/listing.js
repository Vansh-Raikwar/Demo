require('dotenv').config();
const express = require("express");
const router = express.Router();

const wrapAsy = require("../utility/wrapAsync.js");
const {listingSchema}= require("../Schema.js");
const ExpressError = require("../utility/ExpressErrors.js");
const model = require('../models/model.js');
const flash = require("connect-flash");
const {isLogedin , isOwner} = require("../middle-wares/middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require('../cloudeConfig.js');
const upload = multer({ storage });   // multer will save our file to cloudinary


//middle-ware

const checkValidate = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        next(new ExpressError(error.message, 400)); // Use error.message instead of result.error
    }next()
}

// Home route

router.get("/", wrapAsy (listingController.home) );

// New page route
router.get("/new",isLogedin,listingController.newPage);

// Detail route
router.get("/:id",
    wrapAsy(listingController.detail)
);

// edit page route
router.get("/edit/:id",isLogedin,isOwner,
    wrapAsy(listingController.editPage)
);

// new listing route
router.post("/",isLogedin,
    upload.single("listing[image].url"),
    checkValidate,
    wrapAsy(listingController.new)
)


// edit route
router.put("/edit/:id",  isOwner,upload.single("listing[image].url"),checkValidate, wrapAsy(listingController.edit));


// deleting listing

router.delete("/delete/:id",isLogedin,isOwner,listingController.distructor)

module.exports=router;