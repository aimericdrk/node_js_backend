const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./src/database/mongo");
const api_formatter = require("./src/middleware/api-formatter.js");


const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({limit: '5mb', extended: true}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
});

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

require("./src/router/user/user.query")(app);
require("./src/router/api/api.query")(app);

app.get("*", function (req, res) {
    return api_formatter(req, res, 404, "notFound", "This endpoint isn't found");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
