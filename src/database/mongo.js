const mongoose = require('mongoose');


const MongoDBURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mydb';

mongoose.set('strictQuery', false);

mongoose.connect(MongoDBURI, {
    dbName: process.env.DB_NAME,
    useUnifiedTopology: true,
    useNewUrlParser: true
 });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async () => {
  console.log("connexion avec la base de données établie")
});

exports.database = db;