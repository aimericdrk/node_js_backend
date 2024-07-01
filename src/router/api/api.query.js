const api_interactions = require("./api.js");
const get_user_from_session = require("../../middleware/auth.js");

module.exports = function(app)
{
    app.get("/user_profile_info_api", get_user_from_session, api_interactions.user_profile_info_api);
    app.get("/navbar_info_api", (req, res, next) => get_user_from_session(req, res, next, false), api_interactions.navbar_info_api);

};