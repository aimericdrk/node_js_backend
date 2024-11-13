server_URL = `http://${process.env.SERVER_URL}:${process.env.PORT}`;

exports.postRegister = async (test_email, test_username, test_password) => {
    test_body = JSON.stringify({
        "email": test_email,
        "username": test_username,
        "password": test_password
    });
    test_headers = {
        'Content-Type': 'application/json',
    };
    return await make_request('POST', '/register', test_headers, test_body);
};

exports.postLogin = async (test_email, test_password) => {
    test_body = JSON.stringify({
        "emailOrUsername": test_email,
        "password": test_password
    });
    test_headers = {
        'Content-Type': 'application/json',
    };
    return await make_request('POST', '/login', test_headers, test_body);
};

exports.getProfileInfo = async (test_session) => {
    test_headers = {
        'Content-Type': 'application/json',
        'session': test_session
    };
    return await make_request('GET', '/profile_info', test_headers);
}

exports.postLogout = async (test_session) => {
    test_headers = {
        'Content-Type': 'application/json',
        'session': test_session
    };
    return await make_request('POST', '/logout', test_headers);
}

exports.postLogoutEverywhere = async (test_session) => {
    test_headers = {
        'Content-Type': 'application/json',
        'session': test_session
    };
    return await make_request('POST', '/logouteverywhere', test_headers);
}

exports.deleteAccount = async (test_session, test_password) => {
    test_body = JSON.stringify({
        "password": test_password
    });
    test_headers = {
        'Content-Type': 'application/json',
        'session': test_session
    };
    return await make_request('DELETE', '/profile', test_headers, test_body)
}

async function make_request(method, url, headers = {}, body = "{}") {
    let fetchBody = {
        method: method,
        headers: headers,
    };
    if (method == 'POST' || method == 'DELETE') {
        fetchBody = {
            method: method,
            headers: headers,
            body: body
        };
    }

    const response = await fetch(`${server_URL}${url}`, fetchBody);
    const formattedResponse = await response.json();
    return formattedResponse;
}