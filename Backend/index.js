const express = require("express");
const app = express();

const mongoose = require('mongoose');
const path = require("path");
const bodyParser = require('body-parser');
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const ExpressError = require("./utility/ExpressErrors.js");
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const sessions = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const MongoStore = require("connect-mongo");
if(process.env.NODE_ENV !== "production"){
    const dotenv = require("dotenv");
    dotenv.config();
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"../Frontend/views"));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",engine);
app.use(express.static(path.join(__dirname,"../Frontend/Public")));



async function connectDB() {
    await mongoose.connect(process.env.MONGO_KEY);
}
connectDB().then(()=>[
    console.log("coneected to db")
]).catch((err)=>{
    console.log(err);
})

app.listen(8080,()=>{
    console.log("server is running on port 8080");
});

// Sessions

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_KEY,
    crypto: {
        secret: process.env.MY_SEC,
    },
    touchAfter: 24 * 60 * 60,
});
const session_option = {
    store,
    secret: process.env.MY_SEC,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,    // cookie will expire in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
store.on("error",()=>{
    console.log("Error in session store",err);
})

app.use(sessions(session_option));
app.use(flash());
// Passport setting

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// importing routes

app.use("/listings",listingRoutes);
app.use("/listings",reviewRoutes);
app.use("/",userRoutes);

// Root route redirect to listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});



// Catch-all route for unmatched routes

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404)); // Pass error to error-handling middleware
});

// Error-handling middleware

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error/error.ejs",{err});
    next();
});