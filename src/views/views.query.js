const renderer = require("./views");
const checkAuthenticated = require("../middleware/auth.js");
const checkUnAuthenticated = require("../middleware/unauth.js");

module.exports = function(app)
{
    app.get("/", checkAuthenticated, renderer.index);
    app.get("/404", renderer.errorfourofour);
    app.get("/register",checkUnAuthenticated, renderer.login);
    app.get("/login",checkUnAuthenticated, renderer.login);
    app.get("/profile",checkAuthenticated, renderer.profile);
};