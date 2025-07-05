const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const flash = require("connect-flash");
const wrapAsy = require("../utility/wrapAsync.js");
const passport = require("passport");
const {originalUrl} = require("../middle-wares/middleware.js");
const userController = require("../controllers/user.js");


router.get("/signup", userController.signUpPage);

router.post("/signup", wrapAsy( userController.signUp));

router.get("/login",userController.loginPage);

router.post("/login",originalUrl,passport.authenticate("local",{
    failureFlash:true,
    failureRedirect:"/login"}
    ) , userController.login
);

router.get("/logout", userController.logout);

router.get("/forget-password", userController.forgetPasswordPage);

router.post("/forget-password/check-mail", userController.checkMail);

router.post("/forget-password/check-code", userController.checkCode);

router.get("/forget-password/reset-password", userController.resetPasswordPage);

router.post("/forget-password/reset-confirm", userController.resetPasswordConfirm);

// Forget Username routes
router.get("/forget-username", userController.forgetUsernamePage);
router.post("/forget-username/check-mail", userController.forgetUsernameCheckMail);
router.get("/forget-username/show-username", userController.showUsernamePage);

// Change Username routes
router.get("/change-username", userController.changeUsernamePage);
router.post("/change-username", userController.changeUsername);



module.exports = router;