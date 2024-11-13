

module.exports = function sendApiData(
    req,
    res,
    status = 404,
    messageStatus = "NotFound",
    message = "Not found",
    data = null,
    error = null,
    session = null,
    username = null,
) {
    if (req.user)
        username = req.user.username ? req.user.username : username;
    const DataToSend = {
        "status": status,
        "messageStatus": messageStatus,
        "message": message,
        "data": data,
        "error": String(error),
        "session": session,
        "username": username,
    };
    return res.status(status).send(DataToSend);
};
