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
        if (await check_json_data(register_data)) return api_formatter(req, res, 400, "missing_informations", "some of the information were not provided", null, null, null);
        if (await UserModel.emailExists(register_data.email)) return api_formatter(req, res, 400, "email_already_exist", "an account with the provided email already exist", null, null, null);
        if (await UserModel.usernameExists(register_data.username)) return api_formatter(req, res, 400, "username_already_exist", "an account with the provided username already exist", null, null, null);

        await new UserModel({
            email: register_data.email,
            username: register_data.username,
            password: register_data.password,
            creationIp: register_data.ip
        }).save().then(async function (userRegistered) {
            tmpUserRegister = userRegistered;
            await new SessionModel({
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: userRegistered.unique_id,
                connexionIp: register_data.ip,
                session_type: "default",
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
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err, null);
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
                session_type: "default",
            }).save().then(async function (newSession) {
                tmpSessuion = newSession;
                await userToLogin.updateOne({
                    $addToSet: {
                        link_session_id: newSession.signed_id
                    }
                });
                return return_signed_cookies(req, res, newSession, userToLogin, "login successful");
            });
        });
    } catch (err) {
        console.error(err);
        await reset_user_session(tmpSessuion);
        return error_occured(req, res, err);
    }
};

exports.googleAuth = async (req, res) => {
    if (req.user && req.user != null)
        return api_formatter(req, res, 401, "unauthorised", "You can't register when logged in");

    var tmpUserRegister = null;
    const { token } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    try {
        const ticket = await GoogleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if the user exists in the database
        let googleUser = await GoogleUserModel.findOne({ google_id: googleId });

        if (!googleUser) {
            googleUser = new GoogleUserModel({
                google_id: googleId,
                email: email,
                username: name,
                profilePicture: picture,
                creationIp: ip
            });
            await googleUser.save().then(async function (userRegistered) {
                tmpUserRegister = userRegistered;
                await new SessionModel({
                    unique_session_id: crypto.randomUUID(),
                    signed_id: crypto.randomUUID(),
                    user_signed_id: userRegistered.unique_id,
                    connexionIp: userRegistered.ip,
                    session_type: "google",
                    expire: Date.now() + month,
                }).save().then(async function (sessionRegistered) {
                    await userRegistered.updateOne({
                        $addToSet: {
                            link_session_id: sessionRegistered.signed_id
                        }
                    });
                    return return_signed_cookies(req, res, sessionRegistered, userRegistered, "registration successful");
                });
            });
        } else {
            await new SessionModel({
                unique_session_id: crypto.randomUUID(),
                signed_id: crypto.randomUUID(),
                user_signed_id: googleUser.unique_id,
                connexionIp: ip,
                session_type: "google",
                expire: Date.now() + month,
            }).save().then(async function (sessionRegistered) {
                await googleUser.updateOne({
                    $addToSet: {
                        link_session_id: sessionRegistered.signed_id
                    }
                });
                return return_signed_cookies(req, res, sessionRegistered, googleUser, "registration successful");
            });
        }
    } catch (err) {
        console.error(err);
        await delete_user_account(tmpUserRegister);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, err);
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined)
            await reset_user_session(req.session, req.user);
        return api_formatter(req, res, 200, "success", "logout successful", null, null, null);
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout", null, err, null);
    }
};

exports.logouteverywhere = async (req, res) => {
    try {
        if (req.user && req.user != null && req.user != undefined)
            delete_every_user_session(req.user);
        return api_formatter(req, res, 200, "success", "you logged out everywhere successful", null, null, null);
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to logout everywhere", null, err, null);
    }
};

exports.setprofilepicture = async (req, res) => {
    if (!req.user || req.user == null)
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null);
    if (req.user.session_type == "google")
        return api_formatter(req, res, 401, "unauthorised", "You can't set a profile picture with a google account", null, null, null);
    try {
        await UserModel.updateOne({ _id: req.user._id },
            { $set: { profilePicture: req.file.buffer } });
        return api_formatter(req, res, 200, "success", "profile picture updated successfully", null, null, null);
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to update the profile picture", null, err, null);
    }
};

exports.deleteaccount = async (req, res) => {
    if (!req.user || req.user == null)
        return api_formatter(req, res, 401, "notloggedin", "you are not logged in", null, null, null);
    const givenPassword = req.body.password;
    if (!givenPassword)
        return api_formatter(req, res, 401, "noPassword", "you didn't provide any password", null, null, null);
    try {
        if (!req.user.comparePassword(req.body.password))
            return api_formatter(req, res, 401, "incorrect_password", "the provided password is incorrect for this account", null, null, null);
        await SessionModel.deleteMany({ user_signed_id: req.user.unique_id });
        if (req.user.session_type == "google")
            await GoogleUserModel.deleteOne({ _id: req.user._id });
        else
            await UserModel.deleteOne({ _id: req.user._id });
        return api_formatter(req, res, 200, "success", "account deleted successfully", null, null, null);
    } catch (err) {
        console.error(err);
        return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to delete the account", null, err, null);
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
        return api_formatter(
            req,
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
    return api_formatter(req, res, 500, "errorOccured", "An error occured while trying to register", null, errorMsg, null, null);
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
    if (Session)
        return await SessionModel.deleteOne(
            { unique_session_id: Session ? Session.unique_session_id : null }
        ).catch(function (err) {
            console.error(err);
        });
    return null;
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