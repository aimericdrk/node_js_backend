$(document).ready(async function () {

    const depth = window.location.href.replace(/[^//]/g, "").length - 2;
    const pathPrefix = "../".repeat(depth);
    const navbar_html_file = await fetch(`${pathPrefix}template/navbar.html`);
    let insertElem = "";

    document.body.innerHTML += `<div id="navbar_emplacement"></div>`

    const navbar_html = await navbar_html_file.text();

    document.getElementById("navbar_emplacement").innerHTML = navbar_html;
    insertElem += darkModeSwitch(document);
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: "/navbar_info_api",
        headers: {
            "token": document.cookie.substring(6),
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 2000,
    }).done((response) => {
        if (response.data.username != undefined && response.status == "loggedin")
            insertElem += loggedIn(document, response);
    }).fail((response) => {
        insertElem += notLoggedIn();
    }).always(() => {
        document.getElementById("navbar").innerHTML = insertElem
    })
});

function loggedIn(document, response)
{
    let htmlElem = `
        <li>Bonjour <b>${response.data.username}</b></li>
          <li class="dropdown">
            <a>Menu</a>
            <div class="dropdown-menu">
                ${window.location.pathname == "/" ? `<a href="/profile">Mon compte</a>` : `<a href="/">Menu</a>`}
                <a href="/upuser">modify account</a>
                <a href="/deluser">delete an account</a>
            </div>
            <div class="container_icon">
                <div class="drop_down_menu_icon"></div>
                <div class="drop_down_menu_icon"></div>
                <div class="drop_down_menu_icon"></div>
            </div>
          </li>
          <li><button onclick="location.href='/logout'">Logout</button></li>
    `
    return htmlElem;
}

function notLoggedIn()
{
    document.body.style.marginTop = "100px";
    let htmlElem = `<li><button onclick="switch_to_login()">Login</button></li><li><button onclick="switch_to_register()">Register</button></li>`
    return htmlElem;
}

function darkModeSwitch(document)
{
    let htmlElem = `<li>
        ${document.cookie.includes("darkmode=true") ?
        `<button onclick="switch_to_light_mode()">passez en mode clair</button>` :
        `<button onclick="switch_to_dark_mode()">passez en mode sombre</button>`}
    </li>`;
    return htmlElem;
}

function switch_to_dark_mode() {
    document.cookie = "darkmode=true;path=/;"
    location.reload()
}

function switch_to_light_mode() {
    document.cookie = "darkmode=false;path=/;"
    location.reload()
}