const get_user_from_token = require("../../middleware/auth.js");
const User = require('../../database/models/users')


exports.user_profile_info_api = async (req, res) => {
    if (!req.user || req.user == null) {
        return res.status(401).send({ "status": "error", "message": "vous n'êtes pas connecté", "data": null});
    } else {
        const user_infos = {
            //"name": req.user.firstName,
            //"lastName": req.user.lastName,
            "username": req.user.username,
            "email": req.user.email,
            //"adress": req.user.adress,
            //"phonenumber": req.user.phonenumber
        }
        return res.status(200).send({ "status": "success", "message": "données récupérées avec succès", "data": user_infos});
    }
}

exports.navbar_info_api = async (req, res) => {
    if (!req.user || req.user == null) {
        return res.status(200).send({"status": "notloggedin", "message": "vous n'êtes pas connecté", "data": null});
    } else {
        return res.status(200).send({"status": "loggedin", "message": "vous êtes connéctés", "data": {"username": req.user.username}});
    }
}