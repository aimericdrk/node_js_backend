function delacc() {

    let loginFormData = {
        "password": document.getElementById("delete_password").value,
        "password2": document.getElementById("delete_password2").value
    };

    const statusElement = document.getElementById("delete_check");

    if (check_json_data(loginFormData))
        return invalid_data(statusElement, "veuillez remplir tous les champs");

    if (loginFormData.password != loginFormData.password2)
        return invalid_data(statusElement, "Les mots de passe ne correspondent pas");

    var ajaxQuery = {
        type: "DELETE",
        method: "DELETE",
        url: "/profile",
        data: JSON.stringify(loginFormData),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 2000,
    };
    return fetch_handle_response(ajaxQuery, statusElement, document.getElementById("delete_redirect"), 3000);
}

function login() {
    const statusElement = document.getElementById("login_check");

    let loginFormData = {
        "emailOrUsername": document.getElementById("login_email_or_username").value,
        "password": document.getElementById("login_password").value
    };

    if (check_json_data(loginFormData))
        return invalid_data(statusElement, "veuillez remplir tous les champs");

    let ajaxQuery = {
        type: "POST",
        method: "POST",
        url: "/login",
        data: JSON.stringify(loginFormData),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
    };

    return fetch_handle_response(ajaxQuery, document.getElementById("login_check"), document.getElementById("login_redirect"), 3000);
}

function register() {
    //    "firstName": "${document.getElementById("register_firstName").value}",
    //    "lastName": "${document.getElementById("register_lastName").value}",
    //    "adress": "${document.getElementById("register_adress").value}",
    //    "phonenumber": "${document.getElementById("register_phonenumber").value}"

    const statusElement = document.getElementById("register_check");

    let registerFormData = {
        "email": document.getElementById("register_email").value,
        "username": document.getElementById("register_username").value,
        "password": document.getElementById("register_password").value
    };

    if (check_json_data(registerFormData))
        return invalid_data(statusElement, "veuillez remplir tous les champs");

    let ajaxQuery = {
        type: "POST",
        method: "POST",
        url: "/register",
        data: JSON.stringify(registerFormData),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 20000,
    };
    return fetch_handle_response(ajaxQuery, statusElement, document.getElementById("register_redirect"), 3000);
}

function fetch_handle_response(query, message_element, success_click, msTimeout) {
    let success = false;

    $.ajax(query).done((response) => {
        success = true;
        message_element.style.color = "green";
        message_element.innerHTML = response.message;
    }).fail((jqXHR) => {
        success = false;
        message_element.style.color = "red";
        message_element.innerHTML = jqXHR.responseJSON.message;
    }).always(() => {
        setTimeout(() => {
            if (success && success_click)
                success_click.click();
            message_element.innerHTML = "";
        }, msTimeout);
    });
}

function check_json_data(json_data) {
    return Object.values(json_data).includes(undefined) || Object.values(json_data).includes("");
}


function invalid_data(element, message) {
    element.style.color = "red";
    element.innerHTML = message;
    setTimeout(() => {
        element.innerHTML = "";
        element.style.color = "";
    }, 6000);
}

function switch_to_login() {
    document.getElementById("login_page").style.display = "block";
    document.getElementById("register_page").style.display = "none";
}

function switch_to_register() {
    document.getElementById("login_page").style.display = "none";
    document.getElementById("register_page").style.display = "block";
}

function switch_delete_profile() {
    if (document.getElementById("delete_profile_container").style.display == "block") {
        document.getElementById("delete_profile_container").style.display = "none";
        document.getElementById("profile_container").style.display = "block";
    } else {
        document.getElementById("delete_profile_container").style.display = "block";
        document.getElementById("profile_container").style.display = "none";
    }
}

window.onload = function () {
    if (window.location.pathname === "/login") {
        switch_to_login();
    } else {
        console.log("switch_to_register");
        switch_to_register();
    }
};