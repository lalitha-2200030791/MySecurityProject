const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if you have a different user
    password: 'Lalitha@311rlsv',  // Set your MySQL password
    database: 'login_system'
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

module.exports = db;
