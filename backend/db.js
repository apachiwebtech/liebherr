const sql = require("mssql");


const dbConfig = {
  user: "sa",
  password: "8$E5r6p8%8KH#F6V",
  server: "103.101.58.207",
  database: "licare",
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig).connect()

  .then(pool => { console.log("Connected to MSSQL via connection pool"); return pool; })

  .catch(err => console.error("Database Connection Pool Error:", err));

module.exports = poolPromise