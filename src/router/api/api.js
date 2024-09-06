const api_formatter = require("../../middleware/api-formatter.js");


exports.user_profile_info_api = async (req, res) => {
    if (!req.user || req.user == null) {
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
    } else {
        const user_infos = {
            //"name": req.user.firstName,
            //"lastName": req.user.lastName,
            "username": req.user.username,
            "email": req.user.email,
            //"adress": req.user.adress,
            //"phonenumber": req.user.phonenumber
        };
        return api_formatter(req, res, 200, "success", "profile data received with success", user_infos, null, null, req.user.username);
    }
};

exports.navbar_info_api = async (req, res) => {
    if (!req.user || req.user == null) {
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null, null);
    } else {
        return api_formatter(req, res, 200, "success", "navbar data received with success", null, null, null, req.user.username);
    }
};