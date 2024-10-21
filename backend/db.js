const mysql = require('mysql');


const con = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'liebherr' 
  });

module.exports = con