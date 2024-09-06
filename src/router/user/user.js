const UserModel = require("../../database/models/users");
const SessionModel = require("../../database/models/session");
const api_formatter = require("../../middleware/api-formatter.js");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

var hour = 3600000;
var day = hour * 24;
var month = day * 30;

exports.register = async (req, res) => {
    if (req.user && req.user != null)
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    var tmpUserRegister = null;
    try {
        const register_data = {
            "email": req.body.email,
            "password": req.body.password,
            "username": req.body.username,
            "ip": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        };
        if (await check_json_data(register_data)) return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided");
        if (await UserModel.emailExists(register_data.email)) return api_formatter(req, res, 400, "email_already_exist", "an account with the provided email already exist");
        if (await UserModel.usernameExists(register_data.username)) return api_formatter(req, res, 400, "username_already_exist", "an account with the provided username already exist");

        await new UserModel({
            email: register_data.email,
            username: register_data.username,
            password: register_data.password,
            creationIp: register_data.ip,
        }).save().then(async function (userRegistered) {
            tmpUserRegister = userRegistered;
            await new SessionModel({
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: userRegistered.unique_id,
                connexionIp: register_data.ip,
                expire: Date.now() + month,
            }).save().then(async function (sessionRegistered) {
                await userRegistered.updateOne({
                    $addToSet: {
                        link_session_id: sessionRegistered.signed_id
                    }
                });
                return return_signed_cookies(req, res, sessionRegistered, userRegistered);
            });
        });
    } catch (err) {
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err);
    }
};

exports.login = async (req, res) => {
    if (req.user && req.user != null)
        return api_formatter(req, res, 401, "unauthorised", "You can't log in when logged in");

    var tmpSessuion = null;
    try {
        const login_data = {
            "emailOrUsername": req.body.emailOrUsername,
            "password": req.body.password,
            "ip": req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        };
        if (await check_json_data(login_data)) return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided");
        UserModel.findOne({
            $or: [
                {
                    email: login_data.emailOrUsername
                }, {
                    username: login_data.emailOrUsername
                }]
        }).then(async function (userToLogin) {
            if (!userToLogin) return api_formatter(req, res, 401, "user_not_found", "no user found with the provided email or username");
            if (await !userToLogin.comparePassword(login_data.password))
                return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account");

            await new SessionModel({
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: userToLogin.unique_id,
                connexionIp: login_data.ip,
                expire: Date.now() + month,
            }).save().then(async function (newSession) {
                tmpSessuion = newSession;
                await userToLogin.updateOne({
                    $addToSet: {
                        link_session_id: newSession.signed_id
                    }
                });
                return return_signed_cookies(req, res, newSession, userToLogin);
            });
        });
    } catch (err) {
        console.error(err);
        await reset_user_session(tmpSessuion);
        return error_occured(req, res, err);
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined)
            await reset_user_session(req.session, req.user);
        return api_formatter(req, res, 200, "success", "logout successful", null, null, null, null, "/");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout", null, err, null, null, "/");
    }
};

exports.logouteverywhere = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined)
            delete_every_user_session(req.user);
        return api_formatter(req, res, 200, "success", "you logged out everywhere successful", null, null, null, null, "/");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout everywhere", null, err, null, null, null, null, "/");
    }
};

exports.deleteaccount = async (req, res) => {
    try {
        if (!req.user.comparePassword(req.body.password))
            return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account");
        await SessionModel.deleteMany({ user_signed_id: req.user.unique_id });
        await UserModel.deleteOne({ _id: req.user._id });
        return api_formatter(req, res, 200, "success", "account deleted successfully");
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err);
    }
};


async function return_signed_cookies(req, res, Session, User) {
    try {
        return api_formatter(
            req,
            res,
            200,
            "success",
            "successfully registered",
            null,
            null,
            jwt.sign({ session_id: Session.unique_session_id }, process.env.SECRET),
            User.username
        );
    }
    catch (err) {
        console.error(err);
        await reset_user_session(Session, User ? User : null);
        return api_formatter(req,
            res,
            500,
            "errorOccured",
            "An error occured while trying to get the auth token",
            null,
            err,
            null,
            null
        );
    }
}

function error_occured(req, res, errorMsg) {
    console.error(errorMsg);
    return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, errorMsg, null);
}

async function check_json_data(json_data) {
    return (Object.values(json_data).includes(undefined) || Object.values(json_data).includes(""));
}

async function reset_user_session(Session, User = null) {
    if (User)
        await User.updateOne({
            $pull: {
                link_session_id: Session ? Session.signed_id : null
            }
        }).catch(function (err) {
            console.error(err);
        });
    return await SessionModel.deleteOne(
        { unique_session_id: Session ? Session.unique_session_id : null }
    ).catch(function (err) {
        console.error(err);
    });
}

async function delete_every_user_session(User) {
    try {
        await User.updateOne({
            link_session_id: []
        }).catch(function (err) {
            console.error(err);
        });
        return await SessionModel.deleteMany(
            { user_signed_id: User ? User.unique_id : null });
    } catch (err) {
        console.error(err);
    }
}

async function delete_user_account(User) {
    delete_every_user_session(User);
    return await UserModel.deleteOne({
        _id: User ? User._id : null
    }).catch(function (err) {
        console.error(err);
    });
}
