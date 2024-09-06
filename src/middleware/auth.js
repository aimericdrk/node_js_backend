const UserModel = require("../database/models/users.js");
const SessionModel = require("../database/models/session.js");
const jwt = require("jsonwebtoken");
const sendApiData = require("./api-formatter.js");

async function checkAuthenticated(req, res, next) {
    try {
        const GivenSession = req.cookies.session;
        var decodedSession = null;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        req.user = null;
        req.session = null;
        if (!GivenSession) return next();

        try {
            decodedSession = await jwt.verify(GivenSession, process.env.SECRET);
        } catch (err) {
            console.error(err);
            decodedSession = null;
            throw err;
        }
        if (!decodedSession) return next();

        await SessionModel.findOne({
            unique_session_id: decodedSession.session_id
        }).then(async function (FoundSession) {
            if (!FoundSession) return next();

            await UserModel.findOne({
                link_session_id: FoundSession.signed_id
            }).then(async function (CorrespondingUser) {

                if (await verif_session_data(FoundSession, CorrespondingUser, ip))
                    return next();
                req.user = CorrespondingUser;
                req.session = FoundSession;
                return next();
            });
        });
    } catch (err) {
        console.error(err);
        return sendApiData(req, res, 500, "errorOccured", "An error occured while trying to verify your session", null, err, null, null);
    }
}


async function verif_session_data(session, user, ip) {
    return (session.expire == null || session.expire < Date.now() ||
        session.signed_id == null || !user.link_session_id.includes(session.signed_id) ||
        session.connexionIp == null || session.connexionIp != ip ||
        session.user_signed_id != user.unique_id);
}

module.exports = checkAuthenticated;