const clear_cookies = require("./redirect.js").clear_cookies;
const clear_cookies_inservererr = require("./redirect.js").clear_cookies_inservererr;
const User = require('../database/models/users')
const Session = require('../database/models/session')
var jwt = require('jsonwebtoken');

async function checkUnAuthenticated(req, res, next) {
    try {
        const session_token = req.cookies.session;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (session_token && session_token != null && session_token != undefined && session_token != "null") {
            var session_decoded = null;
            try {
                session_decoded = jwt.verify(session_token, process.env.SECRET);
            } catch (err) {
                return clear_cookies(req, res);
            }
            if (!session_decoded)
                return clear_cookies(req, res);
            Session.findOne({ unique_session_id: session_decoded.session_id }).then(function (session, err) {
                if (session) {
                    User.findOne({ link_session_id: session.signed_id }).then(function (user, err) {
                        if (user) {
                            if (session.expire < Date.now()) {
                                return clear_cookies(req, res);
                            } else {
                                if (!session.signed_id || session.signed_id == null || session.signed_id == undefined || session.signed_id == "null") {
                                    return clear_cookies(req, res);
                                } else {
                                    if (session.signed_id != user.link_session_id || session.connexionIp != ip || session.user_signed_id != user.unique_id) {
                                        return clear_cookies(req, res);
                                    } else {
                                        return res.redirect("/");
                                    }
                                }
            
                            }
                        } else {
                            return clear_cookies(req, res);
                        }
                    }).catch(function (err) {
                        console.log(err);
                        return clear_cookies_inservererr(req, res);
            
                    });
                } else {
                    return clear_cookies(req, res);
                }
            }).catch(function (err) {
                console.log(err);
                return clear_cookies_inservererr(req, res);
    
            });
        } else {
            return next();
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({"msg": "Internal server error"});       
    }
}

module.exports = checkUnAuthenticated;