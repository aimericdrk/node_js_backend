const useractions = require("./user.js");
const checkAuthenticated = require("../../middleware/auth.js");
const get_user_from_session = require("../../middleware/auth.js");
const checkUnAuthenticated = require("../../middleware/unauth.js");

module.exports = function(app)
{
    app.post("/register",checkUnAuthenticated, useractions.register);
    app.post("/login",checkUnAuthenticated, useractions.login);
    app.get("/logout",get_user_from_session, useractions.logout);
    app.get("/profile_info",checkAuthenticated, useractions.profile);
    app.delete("/profile",checkAuthenticated, useractions.deleteaccount);
};