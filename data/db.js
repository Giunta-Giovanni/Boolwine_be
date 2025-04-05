// import mysql
const boolwine = require('mysql2');
// start connection
const connection = boolwine.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// manage error
connection.connect((err) => {
    if (err) throw err;
    console.log('connection to mysql')
});

// connection export
module.exports = connection;