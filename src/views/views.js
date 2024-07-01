exports.index = (req, res) => {
    return res.status(200).render('index.ejs');
}

exports.errorfourofour = (req, res) => {
    return res.status(404).render('404.ejs');
}

exports.login = (req, res) => {
    return res.status(200).render('login_register.ejs');
}

exports.profile = (req, res) => {
    return res.status(200).render('profile.ejs');
}