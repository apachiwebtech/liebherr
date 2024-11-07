

const express = require('express');

const app = express();

const cors = require('cors');

const sql = require("mssql");




// Middleware setup kar rahe hain

app.use(cors({ origin: '*' }));

app.use(express.json());

 

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

 

app.listen(8081, () => {

  console.log('erver is running on http://localhost:8081');

});

 

app.post('/login', (req, res) => {

 

  let { username, password } = req.body;

 

  const storeusername = "liebherr@gmail.com";

  const storepassword = "123456";

 

  console.log(username)

 

  if (username == "") {

    return res.json("Username is blank")

  }

  if (password == "") {

    return res.json("Password is blank")

  }

 

  if (username != storeusername || password != storepassword) {

    return res.json("Authentication Failed")

  }

 

  if (username == storeusername && password == storepassword) {

    return res.json({ status: 1 })

  }

 

});

 

app.get("/GetRecords", async (req, res) => {

  try {

    const pool = await poolPromise;

    const result = await pool.request().query("SELECT * FROM lhi_user");

    res.json(result.recordset);

  } catch (error) {

    res.status(500).send("Database query error " + error);

  }

});

 

app.get('/getdata', (req, res) => {

 

  return res.json("Hii")

})

