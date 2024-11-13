const test = require('node:test');
const assert = require('node:assert');
require("dotenv").config();
const test_request = require('./tests.js');

test_session = null;
my_user_id = null;
server_URL = `http://${process.env.SERVER_URL}:${process.env.PORT}`;

test('POST /register', async (t) => {
    console.log("registering in");

    const responseBody = await test_request.postRegister(process.env.TEST_EMAIL, process.env.TEST_USERNAME, process.env.TEST_PASSWORD);
    test_session = responseBody["session"];

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be Success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('GET /profile_info', async (t) => {
    console.log("\n\n\ngetting profile to check if the given session is valid");
    
    const responseBody = await test_request.getProfileInfo(test_session);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be success');
    assert.strictEqual(responseBody.username, process.env.TEST_USERNAME, 'Expected username to be correct');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('POST /logout', async (t) => {
    console.log("logging out");
    
    const responseBody = await test_request.postLogout(test_session);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('GET /profile_info', async (t) => {
    console.log("getting profile to verify the log out");
   
    const responseBody = await test_request.getProfileInfo(test_session);

    assert.strictEqual(responseBody.status, 401, 'Expected status code to be 401');
    assert.strictEqual(responseBody.messageStatus, "invalidSession", 'Expected status to be invalidSession');
    assert.strictEqual(responseBody.message, "It appears that your session is invalid", 'Expected message to be It appears that your session is invalid');
    if (responseBody.status != 401)
        console.log(responseBody)
})

test('POST /login', async (t) => {
    console.log("logging in and updating the token");
    
    const responseBody = await test_request.postLogin(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
    test_session = responseBody["session"];
    
    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be Success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('POST /login', async (t) => {
    console.log("logging in a second time to create a second session but don't update the token");

    const responseBody = await test_request.postLogin(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be Success');
    if (responseBody.status != 200)
        console.log(responseBody)
});


test('GET /profile_info', async (t) => {
    console.log("getting profile to check if the session is valid");

    const responseBody = await test_request.getProfileInfo(test_session);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be success');
    assert.strictEqual(responseBody.username, process.env.TEST_USERNAME, 'Expected username to be correct');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('POST /logouteverywhere', async (t) => {
    console.log("deleting every session");

    const responseBody = await test_request.postLogoutEverywhere(test_session);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('GET /profile_info', async (t) => {
    console.log("getting profile to verify the log out");

    const responseBody = await test_request.getProfileInfo(test_session);

    assert.strictEqual(responseBody.status, 401, 'Expected status code to be 401');
    assert.strictEqual(responseBody.messageStatus, "invalidSession", 'Expected status to be invalidSession');
    assert.strictEqual(responseBody.message, "It appears that your session is invalid", 'Expected message to be It appears that your session is invalid');
    if (responseBody.status != 401)
        console.log(responseBody)
})

test('POST /login', async (t) => {
    console.log("logging in and updating the token");
    
    const responseBody = await test_request.postLogin(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
    test_session = responseBody["session"];

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be Success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('DELETE /profile', async (t) => {
    console.log("deleting the account");

    const responseBody = await test_request.deleteAccount(test_session, process.env.TEST_PASSWORD);

    assert.strictEqual(responseBody.status, 200, 'Expected status code to be 200');
    assert.strictEqual(responseBody.messageStatus, "success", 'Expected success to be success');
    if (responseBody.status != 200)
        console.log(responseBody)
});

test('GET /profile_info', async (t) => {
    console.log("getting profile to verify the log out and account deletion");

    const responseBody = await test_request.getProfileInfo(test_session);

    assert.strictEqual(responseBody.status, 401, 'Expected status code to be 401');
    assert.strictEqual(responseBody.messageStatus, "invalidSession", 'Expected status to be invalidSession');
    assert.strictEqual(responseBody.message, "It appears that your session is invalid", 'Expected message to be It appears that your session is invalid');
    if (responseBody.status != 401)
        console.log(responseBody)
})

test('POST /login', async (t) => {
    console.log("logging in to ensure that the account is deleted");

    const responseBody = await test_request.postLogin(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);

    assert.strictEqual(responseBody.status, 401, 'Expected status code to be 401');
    assert.strictEqual(responseBody.messageStatus, "user_not_found", 'Expected success to be user_not_found');
    if (responseBody.status != 401)
        console.log(responseBody)
})

