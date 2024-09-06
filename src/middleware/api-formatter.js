
module.exports = function sendApiData(
    req,
    res,
    status = 404,
    messageStatus = "NotFound",
    message = "Not found",
    data = null,
    error = null,
    cookie = null,
    username = null,
    redirection = null
) {
    if (req.user)
        username = req.user.username ? req.user.username : username;
    if (cookie) {
        res.cookie("session", cookie, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
    }
    if (redirection)
        return res.status(status).redirect(redirection);
    const content = {
        status: status,
        messageStatus: messageStatus,
        message: message,
        data: data,
        error: String(error),
        username: username,
    };
    return res.status(status).send(content);
};
