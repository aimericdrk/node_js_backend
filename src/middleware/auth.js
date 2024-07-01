const User = require('../database/models/users.js')
const jwt = require('jsonwebtoken');
const redirector = require("./redirect.js");

async function get_user_from_session(req, res, next, bloquant = true) {
    try {
        const session = req.cookies.session;
        var decoded = null;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        req.user = null;
        if (!session || session == null || session == undefined || session == "null")
            return login_error(req, res, bloquant);

        try {
            decoded = jwt.verify(session, process.env.SECRET);
        } catch (err) {
            return login_error(req, res, bloquant);
        }

        if (!decoded) 
            return login_error(req, res, bloquant);

        Session.findOne({ unique_session_id: decoded.session_id }).then(function (session, err) {
            if (err) {
                console.log("get_user_from_session.js error occured on 'Session.findOne({ unique_session_id: decoded.session_id }).then(function (session, err)' : " + err);
                return login_error(req, res, bloquant);
            }
            if (check_non_null_session(session)) {

                User.findOne({ link_session_id: session.signed_id }).then(function (user, err) {
                    if (err) {
                        console.log("get_user_from_session.js error occured on 'User.findOne({ link_session_id: session.signed_id }).then(function (user, err)' : " + err);
                        return login_error(req, res, bloquant);
                    }
                    if (verif_session_data(session, user, ip)) {
                        req.user = user;
                        return next();
                    } else
                        return login_error(req, res, bloquant);
                }).catch(function (err) {
                    console.log("get_user_from_session.js error occured on 'User.findOne({ link_session_id: session.signed_id }).then(function (user, err)' : " + err);
                    return login_error(req, res, bloquant);

                });
            } else
                return login_error(req, res, bloquant);
        }).catch(function (err) {
                console.log("get_user_from_session.js error occured on 'Session.findOne({ unique_session_id: decoded.session_id }).then(function (session, err)' : " + err);
                return redirector.clear_cookies_inservererr(req, res);
    
        });
    } catch (error) {
        console.log("get_user_from_session.js error occured on 'jwt.verify(session, process.env.SECRET)' : " + error);
        return login_error(req, res, bloquant);
    }
}

async function login_error(req, res, bloquant) {
    if (bloquant)
        return redirector.clear_cookies(req, res);
    else {
        return res.status(401).send({"status": "notloggedin"});
    }
}

async function check_non_null_session(session) {
    return (session && session != null && session != undefined && session != "null" && session.expire > Date.now());
}

async function verif_session_data(session, user, ip) {
    return (session.expire < Date.now() || session.expire == null || session.expire == undefined ||
    session.signed_id == null || session.signed_id == undefined ||
    session.signed_id != user.link_session_id || session.connexionIp != ip ||
    session.user_signed_id != user.unique_id)
}

module.exports = get_user_from_session;