const mysql = require("mysql2");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "RuchithaReddy1$",
    database: "ecommerce_db"
});
db.connect((err) => {
    if (err) {
        console.log("Database connection failed:",err);
    }else {
        console.log("MySQL Database Connected Successfully");
    }
});
module.exports = db;