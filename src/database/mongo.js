const mongoose = require("mongoose");


const MongoDBURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/";

mongoose.set("strictQuery", false);

const mainDB = mongoose.createConnection(MongoDBURI, {
    dbName: process.env.NODE_ENV == "PROD" ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,
});

mainDB.on("error", (err) => {
    console.error("An error occured when trying to connect with the database : ", err);
});

mainDB.once("open", async () => {
    console.log("Connection with database established");
});

module.exports = { mainDB };