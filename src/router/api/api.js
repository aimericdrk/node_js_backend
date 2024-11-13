const api_formatter = require("../../middleware/api-formatter.js");

exports.profile = async (req, res) => {
    if (!req.user || req.user == null)
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null);
    const user_infos = {
        "username": req.user.username,
        "email": req.user.email,
        "account_type": req.user.accountType,
    };
    return api_formatter(req, res, 200, "success", "you are authenticated", user_infos, null, null);
};

exports.getprofilepicture = async (req, res) => {
    if (!req.user || req.user == null)
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null);
    if (!req.user.profilePicture || req.user.profilePicture == null || req.user.profilePicture == "")
        return api_formatter(req, res, 404, "notfound", "no profile picture found", null, null, null);
    return api_formatter(req, res, 200, "success", "profile picture found", req.user.profile_picture, null, null);
}