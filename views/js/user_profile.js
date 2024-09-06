

$(document).ready(function () {
    $.ajax({
        type: "GET",
        method: "GET",
        url: "/user_profile_info_api",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 2000,
    }).done((response) => {
        newElement = "<ul>";
        for (const [key, value] of Object.entries(response.data)) {
            newElement += `<li>
                <label for="${key}">${key} :</label>
                <span id="${key}">${value}</span>
            </li>`;
        }
        newElement += "</ul>";
        document.getElementById("infos").innerHTML = newElement;
    }).fail((response) => {
        console.log(response);
        document.getElementById("infos").innerHTML = "une erreur est survenue lors de la récupération de vos données";
    });
});