const renderer = require("./views");
const checkAuthenticated = require("../middleware/auth.js");

module.exports = function (app) {
    app.get("/", checkAuthenticated, renderer.index);
    app.get("/404", renderer.errorfourofour);
    app.get("/register", renderer.login);
    app.get("/login", renderer.login);
    app.get("/profile", checkAuthenticated, renderer.profile);
};