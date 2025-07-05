const model = require('../models/model.js');
const mbxStyles = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxStyles({ accessToken: process.env.MAP_TOKEN });


module.exports.home = async (req,res)=>{
    await model.find().then((result)=>{
        res.render("listings/listings.ejs",{result});
    }).catch((err)=>{
        console.log(err);
    })

}

module.exports.newPage = (req,res)=>{
    res.render("new/newlisting.ejs");
}

module.exports.detail = async (req,res)=>{
    const result = await model.findById(req.params.id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!result){
        req.flash("error","The listing for which you are looking does not exist");
        res.redirect("/listings");
    }
    res.render("detail/detail.ejs",{result});
}

module.exports.editPage = async (req,res)=>{
    await model.findById(req.params.id).then((result)=>{
        if(!result){
            req.flash("error","The listing for which you are looking does not exist");
            res.redirect("/listings");
        }
        res.render("edit/edit.ejs",{result});
    })
}

module.exports.new = async (req, res, next) => {
    const new_data = new model(req.body.listing);

    // Check if req.file exists
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        new_data.image = { url, filename };
    } else {
        // Handle the case where no file was uploaded
        new_data.image = { url: "https://hips.hearstapps.com/hmg-prod/images/mt-assiniboine-provincial-park-at-sunrise-royalty-free-image-1623253564.jpg?crop=1xw:1xh;center,top&resize=980:*", filename: "" };
    }

    await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send().then(response => {
        new_data.geometry = response.body.features[0].geometry;
    });

    new_data.owner = req.user._id;
    await new_data.save();
    req.flash("success", "New listing is created");
    res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const updatedListing = { ...req.body.listing };
    const data = await model.findById(id);

    // Check if location has changed
    if (updatedListing.location && updatedListing.location !== data.location) {
        // Update geometry using geocoding
        const geoData = await geocodingClient.forwardGeocode({
            query: updatedListing.location,
            limit: 1
        }).send();
        data.geometry = geoData.body.features[0].geometry;
    }

    // Update other fields
    Object.assign(data, updatedListing);

    // Handle image update
    if (typeof req.file !== "undefined") {
        const url = req.file.path;
        const filename = req.file.filename;
        data.image.url = url;
        data.image.filename = filename;
    }

    await data.save();
    req.flash("success", "Listing is updated");
    res.redirect(`/listings/${id}`);
};

module.exports.distructor = async (req,res)=>{
    await model.findOneAndDelete({_id:req.params.id}).then(()=>{
        req.flash("success","Listing is deleted");
        res.redirect("/listings");
    })
}