
exports.clear_cookies = (req, res) => {
    return res.status(401).cookie("session", "null").cookie("name", "null").redirect("/login")
}

exports.clear_cookies_inservererr = (req, res) => {
    return res.status(401).cookie("session", "null").cookie("name", "null").redirect("/login")
}

exports.login_inservererr = (req, res) => {
    return res.status(500).cookie("session", "null").cookie('name', "null").send({ "status": "error", "message": "Erreur : une erreur est survenue lors de la connexion" });
}

exports.invalid_session = (req, res) => {
    return res.status(400).cookie('name', "null").cookie('name', "null").send({ "status": "error", "message": "Erreur : session invalide" });
}

exports.username_already_exist = (req, res) => {
    return res.status(400).send({ "status": "error", "message": "Le nom d'utilisateur est déjà utilisé pour un autre compte" });
}

exports.incorrect_password = (req, res) => {
    return res.status(400).send({ "status": "error", "message": "Mot de passe incorrect" });
}

exports.incorrect_email = (req, res) => {
    return res.status(400).send({ "status": "error", "message": "l'utilisateur n'existe pas" });
}

exports.logout_success = (req, res) => {
    return res.status(200).cookie("session", "null").cookie('name', "null").redirect('/');
}

exports.logout_error_occured = (req, res) => {
    return res.status(500).cookie("session", "null").cookie('name', "null").redirect('/');
}

exports.register_inservererr = (req, res) => {
    return res.status(500).cookie("session", "null").cookie('name', "null").send({ "status": "error", "message": "Erreur : une erreur est survenue lors de l'enregistrement merci de réesayer plus tard" });
}

exports.missing_infos = (req, res) => {
    return res.status(400).send({ "status": "error", "message": "Informations manquantes" });
}

exports.email_already_exist = (req, res) => {
    return res.status(400).send({ "status": "error", "message": "L'adresse mail est déjà utilisé pour un autre compte" });
}

exports.account_deleted = (req, res) => {
    return res.status(200).cookie("session", "null").cookie('name', "null").send({ "status": "success", "message": "Votre compte a été supprimé avec succès, redirection..." });
}

exports.account_delete_error = (req, res) => {
    return res.status(500).cookie("session", "null").cookie('name', "null").send({ "status": "error", "message": "Erreur lors de la suppression du compte, redirection..." });
}