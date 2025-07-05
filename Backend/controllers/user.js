const User = require("../models/user.js");
const nodemailer = require("nodemailer");

module.exports.signUpPage = (req,res)=>{
    res.render("user/signup.ejs");
}

module.exports.signUp = async(req,res,next)=>{
    try{
        const {username,email,password} = req.body;
        const user = User({username,email});
        await User.register(user,password).then((result)=>{
            req.login(result, (err)=>{
                if (err) {
                    return next(err);
                }
                req.flash("success","Welcome to WonderLust");
                res.redirect("/listings");
            })
        })
        
    }catch(err){
        req.flash("error",err.message);
        console.log(err);
        res.redirect("/signup");
    }
    
}

module.exports.loginPage = (req,res)=>{
    res.render("user/login.ejs");
}

module.exports.login = async(req,res)=>{
    res.locals.originalUrl ? res.redirect(res.locals.originalUrl) : res.redirect("/listings");
}

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are successfull logedout!");
        res.redirect("/listings");
    })
}


let gen_code;
let reset_email; // Store the email for password reset

module.exports.checkMail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        // Use your real Gmail account
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        try {
            gen_code = String(Math.floor(100000 + Math.random() * 900000));
            reset_email = email;
            let info = await transporter.sendMail({
                from: "wonderlust964@gmail.com",
                to: email,
                subject: "Password Reset Request",
                text: `Password Reset Code: ${gen_code}`,
            });
            req.flash("success", `Email found. Reset code sent to ${email}.`);
            res.render("user/check-code.ejs");
        } catch (err) {
            console.error("Error sending email:", err);
            req.flash("error", "There was an error sending the reset email. Please try again later.");
            res.redirect("/forget-password");
        }
    } else {
        req.flash("error", "Email not found in our records.");
        res.redirect("/forget-password");
    }
}

module.exports.checkCode = async (req,res)=>{
    const {code} = req.body;
    if(String(code) === String(gen_code)){
        res.render("user/reset-password.ejs");
    }else{
        res.redirect("/forget-password");
    }
}

module.exports.resetPasswordPage = (req,res)=>{
    res.render("user/reset-password.ejs");
}

module.exports.forgetPasswordPage = (req,res)=>{
   res.render("user/forget-pas.ejs");
}


module.exports.resetPasswordConfirm = async (req, res) => {
    const { pas, 're_pas': re_pas } = req.body;
    if (pas === re_pas) {
        try {
            const user = await User.findOne({ email: reset_email });
            if (!user) {
                req.flash("error", "User not found. Please try again.");
                return res.redirect("/forget-password");
            }
            await user.setPassword(pas);
            await user.save();
            req.flash("success", "Password updated successfully. Please log in.");
            reset_email = undefined; // Clear after use
            res.redirect("/login");
        } catch (err) {
            console.error("Error updating password:", err);
            req.flash("error", "There was an error updating your password. Please try again.");
            res.redirect("/forget-password/reset-password");
        }
    } else {
        req.flash("error", "Passwords do not match.");
        res.redirect("/forget-password/reset-password");
    }
}

// Forget Username Flow
module.exports.forgetUsernamePage = (req, res) => {
    res.render("user/forget-username.ejs");
};

let found_username; // Temporary variable for demo; use session in production

module.exports.forgetUsernameCheckMail = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        found_username = user.username;
        res.redirect("/forget-username/show-username");
    } else {
        req.flash("error", "Email not found in our records.");
        res.redirect("/forget-username");
    }
};

module.exports.showUsernamePage = (req, res) => {
    if (found_username) {
        res.render("user/show-username.ejs", { username: found_username });
        found_username = undefined; // Clear after use
    } else {
        req.flash("error", "No username to show. Please try again.");
        res.redirect("/forget-username");
    }
};

module.exports.changeUsernamePage = (req, res) => {
    res.render("user/change-username.ejs");
};

module.exports.changeUsername = async (req, res) => {
    try {
        const { newUsername } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/change-username");
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            req.flash("error", "Username already exists");
            return res.redirect("/change-username");
        }
        
        user.username = newUsername;
        await user.save();
        
        req.flash("success", "Username updated successfully");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error changing username:", err);
        req.flash("error", "There was an error updating your username");
        res.redirect("/change-username");
    }
};
