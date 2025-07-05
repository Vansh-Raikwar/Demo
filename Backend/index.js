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

// Load environment variables
if(process.env.NODE_ENV !== "production"){
    const dotenv = require("dotenv");
    dotenv.config();
}

app.set("view engine", "ejs");
// Configure view engine and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../Frontend/views"));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", engine);

// Serve static files from Frontend/Public
app.use(express.static(path.join(__dirname, "../Frontend/Public")));



// Database connection
async function connectDB() {
    try {
        if (!process.env.MONGO_KEY) {
            console.error("MONGO_KEY environment variable is not set");
            return;
        }
        await mongoose.connect(process.env.MONGO_KEY);
        console.log("Connected to database");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

// Connect to database
connectDB();

// For Vercel, we don't need to call app.listen() as it's handled by the platform
if (process.env.NODE_ENV !== "production") {
    app.listen(8080, () => {
        console.log("Server is running on port 8080");
    });
}

// Sessions
let store;
let session_option;

try {
    if (process.env.MONGO_KEY && process.env.MY_SEC) {
        store = MongoStore.create({
            mongoUrl: process.env.MONGO_KEY,
            crypto: {
                secret: process.env.MY_SEC,
            },
            touchAfter: 24 * 60 * 60,
        });
        
        session_option = {
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
        
        store.on("error", (err) => {
            console.log("Error in session store", err);
        });
    } else {
        // Fallback session configuration without MongoDB store
        session_option = {
            secret: process.env.MY_SEC || 'fallback-secret',
            resave: false,
            saveUninitialized: true,
            cookie:{
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            },
        };
    }
} catch (err) {
    console.error("Session configuration error:", err);
    // Fallback session configuration
    session_option = {
        secret: process.env.MY_SEC || 'fallback-secret',
        resave: false,
        saveUninitialized: true,
        cookie:{
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };
}

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

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// Test endpoint for debugging
app.get("/test", (req, res) => {
    res.json({
        message: "Server is working",
        env: {
            NODE_ENV: process.env.NODE_ENV,
            MONGO_KEY: process.env.MONGO_KEY ? "Set" : "Not set",
            MY_SEC: process.env.MY_SEC ? "Set" : "Not set"
        }
    });
});

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
    console.error("Error:", err);
    
    // For Vercel, we need to handle errors differently
    if (process.env.NODE_ENV === "production") {
        try {
            res.status(statusCode).render("error/error.ejs", { err });
        } catch (renderError) {
            console.error("Render error:", renderError);
            res.status(statusCode).json({ 
                error: message,
                statusCode: statusCode 
            });
        }
    } else {
        res.status(statusCode).render("error/error.ejs", { err });
    }
});