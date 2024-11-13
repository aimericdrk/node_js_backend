const useractions = require("./user.js");
const checkAuthenticated = require("../../middleware/auth.js");
const uploadfile = require("../image-upload.js");


module.exports = function (app) {
    app.post("/register", useractions.register);
    app.post("/login", useractions.login);
    app.post("/auth/google", useractions.googleAuth);
    app.post("/logout", checkAuthenticated, useractions.logout);
    app.post("/logouteverywhere", checkAuthenticated, useractions.logouteverywhere);
    app.post("set_profile_picture", checkAuthenticated, uploadfile.single('image'), useractions.setprofilepicture);
    app.delete("/profile", checkAuthenticated, useractions.deleteaccount);
};