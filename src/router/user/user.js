const User = require('../../database/models/users')
const Session = require('../../database/models/session')
const checkAuthenticated = require("../../middleware/auth.js");
const redirects = require("../../middleware/redirect.js");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const e = require('express')
const crypto = require('crypto');

var hour = 3600000;
var day = hour * 24;
var month = day * 30;


exports.index = (req, res) => {
}

exports.register = async (req, res) => {
    try {
        let register_data = {
            "email": req.body.email,
            "password": req.body.password,
            "username": req.body.username,
            "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        }

        if (await check_json_data(register_data))
            return redirects.missing_infos(req, res);
        if (await User.emailExists(register_data.email))
            return redirects.email_already_exist(req, res);
        if (await User.usernameExists(register_data.username))
            return redirects.username_already_exist(req, res);
    
        const new_unique_id = crypto.randomUUID();
        const newUser = new User({
            unique_id: new_unique_id,
            email: register_data.email,
            username: register_data.username,
            role: "normal",
            password: register_data.password,
            //                    adress: register_data.adress,
            //                    phonenumber: register_data.phonenumber,
            //                    firstName: register_data.firstName,
            //                    lastName: register_data.lastName,
            creationIp: register_data.ip,
            LastModificationIp: register_data.ip,
        });
        console.log(newUser);
        newUser.save().then(function (User, err) {
            if (err)
                return redirects.register_inservererr(req, res);

            const uuid_session_id = crypto.randomUUID()
            const unique_link_session_id = crypto.randomUUID()
            const newSession = new Session({
                unique_session_id: uuid_session_id,
                signed_id: unique_link_session_id,
                user_signed_id: User.unique_id,
                connexionIp: register_data.ip,
                expire: Date.now() + month,
            });
    
            newSession.save().then(function (Session, err) {
                if (err)
                    return redirects.register_inservererr(req, res);

                User.link_session_id = unique_link_session_id
                User.updateOne({ link_session_id: unique_link_session_id }).then(function (newuser, err) {
                    if (err)
                        return redirects.register_inservererr(req, res);

                    if (User.link_session_id == Session.signed_id)
                        return return_signed_cookies(req, res, uuid_session_id, User);
                    else
                        return redirects.register_inservererr(req, res);
                })
            })
        })
    } catch (error) {
        console.log("REGISTER -> " + error);
        return redirects.register_inservererr(req, res);
    }
}

exports.login = async (req, res) => {
    try {
        let login_data = {
            "email": req.body.email,
            "password": req.body.password,
            "ip": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        }
    
        if (await check_json_data(login_data))
            return redirects.missing_infos(req, res);

        User.findOne({ email: login_data.email }).then(function (user, err) {
            if (err)
                return redirects.login_inservererr(req, res);

            if (user) {
                if (user.comparePassword(req.body.password)) {
                    Session.deleteMany({ user_signed_id: user.unique_id }).then(function (session, err) {
                        if (err)
                            return redirects.login_inservererr(req, res);

                        const uuid_session_id = crypto.randomUUID()
                        const unique_link_session_id = crypto.randomUUID()
                        const newSession = new Session({
                            unique_session_id: uuid_session_id,
                            user_signed_id: user.unique_id,
                            signed_id: unique_link_session_id,
                            connexionIp: login_data.ip,
                            expire: Date.now() + month,
                        });
                        newSession.save().then(function (Session, err) {
                            if (err)
                                return redirects.login_inservererr(req, res);

                            user.link_session_id = unique_link_session_id
                            user.updateOne({ link_session_id: unique_link_session_id }).then(function (newuser, err) {
                                if (err)
                                    return redirects.login_inservererr(req, res);
                                if (user.link_session_id == Session.signed_id)
                                    return return_signed_cookies(req, res, uuid_session_id, user);
                                else
                                    return redirects.invalid_session(req, res);
                            })
                        })
                    })
                } else {
                    return redirects.incorrect_password(req, res);
                }
            } else {
                return redirects.incorrect_email(req, res);
            }
        })
    } catch (error) {
        console.log("LOGIN -> " + error);
        redirects.login_inservererr(req, res);
    }
}

exports.profile = async (req, res) => {
    return res.status(200).send({ "status": "success", "username": req.cookies.username });
}

exports.logout = async (req, res) => {
    if (req.user && req.user != null && req.user != undefined) {
        Session.deleteOne({ signed_id: req.user.link_session_id }).then(function (session, err) {
            if (session) {
                return redirects.logout_success(req, res);
            } else {
                console.log(err);
                return redirects.logout_error_occured(req, res);
            }
        }).catch(function (err) {
            console.log(err);
        });
    } else {
        return redirects.logout_success(req, res);
    }
}

exports.deleteaccount = async (req, res) => {
    try {
        if (req.user.comparePassword(req.body.password)) {
            await User.deleteOne({ _id: req.user._id }).then(async function (user, err) {
                if (err)
                return redirects.account_delete_error(req, res);
            await Session.deleteOne({ signed_id: req.user.link_session_id }).then(function (session, err) {
                if (err)
                    return redirects.account_delete_error(req, res);

                return redirects.account_deleted(req, res);
            })
            })
        } else {
            return redirects.incorrect_password(req, res);
        }
    } catch (error) {
        console.log("DELETE ACCOUNT -> " + error);
        return redirects.account_delete_error(req, res);
    }
}

async function check_json_data(json_data) {
    return (Object.values(json_data).includes(undefined) || Object.values(json_data).includes(""));
}

async function return_signed_cookies(req, res, uuid_session_id, user) {
    return res.status(200).cookie('session', jwt.sign({ session_id: uuid_session_id }, process.env.SECRET), { maxAge: month }).cookie('name', user.username).send({ "status": "success", "message": "Vous vous êtes enregistré avec succès, redirection ..." }); //.cookie('token', jwt.sign({ _id: Person.unique_id }, 'RESTFULAPIs'), {maxAge : month})
}