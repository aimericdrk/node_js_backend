const mongoose = require("mongoose");


const MongoDBURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mydb";

mongoose.set("strictQuery", false);

const mainDB = mongoose.createConnection(MongoDBURI, {
    dbName: process.env.DB_NAME
});

mainDB.on("error", (err) => {
    console.error("Erreur de connexion avec la base de données: ", err);
});

mainDB.once("open", async () => {
    console.log("connexion avec la base de données établie");
});

module.exports = { mainDB };