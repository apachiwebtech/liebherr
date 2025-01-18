const sql = require("mssql");
const express = require('express');
const app = express();
const cors = require('cors');
const Category = require("./Routes/ProductMaster/Category");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const MobApp = require('./Routes/MobApp')
const fetchdata = require('./fetchdata')
const RateCardExcel = require('./Routes/Utils/RateCardExcel')

// Secret key for JWT
const JWT_SECRET = "Lh!_Login_123"; // Replace with a strong, secret key
const API_KEY = "a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67";

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


const authenticateToken = (req, res, next) => {

  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user; // Attach user info to request
    next();
  });

};

// this is for use routing


app.use("/", Category);
app.use("/", MobApp);
app.use("/", fetchdata);
app.use("/", RateCardExcel)



const uploadDir = path.join(__dirname, 'uploads');


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Absolute path to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
//
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

  console.log('Server is running on http://localhost:8081');

});



app.post("/loginuser", async (req, res) => {

  const { Lhiuser, password } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT id, Lhiuser ,email,Role FROM lhi_user WHERE Lhiuser = '${Lhiuser}' AND password = '${password}'`;


    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];


      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, Lhiuser: user.Lhiuser, email: user.email }, // Payload
        JWT_SECRET, // Secret key
        { expiresIn: "8h" } // Token validity
      );

      res.json({
        message: "Login successful",
        token, // Send token to client
        user: {
          id: user.id,
          Lhiuser: user.Lhiuser,
          Email: user.email,
          Role: user.Role,
        },
      });

    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.post("/lhilogin", async (req, res) => {

  const apiKey = req.header('x-api-key');

  const pool = await poolPromise;
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  try {
    const { lhiemail } = req.body;

    // Validate the provided email (this is just a placeholder; replace with your actual validation logic)
    if (!lhiemail || !lhiemail.includes("@")) {
      return res.status(400).json({ error: "Invalid email provided" });
    }
    const sql = `SELECT top 1  id, Lhiuser, email FROM lhi_user WHERE email = '${lhiemail}' and deleted = 0 and status = 1 `;

    const result = await pool.request().query(sql);
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      // Generate JWT token

      const token = jwt.sign({ email: lhiemail, id: user.id, Lhiuser: user.Lhiuser }, JWT_SECRET, { expiresIn: '8h' });

      res.json({
        message: "Login successful.",
        token, // Send token to client
        user: {
          id: user.id,
          Lhiuser: user.Lhiuser,
          Email: user.lhiemail
        },
      });
    } else {
      res.json({
        message: "Login Failed.",
        token: "", // Send token to client
        user: {
          id: "",
          Lhiuser: "",
          Email: ''
        },
      });

    }


  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login" });
  }
});





app.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "You have access", user: req.user });
});


//CSP Login

app.post("/csplogin", async (req, res) => {
  const { Lhiuser, password } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT * FROM awt_childfranchisemaster WHERE email = '${Lhiuser}' AND password = '${password}'`;

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, licare_code: user.licare_code },
        JWT_SECRET,
        { expiresIn: "8h" } // Token validity duration
      );

      res.json({
        message: "Login successful",
        token, // Send the token to the client
        user: {
          id: user.id,
          Lhiuser: user.email,
          licare_code: user.licare_code,
          Role: user.Role,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

//CSP End

app.post("/loginmsp", async (req, res) => {
  const { Lhiuser, password } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT * FROM awt_franchisemaster WHERE email = '${Lhiuser}' AND password = '${password}'`;

    console.log(sql);

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, licare_code: user.licarecode },
        JWT_SECRET,
        { expiresIn: "8h" } // Token validity duration
      );

      res.json({
        message: "Login successful",
        token, // Send the token to the client
        user: {
          id: user.id,
          Lhiuser: user.email,
          licare_code: user.licarecode,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});


app.post("/trainerlogin", async (req, res) => {
  const { trainer, password } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT * FROM lhi_trainer WHERE email = '${trainer}' AND password = '${password}'`;


    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, licare_code: user.licare_code },
        JWT_SECRET,
        { expiresIn: "8h" } // Token validity duration
      );

      res.json({
        message: "Login successful",
        token, // Send the token to the client
        user: {
          id: user.id,
          Lhiuser: user.email,
          licare_code: user.licare_code,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});
// app
//.post("/msplogin", async (req, res) => {
//   const { title, password } = req.body;

//   console.log(Msp)

//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;

//     const sql = `SELECT id, title FROM awt_franchisemaster WHERE title = '${title}' AND password = '${password}'`;

//     console.log(sql)

//     const result = await pool.request().query(sql);

//     if (result.recordset.length > 0) {
//       res.json({ id: result.recordset[0].id, title: result.recordset[0].title });
//     } else {
//       res.status(401).json({ message: "Invalid username or password" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Database error", error: err });
//   }
// });

app.post("/log", async (req, res) => {
  console.log("fffrdf")
})

app.get("/getdata", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM awt_country WHERE deleted = 0 ORDER BY id DESC");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


app.get("/requestdata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT * FROM awt_country WHERE id = ${id} AND deleted = 0`;

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});


app.post("/postdata", authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_country WHERE title = '${title}' AND deleted = 0
    `;
    const result = await pool.request().query(checkDuplicateSql);

    if (result.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Country already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT * FROM awt_country WHERE title = '${title}' AND deleted = 1
      `;
      const softDeletedData = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedData.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_country SET deleted = 0 WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);

        return res.json({
          message: "Soft-deleted data restored successfully!",
        });
      } else {
        // Step 3: Insert new data
        const insertSql = `
          INSERT INTO awt_country (title) VALUES ('${title}')
        `;
        await pool.request().query(insertSql);

        return res.json({ message: "Country added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Update existing user with duplicate check
app.post("/putdata", authenticateToken, async (req, res) => {
  const { title, id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_country
      WHERE title = '${title}'
        AND id != ${id}
        AND deleted = 0
    `;
    const result = await pool.request().query(checkDuplicateSql);

    if (result.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, title already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_country
        SET title = '${title}'
        WHERE id = ${id}
      `;
      await pool.request().query(updateSql);

      return res.json({ message: "Country updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});


app.post("/deletedata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      UPDATE awt_country
      SET deleted = 1
      WHERE id = ${id}
    `;
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user", error: err });
  }
});
//Country Master End

// Region start
app.get("/getregionsr", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      SELECT r.*, c.title as country_title
      FROM awt_region r
      JOIN awt_country c ON r.country_id = c.id
      WHERE r.deleted = 0 ORDER BY r.id DESC
    `;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Use `recordset` for MSSQL result
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});

// Get region by ID
app.get("/requestregion/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sqlQuery = `
      SELECT * FROM awt_region
      WHERE id = ${id}
        AND deleted = 0
    `;
    const result = await pool.request().query(sqlQuery);

    return res.json(result.recordset[0]); // Access the first result from recordset
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Insert new region with duplicate check
app.post("/postregion", authenticateToken, async (req, res) => {
  const { title, country_id } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_region
      WHERE title = '${title}' AND country_id = ${country_id} AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // Duplicate entry exists
      return res.status(409).json({ message: "Duplicate entry, Region already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT * FROM awt_region
        WHERE title = '${title}'
          AND deleted = 1
      `;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // Soft-deleted entry exists, restore it
        const restoreSoftDeletedSql = `
          UPDATE awt_region
          SET deleted = 0
          WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted Region restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_region (title, country_id)
          VALUES ('${title}', ${country_id})
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "Region added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Update existing region with duplicate check
app.post("/putregion", authenticateToken, async (req, res) => {
  const { title, id, country_id } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_region
      WHERE title = '${title}' AND country_id = ${country_id} AND id != ${id}
        AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // Duplicate entry exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Region already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_region
        SET title = '${title}', country_id = ${country_id}
        WHERE id = ${id}
      `;
      await pool.request().query(updateSql);
      return res.json({ message: "Region updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});

app.post("/deleteregion", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to mark the region as deleted
    const sqlQuery = `UPDATE awt_region SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sqlQuery);

    return res.json(result); // Respond with the result
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating region", error: err });
  }
});

// Region End

// GEO States Start

// API to fetch all Geo states that are not soft deleted
app.get("/getgeostates",
  authenticateToken, async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch geostates, including country and region titles
      const sqlQuery = `
      SELECT gs.*, c.title as country_title, r.title as region_title
      FROM awt_geostate gs
      JOIN awt_country c ON gs.country_id = c.id
      JOIN awt_region r ON gs.region_id = r.id
      WHERE gs.deleted = 0 ORDER BY gs.id ASC
    `;

      // Execute the query
      const result = await pool.request().query(sqlQuery);

      if (result.recordset.length > 0) {
        // Return the fetched geostates
        res.json(result.recordset);
      } else {
        res.status(404).json({ message: "No geostates found" });
      }
    } catch (err) {
      console.error(err); // Log error to the console for debugging
      res.status(500).json({ message: "Database error", error: err });
    }
  });


// API to fetch a specific GEO state by ID
app.get("/requestgeostate/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch the geostate by ID, excluding soft-deleted records
    const sqlQuery = `
      SELECT * FROM awt_geostate
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sqlQuery);

    if (result.recordset.length > 0) {
      // Return the fetched geostate
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Geostate not found" });
    }
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    res.status(500).json({ message: "Database error", error: err });
  }
});


// Insert new geostate with duplicate check
app.post("/postgeostate", authenticateToken, async (req, res) => {
  const { title, country_id, region_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_geostate
      WHERE title = '${title}' AND country_id = ${country_id} AND region_id = ${region_id} AND deleted = 0
    `;

    // Execute the query to check for duplicates
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, State already exists!" });
    }

    // Check if the same title exists but is soft-deleted
    const checkSoftDeletedSql = `
      SELECT * FROM awt_geostate
      WHERE title = '${title}' AND deleted = 1
    `;

    const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

    if (softDeletedResult.recordset.length > 0) {
      // Restore soft-deleted entry
      const restoreSoftDeletedSql = `
        UPDATE awt_geostate SET deleted = 0
        WHERE title = '${title}'
      `;

      await pool.request().query(restoreSoftDeletedSql);
      return res.json({ message: "Soft-deleted State restored successfully!" });
    } else {
      // Insert new entry if no duplicates found
      const insertSql = `
        INSERT INTO awt_geostate (title, country_id, region_id)
        VALUES ('${title}', ${country_id}, ${region_id})
      `;

      await pool.request().query(insertSql);
      return res.json({ message: "State added successfully!" });
    }
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Update existing geostate with duplicate check
app.post("/putgeostate", authenticateToken, async (req, res) => {
  const { title, id, country_id, region_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the same title exists for another record, excluding the current ID
    const checkDuplicateSql = `
      SELECT * FROM awt_geostate
      WHERE title = '${title}' AND country_id = ${country_id} AND region_id = ${region_id} AND id != ${id} AND deleted = 0
    `;

    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, State already exists!" });
    }

    // Update the record if no duplicates are found
    const updateSql = `
      UPDATE awt_geostate
      SET title = '${title}', country_id = ${country_id}, region_id = ${region_id}
      WHERE id = ${id}
    `;

    await pool.request().query(updateSql);
    return res.json({ message: "State updated successfully!" });

  } catch (err) {
    console.error(err); // Log error to the console for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// API to soft delete a state
app.post("/deletegeostate", authenticateToken,
  async (req, res) => {
    const { id } = req.body;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to mark the record as deleted (soft delete)
      const sql = `
      UPDATE awt_geostate
      SET deleted = 1
      WHERE id = ${id}
    `;

      // Execute the query
      const result = await pool.request().query(sql);

      // Return the result if successful
      return res.json(result);

    } catch (err) {
      console.error(err); // Log error to the console for debugging
      return res.status(500).json({ message: "Error updating state", error: err });
    }
  });
// Geo state End

//Geo City Start
// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregionscity/:country_id", authenticateToken, async (req, res) => {
  const { country_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch regions for the given country_id, excluding soft-deleted records
    const sql = `
      SELECT * FROM awt_region
      WHERE country_id = ${country_id}
      AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the fetched regions
    return res.json(result.recordset);

  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostatescity/:region_id", authenticateToken,
  async (req, res) => {
    const { region_id } = req.params;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch geostates for the given region_id, excluding soft-deleted records
      const sql = `
      SELECT * FROM awt_geostate
      WHERE region_id = ${region_id}
      AND deleted = 0
    `;

      // Execute the query
      const result = await pool.request().query(sql);

      // Return the fetched geostates
      return res.json(result.recordset);

    } catch (err) {
      console.error(err); // Log error for debugging
      return res.status(500).json({ message: "Database error", error: err });
    }
  });


app.get("/getdistrictcity/:geostateID", authenticateToken, async (req, res) => {
  const { geostateID } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;


    const sql = `
      SELECT * FROM awt_district
      WHERE geostate_id = ${geostateID}
      AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);


    // Return the fetched geostates
    return res.json(result.recordset);

  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});

app.get("/getpincodebyid/:cityid", authenticateToken, async (req, res) => {
  const { cityid } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_pincode WHERE geocity_id = ${cityid} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Return only the recordset data
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});


// API to fetch all cities (joining countries, regions, and geostates)
app.get("/getgeocities", authenticateToken,
  async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch geocities with related country, region, and geostate titles
      const sql = `
      SELECT gc.*, c.title AS country_title, r.title AS region_title, gs.title AS geostate_title, d.title AS district_title
      FROM awt_geocity gc
      JOIN awt_country c ON gc.country_id = c.id
      JOIN awt_region r ON gc.region_id = r.id
      JOIN awt_geostate gs ON gc.geostate_id = gs.id
      JOIN awt_district d ON gc.district = d.id
      WHERE gc.deleted = 0 ORDER BY gc.id DESC
    `;

      // Execute the query
      const result = await pool.request().query(sql);

      // Return the fetched geocities
      return res.json(result.recordset);

    } catch (err) {
      console.error("Database error:", err); // Log error for debugging
      return res.status(500).json({ message: "Database error", error: err.message });
    }
  });



// API to fetch a specific GEO city by ID
app.get("/requestgeocity/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch a geocity by id, excluding soft-deleted records
    const sql = `SELECT * FROM awt_geocity WHERE id = ${id} AND deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if a record was found and return it, or respond with a 404
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]); // Access the first record
    } else {
      return res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Insert new geocity with duplicate check
app.post("/postgeocity", authenticateToken, async (req, res) => {
  const { title, country_id, region_id, geostate_id, district } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to check for duplicate entries
    const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = '${title}' AND country_id = ${country_id} AND region_id = ${region_id} AND geostate_id =${geostate_id} AND district =${district} AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, City already exists!" });
    } else {
      // SQL query to check if the city title is soft-deleted
      const checkSoftDeletedSql = `SELECT * FROM awt_geocity WHERE title = '${title}' AND deleted = 1`;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // SQL query to restore the soft-deleted city
        const restoreSoftDeletedSql = `UPDATE awt_geocity SET deleted = 0 WHERE title = '${title}'`;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted City restored successfully!" });
      } else {
        // SQL query to insert a new city if no duplicates are found
        const insertSql = `INSERT INTO awt_geocity (title, country_id, region_id, geostate_id, district) VALUES ('${title}', ${country_id}, ${region_id}, ${geostate_id}, ${district})`;
        await pool.request().query(insertSql);
        return res.json({ message: "City added successfully!" });
      }
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// Update existing geocity with duplicate check
app.post("/putgeocity", authenticateToken,
  async (req, res) => {
    const { title, id, country_id, region_id, geostate_id, district } = req.body;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to check for duplicates (excluding the current record's id)
      const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = '${title}' AND country_id = ${country_id} AND region_id = ${region_id} AND geostate_id =${geostate_id} AND district =${district} AND id != ${id} AND deleted = 0`;
      const duplicateResult = await pool.request().query(checkDuplicateSql);

      if (duplicateResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, City already exists!" });
      } else {
        // SQL query to update the city record if no duplicates are found
        const updateSql = `UPDATE awt_geocity SET title = '${title}', country_id = ${country_id}, region_id = ${region_id}, geostate_id = ${geostate_id} WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "City updated successfully!" });
      }
    } catch (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ message: "Database error", error: err });
    }
  });


// API to soft delete a city
app.post("/deletegeocity", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to soft delete the city by setting deleted to 1
    const sql = `UPDATE awt_geocity SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result); // Send back the result of the query
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Error deleting city", error: err });
  }
});

// Geo City End

// Area Master Start
// API to fetch all countries (for the country dropdown)
// API to fetch countries
app.get("/getcountries", authenticateToken,
  async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      const sql = "SELECT * FROM awt_country WHERE deleted = 0";

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
app.get("/getcustomerid", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise
    const sql = "SELECT customer_id FROM awt_customer WHERE deleted = 0";
    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }


}
);

// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregions/:country_id", authenticateToken, async (req, res) => {
  const { country_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      SELECT * FROM awt_region
      WHERE country_id = ${country_id}
        AND deleted = 0
    `;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostates/:region_id", authenticateToken, async (req, res) => {
  const { region_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      SELECT * FROM awt_geostate
      WHERE region_id = ${region_id}
        AND deleted = 0
    `;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// API to fetch geocities based on selected geostate (for the geocity dropdown)
app.get("/getgeocities_a/:geostate_id",
  authenticateToken, async (req, res) => {
    const { geostate_id } = req.params;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      const sql = `
      SELECT * FROM awt_geocity
      WHERE geostate_id = ${geostate_id}
        AND deleted = 0
    `;
      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });


// API to fetch all areas (joining country, region, geostate, geocity)
app.get("/getareas", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
          SELECT a.*, c.title as country_title, r.title as region_title, gs.title as geostate_title
            FROM awt_district a
            JOIN awt_country c ON a.country_id = c.id
            JOIN awt_region r ON a.region_id = r.id
            JOIN awt_geostate gs ON a.geostate_id = gs.id
            WHERE a.deleted = 0 ORDER BY a.id DESC
    `;

    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// API to fetch a specific area by ID (joining country, region, geostate, geocity)
app.get("/requestarea/:id", authenticateToken, async (req, res) => {
  try {
    // Get the area ID from the URL parameters and ensure it is an integer
    const areaId = parseInt(req.params.id, 10);

    // Check if areaId is a valid number
    if (isNaN(areaId)) {
      return res.status(400).json({ message: "Invalid Area ID" });
    }

    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sqlQuery = `
      SELECT a.*,
             c.title AS country_title,
             r.title AS region_title,
             gs.title AS geostate_title
      FROM awt_district  a
      JOIN awt_country c ON a.country_id = c.id
      JOIN awt_region r ON a.region_id = r.id
      JOIN awt_geostate gs ON a.geostate_id = gs.id

      WHERE a.id = @areaId AND a.deleted = 0
    `;

    // Execute the query
    const result = await pool.request()
      .input('areaId', sql.Int, areaId) // Bind areaId parameter
      .query(sqlQuery);

    // Check if the area was found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Area not found" });
    }

    // Return the area data
    return res.status(200).json(result.recordset[0]);
  } catch (err) {
    // Enhanced error logging for debugging
    console.error("Error fetching area:", err.message, err.stack);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
});


// Insert new area with duplicate check
app.post("/postarea", authenticateToken, async (req, res) => {
  const { title, country_id, region_id, geostate_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the area already exists
    const checkDuplicateSql = `
      SELECT * FROM awt_district WHERE title = '${title}' AND country_id = '${country_id}' AND region_id = '${region_id}' AND geostate_id = '${geostate_id}' AND deleted = 0
    `;
    const checkResult = await pool.request().query(checkDuplicateSql);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Area already exists!" });
    }

    // Insert the new area
    const insertSql = `
      INSERT INTO awt_district (title, country_id, region_id, geostate_id)
      VALUES ('${title}', ${country_id}, ${region_id}, ${geostate_id})
    `;
    const insertResult = await pool.request().query(insertSql);

    return res.json({ message: "District added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// Update existing area with duplicate check
app.post("/putarea", authenticateToken, async (req, res) => {
  const { title, id, country_id, region_id, geostate_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the area already exists
    const checkDuplicateSql = `
      SELECT * FROM awt_district WHERE title = '${title}' AND country_id = '${country_id}' AND region_id = '${region_id}' AND geostate_id = '${geostate_id}' AND id != ${id} AND deleted = 0
    `;

    const checkResult = await pool.request().query(checkDuplicateSql);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Area already exists!" });
    }

    // Update the area
    const updateSql = `
    UPDATE awt_district
    SET title = '${title}', country_id = ${country_id}, region_id = ${region_id},
    geostate_id = ${geostate_id}
    WHERE id = ${id}
    `;
    console.log(updateSql, "Update query")
    const updateResult = await pool.request().query(updateSql);

    return res.json({ message: "Area updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// API to soft delete an area
app.post("/deletearea", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Update the area to be deleted
    const sql = `
      UPDATE awt_district SET deleted = 1 WHERE id = ${id}
    `;
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting area" });
  }
});
// Area End


// Pincode Master Start
// API to fetch regions based on selected country (for the region dropdown)
app.get("/getregionspincode/:country_id", authenticateToken, async (req, res) => {
  const { country_id } = req.params;

  try {
    // Use poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to get regions based on country_id without parameter binding
    const sql = `SELECT * FROM awt_region WHERE country_id = ${country_id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Send back the recordset for SQL Server results
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json(err); // Send back error response
  }
});


// API to fetch geostates based on selected region (for the geostate dropdown)
app.get("/getgeostatespincode/:region_id", authenticateToken, async (req, res) => {
  const { region_id } = req.params;

  try {
    // Get the connection pool with poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_geostate WHERE region_id = ${region_id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Send back only the recordset
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Send back error response
  }
});


// API to fetch geocities based on selected geostate (for the geocity dropdown)
app.get("/getgeocities_p/:area_id", authenticateToken,
  async (req, res) => {
    const { area_id } = req.params;

    try {
      // Access the connection pool using poolPromise
      const pool = await poolPromise;

      // Direct SQL query without parameter binding
      const sql = `SELECT * FROM awt_geocity WHERE district = ${area_id} AND deleted = 0`;
      const result = await pool.request().query(sql);

      return res.json(result.recordset); // Return only the recordset data
    } catch (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).json(err); // Return error response
    }
  });


// API to fetch areas based on selected geocity (for the area dropdown)
app.get("/getareas/:geostate_id", authenticateToken, async (req, res) => {
  const { geostate_id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_district WHERE geostate_id = ${geostate_id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Return only the recordset data
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});
// API to fetch pincodes based on selected areas (for the area dropdown)
app.get("/citywise_pincode/:pin_id", authenticateToken, async (req, res) => {
  const { pin_id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_pincode WHERE area_id = ${pin_id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Return only the recordset data
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});

// API to fetch all pincodes (joining country, region, geostate, geocity, area)
app.get("/getpincodes", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
       SELECT p.*,
             c.title as country_title,
             p.region_name as region_title,
             p.geostate_name as geostate_title,
             p.geocity_name as geocity_title,
             p.area_name as area_title
      FROM awt_pincode p
      JOIN awt_country c ON p.country_id = c.id
      WHERE p.deleted = 0 ORDER BY p.id DESC
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});

// API to fetch a specific pincode by ID (joining country, region, geostate, geocity, area)
app.get("/requestpincode/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Extract the pincodeId from request parameters

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Parameterized SQL query
    const sql = `
      SELECT p.*,
             c.title AS country_title,
             r.title AS region_title,
             gs.title AS geostate_title,
             gc.title AS geocity_title,
             a.title AS area_title
      FROM awt_pincode p
      INNER JOIN awt_country c ON p.country_id = c.id
      INNER JOIN awt_region r ON p.region_id = r.id
      INNER JOIN awt_geostate gs ON p.geostate_id = gs.id
      INNER JOIN awt_geocity gc ON p.geocity_id = gc.id
      INNER JOIN awt_district a ON p.area_id = a.id
      WHERE p.id = @id AND p.deleted = 0
    `;

    // Execute the query with a parameter
    const result = await pool
      .request()
      .input("id", id) // Safely pass the `id` parameter
      .query(sql);

    // If no data found, return a 404 response
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Pincode not found" });
    }

    // Return the first record (since it's a single pincode query)
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching pincode:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err }); // Return error response
  }
});

// Insert new pincode with duplicate check (considering country_id)
app.post("/postpincode", authenticateToken, async (req, res) => {
  const { pincode, country_id, region_id_title, geostate_id_title, geocity_id_title, area_id_title, region_id, geostate_id, geocity_id, area_id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Check for duplicates based on pincode and country_id
    const checkDuplicateSql = `
      SELECT * FROM awt_pincode
      WHERE pincode = ${pincode}
      AND country_id = '${country_id}'
      AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Pincode already exists in this country!"
      });
    } else {
      // If no duplicate, insert the new pincode
      const insertSql = `
        INSERT INTO awt_pincode (pincode, country_id, region_name, geostate_name, geocity_name, area_name,region_id,geostate_id,geocity_id , area_id)
        VALUES (${pincode}, ${country_id}, '${region_id_title}', '${geostate_id_title}', '${geocity_id_title}','${area_id_title}','${region_id}','${geostate_id}','${geocity_id}',${area_id})
      `;
      const insertResult = await pool.request().query(insertSql);

      return res.json({ message: "Pincode added successfully!" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});

// Update existing pincode with duplicate check (considering country_id)
app.post("/putpincode", authenticateToken, async (req, res) => {
  const {
    pincode,
    id,
    country_id,
    region_title,
    geostate_title,
    geocity_title,
    area_title,
    region_id,
    geostate_id,
    geocity_id,
    area_id,
  } = req.body;

  console.log(req.body)

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Check for duplicates based on pincode and country_id
    const checkDuplicateSql = `
      SELECT * FROM awt_pincode
      WHERE pincode = ${pincode}
      AND country_id = ${country_id}
      AND id != ${id}
      AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Pincode already exists in this country!"
      });
    } else {
      // If no duplicate, update the pincode
      const updateSql = `
        UPDATE awt_pincode
        SET pincode = ${pincode},
            country_id = ${country_id},
            region_name = '${region_title}',
            geostate_name = '${geostate_title}',
            geocity_name = '${geocity_title}',
            area_name = '${area_title}',
            area_id = ${area_id},
            geocity_id = ${geocity_id},
            geostate_id = ${geostate_id},
            region_id = ${region_id}
        WHERE id = ${id}
      `;

      console.log(updateSql)
      const updateResult = await pool.request().query(updateSql);

      return res.json({ message: "Pincode updated successfully!" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});

// API to soft delete a pincode
app.post("/deletepincode", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE awt_pincode
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting pincode:", err); // Log the error for debugging
    return res.status(500).json({ message: "Error deleting pincode", error: err });
  }
});
// Pincode Master End

//Start Product List
app.get("/getproductlist", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      serial_no,
      item_code,
      item_description,
      productType,
      productLine,
      material,
      manufacturer,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    // Directly use the query (no parameter binding)
    let sql = `SELECT m.* FROM product_master as m WHERE 1= 1 `;

    if (serial_no) {
      sql += ` AND m.serial_no LIKE '%${serial_no}%'`;
    }

    if (item_code) {
      sql += ` AND m.item_code LIKE '%${item_code}%'`;
    }

    if (productType) {
      sql += ` AND m.productType LIKE '%${productType}%'`;
    }

    if (productLine) {
      sql += ` AND m.productLine LIKE '%${productLine}%'`;
    }

    if (material) {
      sql += ` AND m.material LIKE '%${material}%'`;
    }
    if (manufacturer) {
      sql += ` AND m.manufacturer LIKE '%${manufacturer}%'`;
    }

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY m.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM product_master where 1=1 `;
    if (serial_no) countSql += ` AND serial_no LIKE '%${serial_no}%'`;
    if (item_code) countSql += ` AND item_code LIKE '%${item_code}%'`;

    if (item_description) countSql += ` AND item_description LIKE '%${item_description}%'`;
    if (productType) countSql += ` AND productType LIKE '%${productType}%'`;
    if (productLine) countSql += ` AND productLine LIKE '%${productLine}%'`;
    if (material) countSql += ` AND material LIKE '%${material}%'`;
    if (manufacturer) countSql += ` AND manufacturer LIKE '%${manufacturer}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
// Product list end
//customer list start
//customer list start
app.get("/getcustomerlist", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const {
      customer_fname,
      customer_id,
      customer_type,
      customer_lname,
      mobileno,
      email,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    let sql = `SELECT c.* FROM awt_customer as c WHERE c.deleted = 0`;

    // Dynamically add filters based on query parameters
    if (customer_fname) {
      sql += ` AND c.customer_fname LIKE '%${customer_fname}%'`;
    }

    if (customer_lname) {
      sql += ` AND c.customer_lname LIKE '%${customer_lname}%'`;
    }

    if (mobileno) {
      sql += ` AND c.mobileno LIKE '%${mobileno}%'`;
    }

    if (email) {
      sql += ` AND c.email LIKE '%${email}%'`;
    }

    if (customer_type) {
      sql += ` AND c.customer_type LIKE '%${customer_type}%'`;
    }

    if (customer_id) {
      sql += ` AND c.customer_id LIKE '%${customer_id}%'`;
    }

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY c.customer_id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Get the customer data
    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_customer WHERE deleted = 0`;
    if (customer_fname) countSql += ` AND customer_fname LIKE '%${customer_fname}%'`;
    if (customer_lname) countSql += ` AND customer_lname LIKE '%${customer_lname}%'`;
    if (mobileno) countSql += ` AND mobileno LIKE '%${mobileno}%'`;
    if (email) countSql += ` AND email LIKE '%${email}%'`;
    if (customer_type) countSql += ` AND customer_type LIKE '%${customer_type}%'`;
    if (customer_id) countSql += ` AND customer_id LIKE '%${customer_id}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;

    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the customer list" });
  }
});

// app.get("/requestcustomerlist/:id", async (req, res) => {
//   try {

//     const pool = await poolPromise;
//     const id = req.params.id;
//     const sql = `SELECT * FROM awt_customer WHERE id = @id`;

//     const result = await pool.request()
//       .input('id', id)
//       .query(sql);


//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     return res.json(result.recordset);
//   }
//   catch (err) {
//     console.error('Error in requestcustomerlist/:id endpoint:', err);
//     return res.status(500).json({ error: 'An error occurred while fetching customer data' });
//   }
// })
//Category Start
app.get("/getcat", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    const sql = `
      SELECT *
      FROM awt_category
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



// Insert for category
app.post("/postdatacat", authenticateToken, async (req, res) => {
  const { title } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_category
      WHERE title = '${title}' AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Country already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM awt_category
        WHERE title = '${title}' AND deleted = 1
      `;
      const softDeletedCheckResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedCheckResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_category
          SET deleted = 0
          WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_category (title)
          VALUES ('${title}')
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "Category added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error adding category:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// edit for category
app.get("/requestdatacat/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM awt_category
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Check if the result is empty
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Return the first record from the result set
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching category:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// update for category
app.post("/putcatdata", authenticateToken, async (req, res) => {
  const { title, id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Direct SQL query to check for duplicates without parameter binding
    const checkDuplicateSql = `
      SELECT *
      FROM awt_category
      WHERE title = '${title}' AND id != ${id} AND deleted = 0
    `;

    // Execute the duplicate check query
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate title exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, title already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_category
        SET title = '${title}'
        WHERE id = ${id}
      `;

      // Execute the update query
      await pool.request().query(updateSql);

      return res.json({ message: "Category updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating category:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// delete for category
app.post("/deletecatdata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE awt_category
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the update query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting category:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating category" });
  }
});

//sub category start
// fetch data for subcategory
app.get("/getsubcategory", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT r.*,
             c.title as category_title
      FROM awt_subcat r
      JOIN awt_category c ON r.category_id = c.id
      WHERE r.deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching subcategories:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching subcategories" });
  }
});

// fetch subcat for specific subcats uding id

app.get("/requestsubcat/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;


    const sql = `
      SELECT *
      FROM awt_subcat
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Return the first record from the recordset if it exists, else return an empty object
    return res.json(result.recordset[0] || {});
  } catch (err) {
    console.error("Error fetching subcategory by ID:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching subcategory" });
  }
});

// insert for subcategory
app.post("/postsubcategory", authenticateToken, async (req, res) => {
  try {
    const { title, category_id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_subcat
      WHERE title = '${title}' AND deleted = 0
    `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, subcat already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM awt_subcat
        WHERE title = '${title}' AND deleted = 1
      `;
      const checkSoftDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (checkSoftDeletedResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_subcat
          SET deleted = 0
          WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted subcat restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_subcat (title, category_id)
          VALUES ('${title}', ${category_id})
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "subcat added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error processing subcategory:", err); // Log error for debugging
    return res.status(500).json({ message: "Error processing subcategory" });
  }
});

// update for subcategory
app.post("/putsubcategory", authenticateToken, async (req, res) => {
  try {
    const { title, id, category_id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_subcat
      WHERE title = '${title}' AND id != ${id} AND deleted = 0
    `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, subcat already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_subcat
        SET title = '${title}', category_id = ${category_id}
        WHERE id = ${id}
      `;
      await pool.request().query(updateSql);
      return res.json({ message: "subcat updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating subcategory:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating subcategory" });
  }
});

// delete for subcategory
app.post("/deletesubcat", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;


    const sql = `
      UPDATE awt_subcat
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error("Error updating subcategory:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating subcategory" });
  }
});

//fetch data for category dropdown
app.get("/getcategory", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    const sql = `
      SELECT *
      FROM awt_category
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching categories" });
  }
});

//channel Partner start
app.get("/getcdata", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM awt_channelpartner
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching channel partner data:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching channel partner data" });
  }
});

// Insert for Channel_partner
app.post("/postcdata", authenticateToken, async (req, res) => {
  try {
    const { Channel_partner } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same Channel_partner exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_channelpartner
      WHERE Channel_partner = '${Channel_partner}' AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Channel_partner already exists!" });
    } else {
      // Step 2: Check if the same Channel_partner exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM awt_channelpartner
        WHERE Channel_partner = '${Channel_partner}' AND deleted = 1
      `;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_channelpartner
          SET deleted = 0
          WHERE Channel_partner = '${Channel_partner}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_channelpartner (Channel_partner)
          VALUES ('${Channel_partner}')
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "Channel partner added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error handling channel partner data:", err); // Log error for debugging
    return res.status(500).json({ message: "Error handling channel partner data" });
  }
});




// edit for Channel_partner

app.get("/requestcdata/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM awt_channelpartner
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Return the first record from the recordset if it exists, else return an empty object
    return res.json(result.recordset[0] || {});
  } catch (err) {
    console.error("Error fetching channel partner by ID:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching channel partner" });
  }
});


// update for Channel_partner
app.post("/putcdata", authenticateToken, async (req, res) => {
  try {
    const { Channel_partner, id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same Channel_partner exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_channelpartner
      WHERE Channel_partner = '${Channel_partner}' AND id != ${id} AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Channel_partner already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_channelpartner
        SET Channel_partner = '${Channel_partner}'
        WHERE id = ${id}
      `;
      await pool.request().query(updateSql);
      return res.json({ message: "Channel_partner updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating channel partner:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating channel partner" });
  }
});

// delete for Channel_partner
app.post("/deletecdata", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE awt_channelpartner
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the query
    await pool.request().query(sql);

    // Return success message
    return res.json({ message: "Channel partner deleted successfully!" });
  } catch (err) {
    console.error("Error deleting channel partner:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating channel partner" });
  }
});


// Defect Group Code start

app.get("/getcom", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const sql = `
      SELECT * FROM awt_defectgroup
      WHERE deleted = 0 order by id DESc
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Defect Group Code:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Defect Group Codes" });
  }
});

// Insert for Defect Group Code
app.post("/postdatacom", authenticateToken, async (req, res) => {
  try {
    const { id, defectgroupcode, defectgrouptitle, description, created_by } = req.body;
    const pool = await poolPromise;

    if (id) {
      const checkDuplicateSql = `
        SELECT *
        FROM awt_defectgroup
        WHERE defectgroupcode = '${defectgroupcode}' AND id != ${id} AND deleted = 0
      `;
      const duplicateData = await pool.request().query(checkDuplicateSql);

      if (duplicateData.recordset.length > 0) {

        return res.status(409).json({ message: "Duplicate entry, Defect Group Code already exists!" });
      } else {

        const updateSql = `
          UPDATE awt_defectgroup
          SET defectgroupcode = '${defectgroupcode}', defectgrouptitle = '${defectgrouptitle}', description = '${description}', updated_date = GETDATE(), updated_by = '${created_by}'
          WHERE id = ${id}
        `;
        await pool.request().query(updateSql);

        return res.json({ message: "Defect Group updated successfully!" });
      }
    } else {

      const checkDuplicateSql = `
        SELECT *
        FROM awt_defectgroup
        WHERE defectgroupcode = '${defectgroupcode}' AND deleted = 0
      `;
      const duplicateData = await pool.request().query(checkDuplicateSql);

      if (duplicateData.recordset.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res.status(409).json({ message: "Duplicate entry, Defect Group Code already exists!" });
      } else {

        const checkSoftDeletedSql = `
          SELECT *
          FROM awt_defectgroup
          WHERE defectgroupcode = '${defectgroupcode}' AND deleted = 1
        `;
        const softDeletedData = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedData.recordset.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `
            UPDATE awt_defectgroup
           SET defectgroupcode = '${defectgroupcode}', defectgrouptitle = '${defectgrouptitle}', description = '${description}', updated_date = GETDATE(), updated_by = '${created_by}'
            WHERE defectgroupcode = '${defectgroupcode}'
          `;
          await pool.request().query(restoreSoftDeletedSql);

          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new entry if no duplicates found
          const insertSql = `
            INSERT INTO awt_defectgroup (defectgroupcode,defectgrouptitle,description, created_date, created_by)
            VALUES ('${defectgroupcode}', '${defectgrouptitle}', '${description}', GETDATE(), '${created_by}')
          `;
          await pool.request().query(insertSql);

          return res.json({ message: "Defect Group added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error("Error processing request:", err); // Log error for debugging
    return res.status(500).json({ message: "Error processing request" });
  }
});

// edit for Defect Group Code

app.get("/requestdatacom/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const sql = `
      SELECT *
      FROM awt_defectgroup
      WHERE id = ${id} AND deleted = 0
    `;
    const result = await pool.request().query(sql);
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Complaint code not found" });
    }
  } catch (err) {
    console.error("Error fetching complaint code:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching complaint code" });
  }
});

// update for Defect Group Code
app.post("/putcomdata", authenticateToken, async (req, res) => {
  try {
    const { id, defectgroupcode, defectgrouptitle, description, updated_by } = req.body;
    const pool = await poolPromise;

    if (id) {
      // Check for duplicate Defect Group Code (excluding the current record)
      const checkDuplicateSql = `
        SELECT *
        FROM awt_defectgroup
        WHERE defectgroupcode = '${defectgroupcode}' AND id != ${id} AND deleted = 0
      `;
      const duplicateData = await pool.request().query(checkDuplicateSql);

      if (duplicateData.recordset.length > 0) {
        // Duplicate exists, respond with conflict
        return res.status(409).json({ message: "Duplicate entry, Defect Group Code already exists!" });
      } else {
        // Update the existing defect group
        const updateSql = `
          UPDATE awt_defectgroup
          SET defectgroupcode = '${defectgroupcode}',
              defectgrouptitle = '${defectgrouptitle}',
              description = '${description}',
              updated_date = GETDATE(),
              updated_by = '${updated_by}'
          WHERE id = ${id}
        `;
        await pool.request().query(updateSql);

        return res.json({ message: "Defect Group updated successfully!" });
      }
    } else {
      // If ID is not provided, return bad request
      return res.status(400).json({ message: "ID is required for updating a Defect Group." });
    }
  } catch (err) {
    console.error("Error updating Defect Group:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating Defect Group" });
  }
});


// delete for Defect Group Code
app.post("/deletecomdata", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE awt_defectgroup
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the query
    await pool.request().query(sql);

    // Return success message
    return res.json({ message: "Complaint code deleted successfully!" });
  } catch (err) {
    console.error("Error deleting complaint code:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating complaint code" });
  }
});
// Defect Group Code End


// Type Of Defect Code Start
app.get("/getgroupdefectcode", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = "select * from awt_defectgroup WHERE deleted = 0";

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

app.get("/getactivity", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = "select * from awt_activity WHERE deleted = 0";

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});


app.get("/gettypeofdefect", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const sql = `
     SELECT
        td.*, dg.defectgrouptitle as grouptitle
      FROM awt_typeofdefect td
      LEFT JOIN awt_defectgroup dg ON td.groupdefect_code = dg.defectgroupcode
      WHERE td.deleted = 0 ORDER by id desc
    `;
    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Type of Defects:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Type of Defects" });
  }
});

// Insert  Type Of Defect Code
app.post("/postdatatypeofdefect", authenticateToken, async (req, res) => {
  const { defect_code, groupdefect_code, defect_title, description, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the same defect_code exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_typeofdefect
      WHERE defect_code = '${defect_code}' AND  groupdefect_code = '${groupdefect_code}'
      AND deleted = 0
    `;

    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate active record exists
      return res.status(409).json({ message: "Duplicate entry, defect_code already exists!" });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO awt_typeofdefect (
          defect_code, groupdefect_code, defect_title, description, created_date, created_by, deleted
        )
        VALUES (
          '${defect_code}', '${groupdefect_code}', '${defect_title}', '${description}', GETDATE(), '${created_by}', 0
        )
      `;

      await pool.request().query(insertSql);

      return res.json({ message: "Type Of defect code added successfully!" });
    }
  } catch (err) {
    console.error("Error handling defect_code:", err);
    return res.status(500).json({ message: "Error handling Type Of defect code" });
  }
});

// Edit Type Of Defect Code by ID
app.get("/requestdatatypeofdefect/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const sql = `
      SELECT
        defect_code,
        groupdefect_code,
        defect_title,
        description,
        created_by,
        created_date,
        deleted
      FROM awt_typeofdefect
      WHERE id = ${id}
      AND deleted = 0
    `;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Type Of Defect not found" });
    }
  } catch (err) {
    console.error("Error fetching Type Of Defect:", err);
    return res.status(500).json({ message: "Error fetching Type Of Defect" });
  }
});

// Update Type Of Defect Code
app.post("/putdatatypeofdefect", authenticateToken, async (req, res) => {
  const { id, defect_code, groupdefect_code, defect_title, description, updated_by } = req.body;
  try {
    const pool = await poolPromise;
    const checkDuplicateSql = `
      SELECT * FROM awt_typeofdefect
      WHERE defect_code = '${defect_code}' AND  groupdefect_code = '${groupdefect_code}'
      AND deleted = 0
      AND id != ${id}
    `;

    console.log(checkDuplicateSql, "check duplicate ");

    const checkResult = await pool.request().query(checkDuplicateSql);
    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, defect_code already exists!" });
    } else {
      const updateSql = `
        UPDATE awt_typeofdefect
        SET
          defect_code = '${defect_code}',
          groupdefect_code = '${groupdefect_code}',
          defect_title = '${defect_title}',
          description = '${description}',
          updated_by = '${updated_by}',
          updated_date = GETDATE()
        WHERE id = ${id} AND deleted = 0
      `;

      console.log(updateSql, "update sql")
      await pool.request().query(updateSql);
      return res.json({ message: "Type Of Defect updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating Type Of Defect:", err);
    return res.status(500).json({ message: "Error updating Type Of Defect" });
  }
});


// Soft-delete rType Of Defect Code by ID
app.post("/deletetypeofdefect", authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `
      UPDATE awt_typeofdefect
      SET deleted = 1, updated_date = GETDATE()
      WHERE id = ${id}
    `;
    await pool.request().query(sql);
    return res.json({ message: "Type of Defect deleted successfully!" });
  } catch (err) {
    console.error("Error deleting Type of Defect:", err);
    return res.status(500).json({ message: "Error deleting Type of Defect" });
  }
});

// Type Of Defect Code End



//Site code Start
app.get("/getsitedefect", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const sql = `
    SELECT
    td.*, dg.defectgrouptitle as grouptitle
  FROM awt_site_defect td
  LEFT JOIN awt_defectgroup dg ON td.defectgroupcode = dg.defectgroupcode
  WHERE td.deleted = 0 order by td.id DESC
    `;
    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Type of Defects:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Site Defects" });
  }
});

// Insert  Type Of Defect Code
app.post("/postactivity", authenticateToken, async (req, res) => {
  const { dsite_code, groupdefectcode, dsite_title, description, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the same defect_code exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_activity
      WHERE code = '${dsite_code}' AND  title = '${groupdefectcode}'
      AND deleted = 0
    `;

    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate active record exists
      return res.status(409).json({ message: "Duplicate entry, Site Defect code already exists!" });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO awt_activity (
          code, title,description, created_date, created_by, deleted
        )
        VALUES (
          '${dsite_code}', '${dsite_title}', '${description}', GETDATE(), '${created_by}', 0
        )
      `;



      await pool.request().query(insertSql);

      return res.json({ message: "Site defect code added successfully!" });
    }
  } catch (err) {
    console.error("Error handling defect_code:", err);
    return res.status(500).json({ message: "Error handling Site defect code" });
  }
});
// Insert  Type Of Defect Code
app.post("/postsitedefect", authenticateToken, async (req, res) => {
  const { dsite_code, groupdefectcode, dsite_title, description, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the same defect_code exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_site_defect
      WHERE dsite_code = '${dsite_code}' AND  defectgroupcode = '${groupdefectcode}'
      AND deleted = 0
    `;

    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate active record exists
      return res.status(409).json({ message: "Duplicate entry, Site Defect code already exists!" });
    } else {
      // Insert new record
      const insertSql = `
        INSERT INTO awt_site_defect (
          dsite_code, defectgroupcode, dsite_title, description, created_date, created_by, deleted
        )
        VALUES (
          '${dsite_code}', '${groupdefectcode}', '${dsite_title}', '${description}', GETDATE(), '${created_by}', 0
        )
      `;

      await pool.request().query(insertSql);

      return res.json({ message: "Site defect code added successfully!" });
    }
  } catch (err) {
    console.error("Error handling defect_code:", err);
    return res.status(500).json({ message: "Error handling Site defect code" });
  }
});


// Edit Type Of Activity by ID
app.get("/requestactivity/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const sql = `
      SELECT
     *
      FROM awt_activity
      WHERE id = ${id}
      AND deleted = 0
    `;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Type Of Defect not found" });
    }
  } catch (err) {
    console.error("Error fetching Type Of Defect:", err);
    return res.status(500).json({ message: "Error fetching Type Of Defect" });
  }
});

// Edit Type Of Defect Code by ID
app.get("/requestsitedefect/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const sql = `
      SELECT
      dsite_code,
        defectgroupcode,
        dsite_title,
        description,
        created_by,
        created_date,
        deleted
      FROM awt_site_defect
      WHERE id = ${id}
      AND deleted = 0
    `;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Type Of Defect not found" });
    }
  } catch (err) {
    console.error("Error fetching Type Of Defect:", err);
    return res.status(500).json({ message: "Error fetching Type Of Defect" });
  }
});

// Update Type Of Activity
app.post("/putactivity", authenticateToken, async (req, res) => {
  const { id, dsite_code, groupdefectcode, dsite_title, description, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicates with same `dsite_code` and `defectgroupcode`, excluding the current record (`id`)
    const checkDuplicateSql = `
      SELECT * FROM awt_activity
      WHERE title = '${dsite_code}'
      AND code = '${groupdefectcode}'
      AND deleted = 0
      AND id != ${id}
    `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate entry exists
      return res.status(409).json({ message: "Duplicate entry, Site Defect code already exists!" });
    } else {
      // Update record
      const updateSql = `
        UPDATE awt_activity
        SET
          code = '${dsite_code}',
          title = '${dsite_title}',
          description = '${description}',
          updated_by = '${updated_by}',
          updated_date = GETDATE()
        WHERE id = ${id} AND deleted = 0
      `;

      console.log(updateSql);

      await pool.request().query(updateSql);

      return res.json({ message: "Site defect code updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating Site Defect code:", err);
    return res.status(500).json({ message: "Error updating Site Defect code" });
  }
});


// Update Type Of Defect Code
app.post("/putsitedefect", authenticateToken, async (req, res) => {
  const { id, dsite_code, groupdefectcode, dsite_title, description, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicates with same `dsite_code` and `defectgroupcode`, excluding the current record (`id`)
    const checkDuplicateSql = `
      SELECT * FROM awt_site_defect
      WHERE dsite_code = '${dsite_code}'
      AND defectgroupcode = '${groupdefectcode}'
      AND deleted = 0
      AND id != ${id}
    `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate entry exists
      return res.status(409).json({ message: "Duplicate entry, Site Defect code already exists!" });
    } else {
      // Update record
      const updateSql = `
        UPDATE awt_site_defect
        SET
          dsite_code = '${dsite_code}',
          defectgroupcode = '${groupdefectcode}',
          dsite_title = '${dsite_title}',
          description = '${description}',
          updated_by = '${updated_by}',
          updated_date = GETDATE()
        WHERE id = ${id} AND deleted = 0
      `;
      await pool.request().query(updateSql);

      return res.json({ message: "Site defect code updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating Site Defect code:", err);
    return res.status(500).json({ message: "Error updating Site Defect code" });
  }
});



// Soft-delete rType Of Defect Code by ID
app.post("/deleteactivity", authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `
      UPDATE awt_activity
      SET deleted = 1, updated_date = GETDATE()
      WHERE id = ${id}
    `;
    await pool.request().query(sql);
    return res.json({ message: "Type of Defect deleted successfully!" });
  } catch (err) {
    console.error("Error deleting Type of Defect:", err);
    return res.status(500).json({ message: "Error deleting Type of Defect" });
  }
});
// Soft-delete rType Of Defect Code by ID
app.post("/deletesitedefect", authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `
      UPDATE awt_site_defect
      SET deleted = 1, updated_date = GETDATE()
      WHERE id = ${id}
    `;
    await pool.request().query(sql);
    return res.json({ message: "Type of Defect deleted successfully!" });
  } catch (err) {
    console.error("Error deleting Type of Defect:", err);
    return res.status(500).json({ message: "Error deleting Type of Defect" });
  }
});


//Site code End


// Start Complaint View
app.get("/getcomplaintview/:complaintid", authenticateToken, async (req, res) => {
  const { complaintid } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM complaint_ticket
      WHERE id = ${complaintid} AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if data was found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Return the first result
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.post("/addcomplaintremark", authenticateToken, async (req, res) => {
  const { ticket_no, note, created_by } = req.body;
  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const pool = await poolPromise;

    // Use parameterized queries to prevent SQL injection
    const sql = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
      OUTPUT INSERTED.id AS remark_id
      VALUES (@ticket_no, @note, @created_by, @created_date)
    `;

    const result = await pool.request()
      .input("ticket_no", ticket_no)
      .input("note", note)
      .input("created_by", created_by)
      .input("created_date", formattedDate)
      .query(sql);

    const remark_id = result.recordset[0]?.remark_id;

    return res.json({
      message: "Remark added successfully!",
      remark_id: remark_id, // Send the generated remark ID back to the client
    });
  } catch (err) {
    console.error("Error inserting remark:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});




app.post("/uploadcomplaintattachments", authenticateToken, upload.array("attachment"), async (req, res) => {
  const { ticket_no, remark_id, created_by } = req.body;
  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    const pool = await poolPromise;

    // Combine filenames into a comma-separated string
    const attachments = req.files.map((file) => file.filename);
    const attachmentString = attachments.join(", ");

    // Insert the attachments with the remark_id obtained from the previous step
    const sql = `
      INSERT INTO awt_complaintattachment (remark_id, ticket_no, attachment, created_by, created_date)
      VALUES (${remark_id}, '${ticket_no}', '${attachmentString}', '${created_by}', '${formattedDate}')
    `;
    console.log("SQL Query:", sql);

    await pool.request().query(sql);

    return res.json({
      message: "Files uploaded successfully",
      remark_id: remark_id // return remark_id for confirmation
    });

  } catch (err) {
    console.error("Error inserting attachments:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});




app.get("/getComplaintDetails/:ticket_no", authenticateToken, async (req, res) => {
  const ticket_no = req.params.ticket_no;

  try {
    const pool = await poolPromise;

    // Direct SQL query without parameter binding for remarks
    const remarkQuery = `SELECT ac.*, ud.title FROM awt_complaintremark as ac LEFT JOIN userdetails as ud on ud.usercode = ac.created_by WHERE ac.ticket_no = ${"'" + ticket_no + "'"} order by id DESC`;

    console.log(remarkQuery, "$$")

    // Execute remark query
    const remarksResult = await pool.request().query(remarkQuery);
    const remarks = remarksResult.recordset;

    // Direct SQL query without parameter binding for attachments
    const attachmentQuery = `
      SELECT * FROM awt_complaintattachment
      WHERE ticket_no = ${"'" + ticket_no + "'"}
    `;



    // Execute attachment query
    const attachmentsResult = await pool.request().query(attachmentQuery);
    const attachments = attachmentsResult.recordset;

    // Return both remarks and attachments in a single response
    res.json({ remarks, attachments });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});


// Complaint view Previous ticket
app.get("/getComplaintDuplicate/:customer_mobile", authenticateToken, async (req, res) => {
  const { customer_mobile } = req.params;

  try {
    const pool = await poolPromise;

    // Modified SQL query to skip the latest entry for duplicates
    const sql = `
      WITH DuplicateNumbers AS (
        SELECT customer_mobile
        FROM complaint_ticket
        WHERE deleted = 0
        GROUP BY customer_mobile
        HAVING COUNT(*) > 1
      ),
      RankedComplaints AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY customer_mobile ORDER BY id DESC) as rn
        FROM complaint_ticket
        WHERE deleted = 0
        AND customer_mobile IN (SELECT customer_mobile FROM DuplicateNumbers)
      )
      SELECT *
      FROM RankedComplaints
      WHERE rn > 1
      AND customer_mobile = @customer_mobile
      ORDER BY id DESC
    `;

    const result = await pool.request()
      .input('customer_mobile', customer_mobile)
      .query(sql);

    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});


// End Complaint View

app.post("/uploadAttachment2", upload.array("attachment2"), async (req, res) => {
  const { ticket_no, created_by } = req.body;
  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Validate request
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // Get all filenames and join them
  const attachments = req.files.map((file) => file.filename);
  const attachmentString = attachments.join(", ");

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Adjusted SQL query without line breaks and extra characters
    const sql = `
      INSERT INTO awt_attachment2 (ticket_no, attachment, created_by, created_date)
      OUTPUT INSERTED.id
      VALUES ('${ticket_no}', '${attachmentString}', '${created_by}', '${formattedDate}')
    `;

    // Execute the query and get the inserted ID
    const result = await pool.request().query(sql);

    // Return the success message along with the inserted ID
    return res.json({
      message: "Files uploaded successfully",
      count: attachments.length,
      insertId: result.recordset[0].id  // Should now correctly return the ID
    });
  } catch (err) {
    console.error("Error inserting attachment 2:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});







// Route to get attachment 2 details
app.get("/getAttachment2Details/:ticket_no",
  authenticateToken, async (req, res) => {
    const ticket_no = req.params.ticket_no;

    try {
      // Access the connection pool using poolPromise
      const pool = await poolPromise;

      // Direct SQL query without parameter binding
      const sql = `
      SELECT ac.*, lu.Lhiuser
      FROM awt_attachment2 as ac
      LEFT JOIN lhi_user as lu
      ON ac.created_by = lu.id
      WHERE ac.ticket_no = '${ticket_no}'
      ORDER BY created_date DESC
    `;

      // Execute the query
      const result = await pool.request().query(sql);

      // Return the attachment details
      return res.json({ attachments2: result.recordset });
    } catch (err) {
      console.error("Error fetching attachment 2:", err);
      return res.status(500).json({ error: "Error fetching attachments", details: err.message });
    }
  });

//Complaint view  Attachment 2 End

app.get("/getcvengineer/:pincode/:msp/:csp", authenticateToken, async (req, res) => {

  let { pincode, msp, csp } = req.params;
  console.log(pincode, msp, csp, "vkjuyfhdgviuc dyuhj");

  try {
    const pool = await poolPromise;


    // Direct SQL query without parameter binding
    //   const sql = `SELECT em.id, em.title ,em.engineer_id
    //  FROM pincode_allocation AS pa
    //  LEFT JOIN awt_franchisemaster AS fm
    //         ON fm.licarecode = pa.account_manager
    //  LEFT JOIN awt_childfranchisemaster AS cfm
    //         ON cfm.licare_code = pa.owner
    //  LEFT JOIN awt_engineermaster AS em
    //         ON em.cfranchise_id =
    //            CASE
    //              WHEN pa.account_manager = pa.owner THEN RIGHT(pa.account_manager, LEN(pa.account_manager) - 2)
    //              ELSE  RIGHT(pa.owner, LEN(pa.owner) - 2)
    //            END
    //  WHERE  pa.pincode ='${pincode}' and pa.account_manager = '${msp}' and pa.owner ='${csp}'`;

    const newmasp = csp.replace(/^SP/, '').trim();



    const sql = `select * from awt_engineermaster where cfranchise_id = '${newmasp}' and deleted = 0 `
    console.log(sql)
    // Execute the query
    const result = await pool.request().query(sql);

    // Return the entire array of data
    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.get("/getProducts", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT * FROM awt_engineermaster
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the entire array of data
    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.get("/getchildfranchises", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT * FROM awt_childfranchisemaster
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the entire array of data
    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

//Complaint View End

// S added for Complaint Registration


app.get("/getstate",
  authenticateToken, async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT id, region_id, title FROM awt_geostate WHERE deleted = 0");
      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
  });


app.get("/product_master", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM product_master");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});



// Ticket Search Start
// app.post("/getticketendcustomer", authenticateToken, async (req, res) => {
//   let { searchparam } = req.body;

//   if (searchparam === "") {
//     return res.json([]);
//   }

//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;

//     //     const checkfromcustomer = `
//     // SELECT c.*,
//     //        l.address,
//     //        CONCAT(c.customer_fname, ' ', c.customer_lname) AS customer_name
//     // FROM awt_customer AS c
//     // LEFT JOIN awt_customerlocation AS l ON c.customer_id = l.customer_id
//     // WHERE c.deleted = 0
//     //   AND (c.email LIKE '%${searchparam}%'
//     //        OR c.mobileno LIKE '%${searchparam}%')
//     //     `;




//     const checkincomplaint = `select * from complaint_ticket where (customer_email LIKE '%${searchparam}%' OR ticket_no LIKE '%${searchparam}%' OR customer_name LIKE '%${searchparam}%' OR serial_no LIKE '%${searchparam}%' OR customer_mobile LIKE '%${searchparam}%' OR customer_id LIKE '%${searchparam}%')`

//     console.log(checkincomplaint)

//     const result = await pool.request().query(checkincomplaint);



//     const sql1 = `
//     SELECT * FROM awt_uniqueproductmaster
//     WHERE deleted = 0 AND CustomerID = @customerId
//   `;
//     // console.log(result.recordset[0])
//     const result1 = await pool.request()
//       .input('customerId', result.recordset[0].customer_id)
//       .query(sql1);

//     if (result1.recordset === 0) {

//       return res.json({ information: result.recordset, product: [] });
//     }
//     else {

//       return res.json({ information: result.recordset, product: result1.recordset });
//     }



//   } catch (err) {
//     console.error(err);
//     return res.json({ information: [], product: [] });
//   }
// });


app.post("/getticketendcustomer", authenticateToken, async (req, res) => {
  const { searchparam } = req.body;

  // Return empty array if searchparam is empty
  if (!searchparam) {
    return res.json([]);
  }

  try {
    const pool = await poolPromise;

    let information = [];
    let customerId = null;

    // First, check in complaints
    const checkInComplaint = `
      SELECT *
      FROM complaint_ticket
      WHERE customer_email LIKE @searchparam
         OR ticket_no LIKE @searchparam
         OR customer_name LIKE @searchparam
         OR serial_no LIKE @searchparam
         OR customer_mobile LIKE @searchparam
         OR customer_id LIKE @searchparam
    `;

    const complaintResult = await pool
      .request()
      .input("searchparam", `%${searchparam}%`)
      .query(checkInComplaint);

    information = complaintResult.recordset;

    // If data is found in complaints, set customerId
    if (information.length > 0) {
      customerId = information[0].customer_id;
    } else {
      // If no data in complaints, check in customers
      const checkFromCustomer = `
        SELECT c.*,
               l.address,
               CONCAT(c.customer_fname, ' ', c.customer_lname) AS customer_name
        FROM awt_customer AS c
        LEFT JOIN awt_customerlocation AS l ON c.customer_id = l.customer_id
        WHERE c.deleted = 0
          AND (c.email LIKE @searchparam OR c.mobileno LIKE @searchparam)
      `;

      const customerResult = await pool
        .request()
        .input("searchparam", `%${searchparam}%`)
        .query(checkFromCustomer);

      information = customerResult.recordset;

      // Set customerId from customers if data is available
      if (information.length > 0) {
        customerId = information[0].customer_id;
      }
    }

    let product = [];
    // Fetch product data only if customerId is available
    if (customerId) {
      const productQuery = `
        SELECT *
        FROM awt_uniqueproductmaster
        WHERE deleted = 0 AND CustomerID = @customerId
      `;

      const productResult = await pool
        .request()
        .input("customerId", customerId)
        .query(productQuery);

      product = productResult.recordset;
    }

    return res.json({ information, product });

  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({
      error: "Internal server error",
      information: [],
      product: [],
    });
  }
});






// Comaplint Module -> Start

// Add Complaint Start
app.post("/add_complaintt", authenticateToken, async (req, res) => {
  let {
    complaint_date, customer_name = "NA", contact_person, email, mobile, address,
    state, city, area, pincode, mode_of_contact, ticket_type, cust_type,
    warrenty_status, invoice_date, call_charge, cust_id, model, alt_mobile, serial, purchase_date, created_by, child_service_partner, master_service_partner, specification, additional_remarks
    , ticket_id, classification, priority, callType, requested_by, requested_email, requested_mobile, msp, csp, sales_partner, sales_partner2, salutation, mwhatsapp, awhatsapp
  } = req.body;









  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let t_type;

  if (ticket_type == 'BREAKDOWN') {
    t_type = 'B'
  }
  else if (ticket_type == 'DEMO') {
    t_type = 'D'

  } else if (ticket_type == 'INSTALLATION') {
    t_type = 'I'

  } else if (ticket_type == 'MAINTENANCE') {
    t_type = 'M'

  } else if (ticket_type == 'HELPDESK') {
    t_type = 'H'
  }
  else if (ticket_type == 'VISIT') {
    t_type = 'V'
  }


  try {
    const pool = await poolPromise;


    // Split customer_name into customer_fname and customer_lname


    const [customer_fname, ...customer_lnameArr] = customer_name.split(' ');
    const customer_lname = customer_lnameArr.join(' ');


    const getcustcount = `select top 1 id from awt_customer where customer_id is not null order by id desc`

    const getcustresult = await pool.request().query(getcustcount)

    const custcount = getcustresult.recordset[0].id;

    const newcustid = 'B' + custcount.toString().padStart(7, "0")







    if (ticket_id == '' && cust_id == '') {


      // Insert into awt_customer
      const customerSQL = `INSERT INTO awt_customer ( salutation,customer_id,customer_fname, customer_lname, email, mobileno, alt_mobileno, created_date, created_by)OUTPUT INSERTED.id VALUES ( @salutation, @customer_id,@customer_fname, @customer_lname, @email, @mobile, @alt_mobile, @formattedDate, @created_by)`;
      // Debugging log

      const customerResult = await pool.request()
        .input('customer_fname', customer_fname)
        .input('customer_id', newcustid)
        .input('customer_lname', customer_lname)
        .input('email', email)
        .input('mobile', mobile)
        .input('alt_mobile', alt_mobile)
        .input('salutation', salutation)
        .input('formattedDate', formattedDate)
        .input('created_by', created_by)
        .query(customerSQL);

      const insertedCustomerId = customerResult.recordset;

      console.log(insertedCustomerId, "insertedCustomerId")




    }



    // Insert into awt_uniqueproductmaster using insertedCustomerId as customer_id





    if (cust_id == "" && model != "") {



      const productSQL = `INSERT INTO awt_uniqueproductmaster (
        CustomerID, ModelNumber, serial_no,  pincode ,address,state,city,district ,purchase_date, created_date, created_by,customer_classification
      )
      VALUES (
        @customer_id, @model, @serial,  @pincode,@address,@state,@city,@area,@purchase_date,@formattedDate, @created_by,@customer_classification
      )`;



      const Unique = await pool.request()
        .input('customer_id', newcustid)
        .input('model', model)
        .input('created_by', created_by)
        .input('serial', serial)
        .input('purchase_date', purchase_date)
        .input('pincode', pincode)
        .input('formattedDate', formattedDate)
        .input('address', address)
        .input('area', area)
        .input('state', state)
        .input('city', city)
        .input('customer_classification', classification)
        .query(productSQL);
    }

    if (cust_id == "" ) {
      // Insert into awt_customerlocation using insertedCustomerId as customer_id
      const customerLocationSQL = `
        INSERT INTO awt_customerlocation (
      customer_id, geostate_id, geocity_id, district_id, pincode_id,
      created_date, created_by, ccperson, ccnumber, address , deleted
    )
    VALUES (
      @customer_id, @state, @city, @area, @pincode,
      @formattedDate, @created_by, @customer_name, @mobile, @address, @deleted
    )`;



      await pool.request()
        .input('customer_id', newcustid)
        .input('state', state)
        .input('city', city)
        .input('area', area)
        .input('created_by', created_by)
        .input('pincode', pincode)
        .input('formattedDate', formattedDate)
        .input('customer_name', customer_name)
        .input('mobile', mobile)
        .input('address', address)
        .input('deleted', '0')
        .query(customerLocationSQL);

    }









    const test = `SELECT Top 1 ticket_no
        FROM complaint_ticket
        WHERE ticket_no LIKE @ticketType + 'H' + '%'
          AND ticket_date >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AS DATE)
          AND ticket_date < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0) AS DATE)
        ORDER BY ticket_no Desc`





    // this is for generating ticket no
    const checkResult = await pool.request()
      .input('ticketType', sql.NVarChar, t_type)  // Define the parameter
      .query(`
        SELECT Top 1 ticket_no
        FROM complaint_ticket
        WHERE ticket_no LIKE @ticketType + 'H' + '%'
          AND ticket_date >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AS DATE)
          AND ticket_date < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0) AS DATE)
        ORDER BY ticket_no Desc;
      `);



    const count = checkResult.recordset[0] ? checkResult.recordset[0].ticket_no : 'H0000';







    // Accessing the last 4 digits from the result
    const lastFourDigits = count.slice(-4)

    const newcount = Number(lastFourDigits) + 1

    const formatDate = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
    const ticket_no = `${t_type}H${formatDate}-${newcount.toString().padStart(4, "0")}`;

    let complaintSQL

    if (!ticket_id) {
      complaintSQL = `
        INSERT INTO complaint_ticket (
          ticket_no, ticket_date, customer_name, customer_mobile, customer_email, address,
          state, city, area, pincode, customer_id, ModelNumber, ticket_type, call_type,
          call_status, warranty_status, invoice_date, call_charges, mode_of_contact,
          contact_person,  created_date, created_by,  purchase_date, serial_no, child_service_partner, sevice_partner, specification ,customer_class,call_priority,requested_mobile,requested_email,requested_by,msp,csp,sales_partner,sales_partner2,call_remark,salutation,alt_mobile,mwhatsapp,awhatsapp
        )
        VALUES (
          @ticket_no, @complaint_date, @customer_name, @mobile, @email, @address,
          @state, @city, @area, @pincode, @customer_id, @model, @ticket_type, @cust_type,
          'Open', @warranty_status, @invoice_date, @call_charge, @mode_of_contact,
          @contact_person,  @formattedDate, @created_by,  @purchase_date, @serial, @child_service_partner, @master_service_partner, @specification ,@classification , @priority ,@requested_mobile,@requested_email,@requested_by,@msp,@csp,@sales_partner,@sales_partner2,@call_remark,@salutation,@alt_mobile,@mwhatsapp,@awhatsapp
        )
      `;
    } else {
      complaintSQL = `
        UPDATE complaint_ticket
        SET
          ticket_no = @ticket_no,
          ticket_date = @complaint_date,
          customer_name = @customer_name,
          customer_mobile = @mobile,
          customer_email = @email,
          address = @address,
          state = @state,
          city = @city,
          area = @area,
          pincode = @pincode,
          customer_id = @customer_id,
          ModelNumber = @model,
          ticket_type = @ticket_type,
          call_type = @cust_type,
          call_status = 'Open',
          warranty_status = @warranty_status,
          invoice_date = @invoice_date,
          call_charges = @call_charge,
          mode_of_contact = @mode_of_contact,
          contact_person = @contact_person,
          created_date = @formattedDate,
          created_by = @created_by,
          purchase_date = @purchase_date,
          serial_no = @serial,
          child_service_partner = @child_service_partner,
          sevice_partner = @master_service_partner,
          specification = @specification,
          call_remark = @call_remark,
          customer_class = @classification,
          call_priority = @priority,
          requested_mobile = @requested_mobile,
          requested_email = @requested_email,
          requested_by = @requested_by,
          sales_partner = @sales_partner,
          sales_partner2 = @sales_partner2,
          salutation = @salutation,
          alt_mobile = @alt_mobile,
          mwhatsapp = @mwhatsapp,
          awhatsapp = @awhatsapp
          WHERE
          id = @ticket_id
      `;
    }




    const resutlt = await pool.request()
      .input('ticket_no', ticket_no)
      .input('ticket_id', ticket_id)
      .input('complaint_date', complaint_date)
      .input('customer_name', customer_name)
      .input('mobile', mobile)
      .input('email', email)
      .input('address', address)
      .input('state', state)
      .input('created_by', created_by)
      .input('city', city)
      .input('area', area)
      .input('pincode', pincode)
      .input('customer_id', cust_id == '' ? newcustid : cust_id)
      .input('model', model)
      .input('ticket_type', ticket_type)
      .input('cust_type', cust_type)
      .input('warranty_status', sql.NVarChar, warrenty_status || "WARRANTY")
      .input('invoice_date', invoice_date)
      .input('call_charge', call_charge)
      .input('mode_of_contact', mode_of_contact)
      .input('contact_person', contact_person)
      .input('formattedDate', formattedDate)
      .input('purchase_date', purchase_date)
      .input('serial', serial)
      .input('master_service_partner', master_service_partner)
      .input('child_service_partner', child_service_partner)
      .input('specification', specification)
      .input('call_remark', additional_remarks)
      .input('classification', classification)
      .input('priority', priority)
      .input('requested_by', requested_by)
      .input('requested_email', requested_email)
      .input('requested_mobile', requested_mobile)
      .input('msp', msp)
      .input('csp', csp)
      .input('sales_partner', sales_partner)
      .input('sales_partner2', sales_partner2)
      .input('salutation', salutation)
      .input('alt_mobile', alt_mobile)
      .input('awhatsapp', awhatsapp)
      .input('mwhatsapp', mwhatsapp)
      .query(complaintSQL);



    if (additional_remarks) {
      //Remark insert query
      const reamrks = `
    INSERT INTO awt_complaintremark (
        ticket_no, remark, created_date, created_by
    )
    VALUES (
        @ticket_no, @additional_remarks, @formattedDate, @created_by
    )`;


      await pool.request()
        .input('ticket_no', ticket_no) // Use existing ticket_no from earlier query
        .input('formattedDate', formattedDate) // Use current timestamp
        .input('created_by', created_by) // Use current user ID
        .input('additional_remarks', additional_remarks) // Use current user ID
        .query(reamrks);

    }



    if (specification) {
      const faultreamrks = `
      INSERT INTO awt_complaintremark (
          ticket_no, remark, created_date, created_by
      )
      VALUES (
          @ticket_no, @additional_remarks, @formattedDate, @created_by
      )`;


      await pool.request()
        .input('ticket_no', ticket_no) // Use existing ticket_no from earlier query
        .input('formattedDate', formattedDate) // Use current timestamp
        .input('created_by', created_by) // Use current user ID
        .input('additional_remarks', specification) // Use current user ID
        .query(faultreamrks);
    }
    //Fault Description *************




    return res.json({ message: 'Complaint added successfully!', ticket_no, cust_id });
  } catch (err) {
    console.error("Error inserting complaint:", err.stack);
    return res.status(500).json({ error: 'An error occurred while adding the complaint', details: err.message });
  }
});


app.post("/u_complaint", authenticateToken, async (req, res) => {
  let {
    customer_name, contact_person, email, mobile, address,
    state, city, area, pincode, mode_of_contact, cust_type,
    warrenty_status, invoice_date, call_charge, cust_id, model, alt_mobile, serial, purchase_date, created_by, child_service_partner, master_service_partner, specification, additional_remarks, ticket_no, classification, priority, requested_by, requested_email, requested_mobile, sales_partner2, salutation, mwhatsapp, awhatsapp
  } = req.body;







  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  try {
    const pool = await poolPromise;



    const complaintSQL = `
UPDATE complaint_ticket
SET
  customer_name = @customer_name,
  customer_mobile = @mobile,
  customer_email = @email,
  address = @address,
  state = @state,
  city = @city,
  area = @area,
  pincode = @pincode,
  customer_id = @customer_id,
  ModelNumber = @model,
  call_type = @cust_type,
  call_status = 'Pending',
  warranty_status = @warranty_status,
  invoice_date = @invoice_date,
  call_charges = @call_charge,
  mode_of_contact = @mode_of_contact,
  contact_person = @contact_person,
  created_date = @formattedDate,
  created_by = @created_by,
  purchase_date = @purchase_date,
  serial_no = @serial,
  child_service_partner = @child_service_partner,
  sevice_partner = @master_service_partner,
  specification = @specification,
  call_remark = @call_remark,
  customer_class = @classification,
  call_priority = @priority,
  requested_by = @requested_by,
  requested_mobile = @requested_mobile,
  requested_email = @requested_email,
  sales_partner2 = @sales_partner2,
  salutation = @salutation,
  alt_mobile = @alt_mobile,
  mwhatsapp = @mwhatsapp,
  awhatsapp = @awhatsapp
  WHERE
  ticket_no = @ticket_no
`;



    // Debugging log

    await pool.request()
      .input('ticket_no', ticket_no)
      .input('customer_name', customer_name)
      .input('mobile', mobile)
      .input('email', email)
      .input('address', address)
      .input('state', state)
      .input('created_by', created_by)
      .input('city', city)
      .input('area', area)
      .input('pincode', pincode)
      .input('customer_id', cust_id)
      .input('model', model)
      .input('cust_type', cust_type)
      .input("warranty_status", sql.NVarChar, warrenty_status || "WARRANTY")
      .input('invoice_date', invoice_date)
      .input('call_charge', call_charge)
      .input('mode_of_contact', mode_of_contact)
      .input('contact_person', contact_person)
      .input('formattedDate', formattedDate)
      .input('purchase_date', purchase_date)
      .input('serial', serial)
      .input('master_service_partner', master_service_partner)
      .input('child_service_partner', child_service_partner)
      .input('specification', specification)
      .input('call_remark', additional_remarks)
      .input('classification', classification)
      .input('priority', priority)
      .input('requested_by', requested_by)
      .input('requested_email', requested_email)
      .input('requested_mobile', requested_mobile)
      .input('sales_partner2', sales_partner2)
      .input('salutation', salutation)
      .input('alt_mobile', alt_mobile)
      .input('mwhatsapp', mwhatsapp)
      .input('awhatsapp', awhatsapp)
      .query(complaintSQL);

    //Remark insert query
    const reamrks = `
  INSERT INTO awt_complaintremark (
      ticket_no, remark, created_date, created_by
  )
  VALUES (
      @ticket_no, @additional_remarks, @formattedDate, @created_by
  )`;


    await pool.request()
      .input('ticket_no', ticket_no) // Use existing ticket_no from earlier query
      .input('formattedDate', formattedDate) // Use current timestamp
      .input('created_by', created_by) // Use current user ID
      .input('additional_remarks', additional_remarks) // Use current user ID
      .query(reamrks);

    return res.json({ message: 'Complaint Updated successfully!' });
  } catch (err) {
    console.error("Error inserting complaint:", err.stack);
    return res.json(err)
    // return res.status(500).json({ error: 'An error occurred while adding the complaint', details: err.message });
  }
});


//Master Service Partner
app.get("/getmasterlist/:masterid", authenticateToken, async (req, res) => {
  const { masterid } = req.params;
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const sql = `SELECT m.*,c.title as country_name, r.title as region_name, s. title as state_name, d.title as district_name,ct. title city_name from  awt_franchisemaster as m,
awt_country as c,awt_region as r,awt_geostate as s,awt_district as d,awt_geocity as ct WHERE m.country_id = c.id AND m.region_id = r.id AND m.geostate_id = s.id
AND m.area_id = d.id AND m.geocity_id = ct.id AND m.deleted =	0 AND m.id = ${masterid}`;
    const result = await pool.request().query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Master not found" });
    }

    // Return the first result
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});



//Child Service Partner

app.get("/getchildpartner/:MasterId", authenticateToken, async (req, res) => {
  try {
    const MasterId = req.params.MasterId; // Get MasterId from route parameters
    console.log("MasterId received:", MasterId); // Log the MasterId for debugging

    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to fetch child partners filtered by MasterId
    const result = await pool
      .request()
      .input('MasterId', sql.Int, MasterId) // Use parameterized queries to prevent SQL injection
      .query("SELECT * FROM awt_childfranchisemaster WHERE deleted = 0 AND pfranchise_id = @MasterId");

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching child partners:", err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});




// S End for Complaint Module


// y start
//Grouping Master Start

app.get("/getchildfranchisegroupm", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool (or you can use another pool initialization if needed)
    const pool = await poolPromise;
    // Perform the query
    const result = await pool.request().query("SELECT * FROM awt_childfranchisemaster WHERE deleted = 0");
    return res.json(result.recordset);  // Send the query result as JSON
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.get("/getgroupmengineer/:cfranchise_id", authenticateToken, async (req, res) => {
  const { cfranchise_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Create the query using string interpolation (be careful to sanitize the input to avoid SQL injection)
    const sql = `SELECT * FROM awt_engineermaster WHERE cfranchise_id = ${pool.request().literal(cfranchise_id)} AND deleted = 0`;

    // Perform the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
//Group Master End



//Customer Master Start
app.get("/getcustomer", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Create the query (no parameter binding)
    const sql = `SELECT * FROM awt_customer WHERE deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the first record or an appropriate message if no records are found
    if (result.recordset.length > 0) {
      return res.status(202).json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Customer not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
app.post("/deletecustomer", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Create the SQL query with string interpolation (no parameter binding)
    const sql = `UPDATE awt_customer SET deleted = 1 WHERE id = '${id}'`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if any rows were affected
    if (result.rowsAffected[0] > 0) {
      return res.json({ message: "Customer deleted successfully" });
    } else {
      return res.status(404).json({ message: "Customer not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
app.get("/requestcustomer", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `SELECT * FROM awt_customer WHERE deleted = 0 AND id = ${id}`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if data was found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Return the first result
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
app.post("/postcustomer", authenticateToken, async (req, res) => {
  const {
    customer_fname,
    customer_type,
    customer_classification,
    mobileno,
    alt_mobileno,
    dateofbirth,
    anniversary_date,
    email,
    salutation,
    customer_id
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Step 1: Check for duplicates using parameterized query
    const checkDuplicateSql = `
      SELECT * FROM awt_customer
      WHERE customer_id = @customer_id
      AND deleted = 0
    `;
    const checkDuplicateResult = await pool.request()
      .input('customer_id', customer_id)
      .query(checkDuplicateSql);

    // If a duplicate customer is found
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with the same Customer_id already exists!"
      });
    }

    const getcustcount = `select top 1 id from awt_customer where customer_id is not null order by id desc`

    const getcustresult = await pool.request().query(getcustcount)

    const custcount = getcustresult.recordset[0].id;

    const newcustid = 'B' + custcount.toString().padStart(7, "0")

    console.log(newcustid, "$$$")

    // Step 2: Insert the customer if no duplicate is found
    const insertSql = `
      INSERT INTO awt_customer (
        customer_fname,
        customer_type,
        customer_classification,
        mobileno,
        alt_mobileno,
        dateofbirth,
        anniversary_date,
        email,
        salutation,
        customer_id
      ) VALUES (
        @customer_fname,
        @customer_type,
        @customer_classification,
        @mobileno,
        @alt_mobileno,
        @dateofbirth,
        @anniversary_date,
        @email,
        @salutation,
        @customer_id
      )
    `;

    // Execute the insert query
    await pool.request()
      .input('customer_fname', customer_fname)
      .input('customer_type', customer_type)
      .input('customer_classification', customer_classification)
      .input('mobileno', mobileno)
      .input('alt_mobileno', alt_mobileno)
      .input('dateofbirth', dateofbirth)
      .input('anniversary_date', anniversary_date)
      .input('email', email)
      .input('salutation', salutation)
      .input('customer_id', newcustid)
      .query(insertSql);

    // Send success response
    return res.status(201).json({
      message: "Customer master added successfully",
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json(err);
  }
});



// customer put

app.post("/putcustomer", authenticateToken, async (req, res) => {
  const { id, customer_fname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email, salutation, customer_id, created_by } = req.body;


  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;






    // Step 2: Update Query
    const updateSQL = `
     UPDATE awt_customer
     SET
       customer_fname = @customer_fname,
       email = @email,
       mobileno = @mobileno,
       customer_type = @customer_type,
       customer_classification = @customer_classification,
       alt_mobileno = @alt_mobileno,
       dateofbirth = @dateofbirth,
       anniversary_date = @anniversary_date,
       salutation = @salutation,
       customer_id = @customer_id,
       updated_by = @created_by
     WHERE id = @id
   `;
    console.log("Executing Update SQL:", updateSQL);

    await pool.request()
      .input('customer_fname', customer_fname)
      .input('customer_type', customer_type)
      .input('customer_classification', customer_classification)
      .input('email', email)
      .input('mobileno', mobileno)
      .input('alt_mobileno', alt_mobileno)
      .input('dateofbirth', dateofbirth)
      .input('anniversary_date', anniversary_date)
      .input('salutation', salutation)
      .input('customer_id', customer_id)
      .input('created_by', created_by)
      .input('id', id)
      .query(updateSQL);

    return res.json({
      message: "Customer updated successfully!"
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the Franchise Master' });
  }
});

//Customer Location Start
app.get("/getareadrop/:geocity_id", authenticateToken, async (req, res) => {
  const { geocity_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `SELECT * FROM awt_area WHERE geocity_id = ${geocity_id} AND deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the data
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.get("/getpincodedrop/:area_id", authenticateToken, async (req, res) => {
  const { area_id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `SELECT * FROM awt_pincode WHERE area_id = ${area_id} AND deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// API to fetch all Customer Location
app.get("/getcustomerlocation/:customer_id", authenticateToken, async (req, res) => {
  const { customer_id } = req.params;
  try {
    const pool = await poolPromise;



    // Use parameterized query to avoid SQL injection and ensure valid input
    const sql = `
      SELECT * FROM awt_customerlocation WHERE customer_id = '${customer_id}' AND deleted = 0;
    `;

    console.log(sql)


    const result = await pool
      .request()
      .input("customer_id", customer_id)  // Binding the parameter
      .query(sql);

    console.log(result)
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


// API to fetch a specific Customer Location by ID
app.get("/requestcustomerlocation/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;



  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `SELECT * FROM awt_customerlocation WHERE id = '${id}' AND deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // If no data is found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Customer Location not found" });
    }

    // Return the first result as customer location
    return res.status(200).json(result.recordset[0]);

  } catch (err) {
    console.error("Error fetching Customer Location:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// delete customer location
app.post("/deletecustomerlocation", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Create the SQL query with string interpolation (no parameter binding)
    const sql = `UPDATE awt_customerlocation SET deleted = 1 WHERE id = '${id}'`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if any rows were affected
    if (result.rowsAffected[0] > 0) {
      return res.json({ message: "Customer deleted successfully" });
    } else {
      return res.status(404).json({ message: "Customer not found" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// Insert new Customer Location with duplicate check
app.post("/postcustomerlocation", authenticateToken, async (req, res) => {
  const { customer_id, country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const checkCustomerSql = `
    SELECT customer_id FROM awt_customer
    WHERE customer_id = '${customer_id}' AND deleted = 0
  `;

    const customerResult = await pool.request().query(checkCustomerSql);

    // if (customerResult.recordset.length === 0) {
    //   return res.status(404).json({
    //     message: "Customer not found in awt_customer table!"
    //   });
    // }

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccperson = '${ccperson}' AND address = '${address}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_customerlocation (customer_id ,country_id, region_id, geostate_id, geocity_id, district_id, pincode_id, address, ccperson, ccnumber, address_type,deleted)
                         VALUES ('${customer_id}','${country_id}', '${region_id}', '${geostate_id}', '${geocity_id}', '${area_id}', '${pincode_id}', '${address}', '${ccperson}', '${ccnumber}', '${address_type}',0)`;

      await pool.request().query(insertSql);

      return res.json({ message: "Customer Location added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while adding the customer location' });
  }
});

// Update existing Customer Location with duplicate check
app.post("/putcustomerlocation", authenticateToken, async (req, res) => {
  const {
    country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type, id
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccperson = '${ccperson}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const updateSql = `UPDATE awt_customerlocation SET country_id = '${country_id}', region_id = '${region_id}', geostate_id = '${geostate_id}', geocity_id = '${geocity_id}', district_id = '${area_id}', pincode_id = '${pincode_id}', address = '${address}', ccperson = '${ccperson}', ccnumber = '${ccnumber}', address_type = '${address_type}',deleted = 0 WHERE id = '${id}'`;

      await pool.request().query(updateSql);

      return res.json({ message: "Customer Location updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the customer location' });
  }
});

// API to soft delete a Customer Location
app.post("/deletepincode", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to update the deleted field to 1
    const sql = `UPDATE awt_customerlocation SET deleted = 1 WHERE id = '${id}'`;

    // Execute the SQL query
    await pool.request().query(sql);

    return res.json({ message: "Customer Location deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting Customer Location" });
  }
});

//Unique Product Master Linked to Location Start
app.get("/getproductunique/:customer_id", authenticateToken, async (req, res) => {
  const { customer_id } = req.params;
  try {
    const pool = await poolPromise;
    const sql = `SELECT * FROM awt_uniqueproductmaster WHERE CustomerID = '${customer_id}' AND deleted = 0`;
    const result = await pool.request().query(sql);
    console.log("Sql", sql)
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


app.get("/requestproductunique/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the database
    const sql = `SELECT * FROM awt_uniqueproductmaster WHERE id = '${id}' AND deleted = 0`;

    // Execute the SQL query
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.post("/postproductunique", authenticateToken, async (req, res) => {
  const { product, location, date, serialnumber, CustomerID, CustomerName } = req.body;
  try {

    const pool = await poolPromise;
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE CustomerID = '${CustomerID}'AND address = '${location}'AND ModelNumber = '${product}'AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);
    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with same customer Id and Location already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_uniqueproductmaster (ModelNumber, address, purchase_date, serial_no,CustomerName,CustomerID)
                        VALUES ('${product}', '${location}', '${date}', '${serialnumber}', '${CustomerName}', '${CustomerID}')`;
      await pool.request().query(insertSql);
      return res.json({ message: "Product added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

app.post("/putproductunique", authenticateToken, async (req, res) => {
  const { product, id, location, date, serialnumber } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates (excluding the current product) customer_ id will be add
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = '${serialnumber}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with same customer Id and Location already exists!",
      });
    } else {
      // Update the product if no duplicates are found
      const updateSql = `UPDATE awt_uniqueproductmaster SET product = '${product}', location = '${location}', date = '${date}', serialnumber = '${serialnumber}' WHERE id = '${id}'`;

      await pool.request().query(updateSql);

      return res.json({ message: "Product updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the product' });
  }
});

app.post("/deleteproductunique", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to mark the product as deleted
    const sql = `UPDATE awt_uniqueproductmaster SET deleted = 1 WHERE id = '${id}'`;

    // Execute the SQL query
    await pool.request().query(sql);

    return res.json({ message: "Product deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error deleting product" });
  }
});

app.get('/fetchcustomerlocationByCustomerid/:customer_id', authenticateToken, async (req, res) => {
  const { customer_id } = req.params;

  console.log(customer_id, "customer_id")
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT cl.*,c.customer_fname as customername from awt_customerlocation cl LEFT JOIN awt_customer c on c.customer_id = cl.customer_id WHERE cl.customer_id = '${customer_id}' AND cl.deleted = 0`;
    console.log(sql)
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});
//Unique Product Master Linked to Location End

//Start Engineer Master
app.get("/getchildfranchise/:mfranchise_id",
  authenticateToken, async (req, res) => {

    const { mfranchise_id } = req.params;
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch data from the database
      const sql = `SELECT * FROM awt_childfranchisemaster WHERE pfranchise_id = ${mfranchise_id} AND deleted = 0`;

      // Execute the SQL query
      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
  });
app.get("/getengineer", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      title,
      employee_code,
      mobile_no,
      email,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    // SQL query to fetch data with INNER JOIN
    let sql = `
        SELECT r.*, c.title AS childfranchise_title
        FROM awt_engineermaster r
        INNER JOIN awt_childfranchisemaster c 
        ON r.cfranchise_id = RIGHT(c.licare_code, LEN(c.licare_code) - 2)
        WHERE r.deleted = 0
      `;

    if (title) {
      sql += ` AND r.title LIKE '%${title}%'`;
    }
    if (employee_code) {
      sql += ` AND r.engineer_id LIKE '%${employee_code}%'`;
    }
    if (mobile_no) {
      sql += ` AND r.mobile_no LIKE '%${mobile_no}%'`;
    }
    if (email) {
      sql += ` AND r.email LIKE '%${email}%'`;
    }

    // Pagination logic
    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY r.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute the main SQL query
    const result = await pool.request().query(sql);

    // SQL query to get the total count
    let countSql = `
        SELECT COUNT(*) AS totalCount
        FROM awt_engineermaster r
        INNER JOIN awt_childfranchisemaster c 
        ON r.cfranchise_id = RIGHT(c.licare_code, LEN(c.licare_code) - 2)
        WHERE r.deleted = 0
      `;
    if (title) {
      countSql += ` AND r.title LIKE '%${title}%'`;
    }
    if (employee_code) {
      countSql += ` AND r.engineer_id LIKE '%${employee_code}%'`;
    }
    if (mobile_no) {
      countSql += ` AND r.mobile_no LIKE '%${mobile_no}%'`;
    }
    if (email) {
      countSql += ` AND r.email LIKE '%${email}%'`;
    }

    // Execute the count query
    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;

    return res.json({
      data: result.recordset,
      totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Error fetching engineer data:", err);
    return res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


app.get("/requestengineer/:id", authenticateToken,
  authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch data from the database with the specified ID
      const sql = `SELECT * FROM awt_engineermaster WHERE id = '${id}' AND deleted = 0`;

      // Execute the SQL query
      const result = await pool.request().query(sql);

      if (result.recordset.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.status(404).json({ message: "Engineer not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching the engineer' });
    }
  });
app.post("/postengineer",
  authenticateToken, async (req, res) => {
    const { title, mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, employee_code, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address } = req.body;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // Check for duplicates using direct query injection
      const checkDuplicateSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = '${mobile_no}' AND email = '${email}' AND deleted = 0`;
      const duplicateResult = await pool.request().query(checkDuplicateSql);

      if (duplicateResult.recordset.length > 0) {
        return res.status(409).json({
          message: "Duplicate entry, Email and mobile_no credentials already exist!",
        });
      } else {
        // Check for soft deleted data
        const checkSoftDeletedSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = '${mobile_no}' AND email = '${email}' AND deleted = 1`;
        const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedResult.recordset.length > 0) {
          const restoreSoftDeletedSql = `UPDATE awt_engineermaster SET deleted = 0 WHERE mobile_no = '${mobile_no}' AND email = '${email}'`;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({
            message: "Soft-deleted Engineer Master restored successfully!",
          });
        } else {
          // Insert new engineer if no duplicate or soft-deleted found
          const insertSql = `INSERT INTO awt_engineermaster (title,mfranchise_id, cfranchise_id, mobile_no, email, password,employee_code,personal_email,personal_mobile,dob,blood_group,academic_qualification,joining_date,passport_picture,resume,photo_proof,address_proof,permanent_address,current_address)
                           VALUES ('${title}','${mfranchise_id}', '${cfranchise_id}', '${mobile_no}', '${email}', '${password}', '${employee_code}', '${personal_email}', '${personal_mobile}', '${dob}', '${blood_group}', '${academic_qualification}', '${joining_date}', '${passport_picture}', '${resume}', '${photo_proof}', '${address_proof}', '${permanent_address}', '${current_address}')`;
          await pool.request().query(insertSql);
          return res.json({ message: "Engineer added successfully!" });
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "An error occurred while adding the engineer" });
    }
  });
app.post("/putengineer", authenticateToken, async (req, res) => {
  const { title, mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, employee_code, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address, id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates using direct query injection
    const checkDuplicateSql = `SELECT * FROM awt_engineermaster WHERE mobile_no = '${mobile_no}' AND email = '${email}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Email and mobile_no credentials already exist!",
      });
    } else {
      // Update the engineer record if no duplicates are found
      const updateSql = `UPDATE awt_engineermaster
                         SET title = '${title}',mfranchise_id = '${mfranchise_id}', cfranchise_id = '${cfranchise_id}', mobile_no = '${mobile_no}', email = '${email}', password = '${password}',
                         personal_email = '${personal_email}', employee_code = '${employee_code}', personal_mobile = '${personal_mobile}', dob = '${dob}',
                         blood_group = '${blood_group}', academic_qualification = '${academic_qualification}', joining_date = '${joining_date}', passport_picture = '${passport_picture}',
                         resume = '${resume}', photo_proof = '${photo_proof}', address_proof = '${address_proof}', permanent_address = '${permanent_address}', current_address = '${current_address}'
                         WHERE id = '${id}'`;

      await pool.request().query(updateSql);
      return res.json({ message: "Engineer updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating the engineer" });
  }
});

app.post("/deleteengineer", authenticateToken,
  authenticateToken, async (req, res) => {
    const { id } = req.body;

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // Directly inject `id` into the SQL query (no parameter binding)
      const sql = `UPDATE awt_engineermaster SET deleted = 1 WHERE id = '${id}'`;

      // Execute the SQL query
      await pool.request().query(sql);

      return res.json({ message: "Engineer deleted successfully!" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating Engineer" });
    }
  });



app.get("/getengineerpopulate/:engineerid", authenticateToken, async (req, res) => {
  const { engineerid } = req.params;


  console.log(engineerid, "%%%")

  if (engineerid != "undefined") {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch data from the master list, customize based on your needs
      const sql = `
    SELECT m.* FROM awt_engineermaster m
    WHERE m.deleted = 0 and m.id = '${engineerid}'
      `;
      // Execute the SQL query
      const result = await pool.request().query(sql);

      // Return the result as JSON
      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }
  }


});



// End Engineer Master

app.get("/getmasterfranchiselist", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      title,
      licarecode,
      partner_name,
      mobile_no,
      email,
      country_name,
      region_name,
      state_name,
      district_name,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    // Modified SQL query with explicit JOIN conditions
    let sql = `
      SELECT m.*,
        c.title as country_name,
        r.title as region_name,
        s.title as state_name,
        d.title as district_name,
        ct.title as city_name
      FROM awt_franchisemaster m
      LEFT JOIN awt_country c ON m.country_id = CAST(c.id AS VARCHAR)
      LEFT JOIN awt_region r ON m.region_id = CAST(r.id AS VARCHAR)
      LEFT JOIN awt_geostate s ON m.geostate_id = CAST(s.id AS VARCHAR)
      LEFT JOIN awt_district d ON m.area_id = CAST(d.id AS VARCHAR)
      LEFT JOIN awt_geocity ct ON m.geocity_id = CAST(ct.id AS VARCHAR)
      WHERE m.deleted = 0
    `;

    if (title) {
      sql += ` AND m.title LIKE '%${title}%'`;
    }

    if (licarecode) {
      sql += ` AND m.licarecode LIKE '%${licarecode}%'`;
    }

    if (mobile_no) {
      sql += ` AND m.mobile_no LIKE '%${mobile_no}%'`;
    }

    if (email) {
      sql += ` AND m.email LIKE '%${email}%'`;
    }

    if (partner_name) {
      sql += ` AND m.partner_name LIKE '%${partner_name}%'`;
    }
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY m.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_franchisemaster WHERE deleted = 0`;
    if (title) countSql += ` AND title LIKE '%${title}%'`;
    if (licarecode) countSql += ` AND licarecode LIKE '%${licarecode}%'`;
    if (mobile_no) countSql += ` AND mobile_no LIKE '%${mobile_no}%'`;
    if (email) countSql += ` AND email LIKE '%${email}%'`;
    if (partner_name) countSql += ` AND partner_name LIKE '%${partner_name}%'`;
    if (country_name) countSql += ` AND country_id LIKE '%${country_name}%'`;
    if (region_name) countSql += ` AND region_id LIKE '%${region_name}%'`;
    if (state_name) countSql += ` AND state_id LIKE '%${state_name}%'`;
    if (district_name) countSql += ` AND district_id LIKE '%${district_name}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


// Start Franchise Master - Parent
app.get("/getfranchisedata", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM awt_franchisemaster WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err); return res.status(500).json({ error: 'An error occurred while fetching franchise data' });
  }
});
app.get("/requestfranchisedata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM awt_franchisemaster WHERE id = ${id} AND deleted = 0`);
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching franchise data' });
  }
});


app.post("/postfranchisedata", authenticateToken, async (req, res) => {
  const {
    title, contact_person, email, mobile_no, password, address, country_id, region_id, state, area, city,
    pincode_id, website, gst_no, panno, bank_name, bank_acc, bank_ifsc, bank_address, with_liebherr,
    lastworkindate, contract_acti, contract_expir, licarecode, partner_name
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicate entries in awt_franchisemaster
    const checkDuplicateResult = await pool.request()
      .input('title', sql.VarChar, title)  // Parameterized query
      .query(`
        SELECT * FROM awt_franchisemaster WHERE title = @title AND deleted = 0
      `);



    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Franchise Master already exists!",
      });
    }

    // Check for soft deleted entries
    const checkSoftDeletedResult = await pool.request()
      .input('title', sql.VarChar, title)  // Parameterized query
      .query(`
        SELECT * FROM awt_franchisemaster WHERE title = @title AND deleted = 1
      `);


    if (checkSoftDeletedResult.recordset.length > 0) {
      // Restore soft deleted record
      await pool.request()
        .input('title', sql.VarChar, title)  // Parameterized query
        .query(`
          UPDATE awt_franchisemaster SET deleted = 0 WHERE title = @title
        `);

      return res.json({
        message: "Soft-deleted Franchise Master restored successfully!",
      });
    } else {
      // Insert new record using parameterized query
      await pool.request()
        .input('title', sql.VarChar, title)
        .input('licarecode', sql.VarChar, licarecode)
        .input('partner_name', sql.VarChar, partner_name)
        .input('contact_person', sql.VarChar, contact_person)
        .input('email', sql.VarChar, email)
        .input('mobile_no', sql.VarChar, mobile_no)
        .input('password', sql.VarChar, password)
        .input('address', sql.VarChar, address)
        .input('country_id', sql.VarChar, country_id)
        .input('region_id', sql.VarChar, region_id)
        .input('state', sql.VarChar, state)
        .input('area', sql.VarChar, area)
        .input('city', sql.VarChar, city)
        .input('pincode_id', sql.VarChar, pincode_id)
        .input('website', sql.VarChar, website)
        .input('gst_no', sql.VarChar, gst_no)
        .input('panno', sql.VarChar, panno)
        .input('bank_name', sql.VarChar, bank_name)
        .input('bank_acc', sql.VarChar, bank_acc)
        .input('bank_ifsc', sql.VarChar, bank_ifsc)
        .input('bank_address', sql.VarChar, bank_address)
        .input('with_liebherr', sql.Bit, with_liebherr)
        .input('lastworkindate', sql.DateTime, lastworkindate)
        .input('contract_acti', sql.DateTime, contract_acti)
        .input('contract_expir', sql.DateTime, contract_expir)
        .query(`
          INSERT INTO awt_franchisemaster
          (title, licarecode, partner_name, contact_person, email, mobile_no, password, address, country_id, region_id, geostate_id,
           area_id, geocity_id, pincode_id, webste, gstno, panno, bankname, bankacc, bankifsc, bankaddress, withliebher,
           lastworkinddate, contractacti, contractexpir)
          VALUES
          (@title, @licarecode, @partner_name, @contact_person, @email, @mobile_no, @password, @address, @country_id,
           @region_id, @state, @area, @city, @pincode_id, @website, @gst_no, @panno, @bank_name, @bank_acc, @bank_ifsc,
           @bank_address, @with_liebherr, @lastworkindate, @contract_acti, @contract_expir)
        `);


      return res.json({
        message: "Franchise Master added successfully!",
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});



app.post("/putfranchisedata", authenticateToken, async (req, res) => {
  const { title, id, contact_person, email, mobile_no, password, address, country_id, region_id, state, area, city, pincode_id,
    website, gst_no, panno, bank_name, bank_acc, bank_ifsc, bank_address, withliebher, lastworkindate, contract_acti, contract_expir, licarecode
    , partner_name, created_by
  } = req.body;


  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;


    // Step 1: Duplicate Check Query
    const duplicateCheckSQL = `
      SELECT * FROM awt_franchisemaster
      WHERE email = @email
      AND deleted = 0
      AND id != @id
    `;

    console.log("Executing Duplicate Check SQL:", duplicateCheckSQL);

    const duplicateCheckResult = await pool.request()
      .input('email', email)
      .input('id', id)
      .query(duplicateCheckSQL);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry,  Franchise Master already exists!"
      });
    }

    // Step 2: Update Query
    const updateSQL = `
     UPDATE awt_franchisemaster
     SET
       title = @title,
       licarecode = @licarecode,
       partner_name = @partner_name,
       contact_person = @contact_person,
       email = @email,
       mobile_no = @mobile_no,
       password = @password,
       address = @address,
       country_id = @country_id,
       region_id = @region_id,
       geostate_id = @state,
       area_id = @area,
       geocity_id = @city,
       pincode_id = @pincode_id,
       webste = @website,
       gstno = @gst_no,
       panno = @panno,
       bankname = @bank_name,
       bankacc = @bank_acc,
       bankifsc = @bank_ifsc,
       bankaddress = @bank_address,
       withliebher = @withliebher,
       lastworkinddate = @lastworkindate,
       contractacti = @contract_acti,
       contractexpir = @contract_expir,
       updated_by = @created_by
     WHERE id = @id
   `;
    console.log("Executing Update SQL:", updateSQL);

    await pool.request()
      .input('title', title)
      .input('licarecode', licarecode)
      .input('partner_name', partner_name)
      .input('contact_person', contact_person)
      .input('email', email)
      .input('mobile_no', mobile_no)
      .input('password', password)
      .input('address', address)
      .input('country_id', country_id)
      .input('region_id', region_id)
      .input('state', state)
      .input('area', area)
      .input('city', city)
      .input('pincode_id', pincode_id)
      .input('website', website)
      .input('gst_no', gst_no)
      .input('panno', panno)
      .input('bank_name', bank_name)
      .input('bank_acc', bank_acc)
      .input('bank_ifsc', bank_ifsc)
      .input('bank_address', bank_address)
      .input('withliebher', withliebher)
      .input('lastworkindate', lastworkindate)
      .input('contract_acti', contract_acti)
      .input('contract_expir', contract_expir)
      .input('created_by', created_by)
      .input('id', id)
      .query(updateSQL);

    return res.json({
      message: "Master Franchise updated successfully!"
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the Franchise Master' });
  }
});
app.post("/deletefranchisedata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Perform the update to mark the franchise as deleted
    const result = await pool.request().query(`UPDATE awt_franchisemaster SET deleted = 1 WHERE id = '${id}'`);

    return res.json(result.recordset);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Franchise Master" });
  }
});


//Start Child Franchise Master
app.get("/getparentfranchise", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject the query string without parameters
    const sql = "SELECT * FROM awt_franchisemaster WHERE deleted = 0";

    // Execute the SQL query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching parent franchise data" });
  }
});

// app
//.get("/getchildFranchiseDetails", async (req, res) => {
//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;

//     // SQL query to fetch data from the master list, customize based on your needs
//     const sql = `
//     SELECT m.*,p.title as parentfranchisetitle,c.title as country_name, r.title as region_name, s. title as state_name, d.title as district_name,ct. title city_name from  awt_childfranchisemaster as m,
//     awt_country as c,awt_region as r,awt_geostate as s,awt_district as d,awt_geocity as ct,awt_franchisemaster as p WHERE m.country_id = c.id AND m.region_id = r.id AND m.geostate_id = s.id
//     AND m.area_id = d.id AND m.geocity_id = ct.id AND m.pfranchise_id = p.licarecode AND m.deleted = 0
//     `;
//     // Execute the SQL query
//     const result = await pool.request().query(sql);

//     // Return the result as JSON
//     return res.json(result.recordset);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'An error occurred while fetching data' });
//   }
// });

app.get("/getchildFranchiseDetails", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      title,
      licarecode,
      partner_name,
      mobile_no,
      email,
      parentfranchisetitle,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    // SQL query to fetch data from the master list, customize based on your needs
    let sql = `
 SELECT m.*,
       p.title AS parentfranchisetitle,
       c.title AS country_name,
       r.title AS region_name,
       s.title AS state_name,
       d.title AS district_name,
       ct.title AS city_name
FROM awt_childfranchisemaster m
LEFT JOIN awt_country c ON m.country_id = CAST(c.id AS VARCHAR)
LEFT JOIN awt_region r ON m.region_id = CAST(r.id AS VARCHAR)
LEFT JOIN awt_geostate s ON m.geostate_id = CAST(s.id AS VARCHAR)
LEFT JOIN awt_district d ON m.area_id = CAST(d.id AS VARCHAR)
LEFT JOIN awt_geocity ct ON m.geocity_id = CAST(ct.id AS VARCHAR)
LEFT JOIN awt_franchisemaster p ON m.pfranchise_id = CAST(p.licarecode AS VARCHAR)
WHERE m.deleted = 0
    `;

    if (title) {
      sql += ` AND m.title LIKE '%${title}%'`;
    }

    if (licarecode) {
      sql += ` AND m.licare_code LIKE '%${licarecode}%'`;
    }

    if (mobile_no) {
      sql += ` AND m.mobile_no LIKE '%${mobile_no}%'`;
    }

    if (email) {
      sql += ` AND m.email LIKE '%${email}%'`;
    }

    if (partner_name) {
      sql += ` AND m.partner_name LIKE '%${partner_name}%'`;
    }
    if (parentfranchisetitle) {
      sql += ` AND p.title LIKE '%${parentfranchisetitle}%'`;
    }

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY m.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;


    // Execute the SQL query
    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_childfranchisemaster WHERE deleted = 0`;
    if (title) countSql += ` AND title LIKE '%${title}%'`;
    if (licarecode) countSql += ` AND licare_code LIKE '%${licarecode}%'`;
    if (mobile_no) countSql += ` AND mobile_no LIKE '%${mobile_no}%'`;
    if (email) countSql += ` AND email LIKE '%${email}%'`;
    if (partner_name) countSql += ` AND partner_name LIKE '%${partner_name}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


//request Child Franchise populate data

app.get("/getchildfranchisepopulate/:childid", authenticateToken, async (req, res) => {
  const { childid } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
     Select * from awt_childfranchisemaster where deleted = 0 and id = ${childid}
    `;
    // Execute the SQL query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});



//End of Request Child Franchise populate data

app.get("/getmasterfranchisepopulate/:masterid", authenticateToken, async (req, res) => {
  const { masterid } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
SELECT
    m.*,
    c.title as country_name,
    r.title as region_name,
    s.title as state_name,
    d.title as district_name,
    ct.title as city_name
FROM awt_franchisemaster m
LEFT JOIN awt_country c ON TRY_CONVERT(INT, m.country_id) = c.id
LEFT JOIN awt_region r ON TRY_CONVERT(INT, m.region_id) = r.id
LEFT JOIN awt_geostate s ON TRY_CONVERT(INT, m.geostate_id) = s.id
LEFT JOIN awt_district d ON TRY_CONVERT(INT, m.area_id) = d.id
LEFT JOIN awt_geocity ct ON TRY_CONVERT(INT, m.geocity_id) = ct.id
WHERE m.deleted = 0 and m.id = ${masterid}
    `;
    // Execute the SQL query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// customer populate

app.get("/getcustomerpopulate/:customerid", authenticateToken, async (req, res) => {
  const { customerid } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
     SELECT c.* from  awt_customer as c Where c.deleted = 0 AND c.id = ${customerid}
    `;
    // Execute the SQL query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
app.get("/requestchildfranchise/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject the `id` into the query string
    const sql = `SELECT * FROM awt_childfranchisemaster WHERE id = '${id}' AND deleted = 0`;

    // Execute the SQL query
    const result = await pool.request().query(sql);

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching child franchise data" });
  }
});
// app
//.post("/postchildfranchise", async (req, res) => {
//   const { title, pfranchise_id } = req.body;

//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;

//     // Check if the title already exists and is not deleted
//     const checkDuplicateSql = `SELECT * FROM awt_childfranchisemaster WHERE title = '${title}' AND deleted = 0`;
//     const duplicateResult = await pool.request().query(checkDuplicateSql);

//     if (duplicateResult.recordset.length > 0) {
//       return res.status(409).json({
//         message: "Duplicate entry, Child Franchise Master already exists!",
//       });
//     }

//     // Check if the title exists and is soft-deleted
//     const checkSoftDeletedSql = `SELECT * FROM awt_childfranchisemaster WHERE title = '${title}' AND deleted = 1`;
//     const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

//     if (softDeletedResult.recordset.length > 0) {
//       const restoreSoftDeletedSql = `UPDATE awt_childfranchisemaster SET deleted = 0 WHERE title = '${title}'`;
//       await pool.request().query(restoreSoftDeletedSql);

//       return res.json({
//         message: "Soft-deleted Child Franchise Master restored successfully!",
//       });
//     }

//     // Insert the new child franchise if no duplicates or soft-deleted records found
//     const insertSql = `INSERT INTO awt_childfranchisemaster (title, pfranchise_id) VALUES ('${title}', '${pfranchise_id}')`;
//     await pool.request().query(insertSql);

//     return res.json({
//       message: "Child Franchise Master added successfully!",
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json(err);
//   }
// });

app.post("/postchildfranchise", authenticateToken, async (req, res) => {
  const {
    address, area, bank_account_number, bank_address, bank_ifsc_code, bank_name,
    city, contact_person, contract_activation_date, contract_expiration_date,
    country_id, email, gst_number, last_working_date, licare_code, mobile_no,
    pan_number, partner_name, password, pfranchise_id, pincode_id, region_id,
    state, title, website, with_liebherr, created_by
  } = req.body;


  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the data already exists and is not deleted
    const checkDuplicateResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT * FROM awt_childfranchisemaster WHERE email = @email AND deleted = 0
      `);


    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Child Franchise Master already exists!",
      });
    }

    const checkSoftDeletedResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`
        SELECT * FROM awt_childfranchisemaster WHERE email = @email AND deleted = 1
      `);

    if (checkSoftDeletedResult.recordset.length > 0) {
      // Restore the soft-deleted record with updated data
      await pool.request()
        .input('title', sql.VarChar, title)
        .input('pfranchise_id', sql.Int, pfranchise_id)
        .input('licare_code', sql.VarChar, licare_code)
        .input('partner_name', sql.VarChar, partner_name)
        .input('contact_person', sql.VarChar, contact_person)
        .input('email', sql.VarChar, email)
        .input('mobile_no', sql.VarChar, mobile_no)
        .input('password', sql.VarChar, password)
        .input('address', sql.VarChar, address)
        .input('country_id', sql.Int, country_id)
        .input('region_id', sql.Int, region_id)
        .input('state', sql.VarChar, state)
        .input('area', sql.VarChar, area)
        .input('city', sql.VarChar, city)
        .input('pincode_id', sql.Int, pincode_id)
        .input('website', sql.VarChar, website)
        // .input('created_by', sql.VarChar, created_by)
        .input('gst_number', sql.VarChar, gst_number)
        .input('pan_number', sql.VarChar, pan_number)
        .input('bank_name', sql.VarChar, bank_name)
        .input('bank_account_number', sql.VarChar, bank_account_number)
        .input('bank_ifsc_code', sql.VarChar, bank_ifsc_code)
        .input('bank_address', sql.VarChar, bank_address)
        .input('with_liebherr', sql.DateTime, with_liebherr)
        .input('last_working_date', sql.DateTime, last_working_date)
        .input('contract_activation_date', sql.DateTime, contract_activation_date)
        .input('contract_expiration_date', sql.DateTime, contract_expiration_date)
        .query(`
          UPDATE awt_childfranchisemaster
          SET
            title = @title,
            licare_code = @licare_code,
            partner_name = @partner_name,
            contact_person = @contact_person,
            email = @email,
            mobile_no = @mobile_no,
            password = @password,
            address = @address,
            country_id = @country_id,
            region_id = @region_id,
            geostate_id = @state,
            area_id = @area,
            geocity_id = @city,
            created_by = ${created_by},
            pincode_id = @pincode_id,
            webste = @website,
            gstno = @gst_number,
            panno = @pan_number,
            bankname = @bank_name,
            bankacc = @bank_account_number,
            bankifsc = @bank_ifsc_code,
            bankaddress = @bank_address,
            withliebher = @with_liebherr,
            lastworkinddate = @last_working_date,
            contractacti = @contract_activation_date,
            contractexpir = @contract_expiration_date,
            deleted = 0
          WHERE title = @title AND pfranchise_id = @pfranchise_id
        `);

      return res.json({
        message: "Soft-deleted Child Franchise Master restored successfully with updated data!",
      });
    }
    // Insert the new child franchise if no duplicates or soft-deleted records found
    const insert = await pool.request()
      .input('title', sql.VarChar, title)
      .input('pfranchise_id', sql.Int, pfranchise_id)
      .input('licare_code', sql.VarChar, licare_code)
      .input('partner_name', sql.VarChar, partner_name)
      .input('contact_person', sql.VarChar, contact_person)
      .input('email', sql.VarChar, email)
      .input('mobile_no', sql.VarChar, mobile_no)
      .input('password', sql.VarChar, password)
      .input('address', sql.VarChar, address)
      .input('country_id', sql.VarChar, country_id)
      .input('region_id', sql.VarChar, region_id)
      .input('state', sql.VarChar, state)
      .input('area', sql.VarChar, area)
      .input('city', sql.VarChar, city)
      .input('pincode_id', sql.VarChar, pincode_id)
      .input('website', sql.VarChar, website)
      .input('gst_number', sql.VarChar, gst_number)
      .input('pan_number', sql.VarChar, pan_number)
      .input('bank_name', sql.VarChar, bank_name)
      .input('bank_account_number', sql.VarChar, bank_account_number)
      .input('bank_ifsc_code', sql.VarChar, bank_ifsc_code)
      .input('bank_address', sql.VarChar, bank_address)
      .input('last_working_date', sql.DateTime, last_working_date)
      .input('contract_activation_date', sql.DateTime, contract_activation_date)
      .input('contract_expiration_date', sql.DateTime, contract_expiration_date)
      .input('with_liebherr', sql.DateTime, with_liebherr)
      .query(`
        INSERT INTO awt_childfranchisemaster
        (title, pfranchise_id, licare_code, partner_name, contact_person, email, mobile_no, password, address,
         country_id, region_id, geostate_id, area_id, geocity_id, pincode_id, webste, gstno, panno, bankname,
         bankacc, bankifsc, bankaddress, withliebher, lastworkinddate, contractacti, contractexpir, created_by)
        VALUES
        (@title, @pfranchise_id, @licare_code, @partner_name, @contact_person, @email, @mobile_no, @password,
         @address, @country_id, @region_id, @state, @area, @city, @pincode_id, @website, @gst_number, @pan_number,
         @bank_name, @bank_account_number, @bank_ifsc_code, @bank_address,@with_liebherr , @last_working_date,
         @contract_activation_date, @contract_expiration_date,${created_by})
      `);
    return res.json({
      message: "Child Franchise Master added successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});


// Update Child Master Page
app.post("/putchildfranchise", authenticateToken, async (req, res) => {
  const {
    title, id, pfranchise_id, licare_code, partner_name, contact_person,
    email, mobile_no, password, address, country_id, region_id, state,
    area, city, pincode_id, website, gst_number, pan_number, bank_name,
    bank_account_number, bank_ifsc_code, bank_address, with_liebherr,
    last_working_date, contract_activation_date, contract_expiration_date, created_by
  } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Duplicate Check Query
    const duplicateCheckSQL = `
      SELECT * FROM awt_childfranchisemaster
      WHERE email = @email
      AND deleted = 0
      AND id != @id
    `;

    console.log("Executing Duplicate Check SQL:", duplicateCheckSQL);

    const duplicateCheckResult = await pool.request()
      .input('email', email)
      .input('id', id)
      .query(duplicateCheckSQL);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Child Franchise Master already exists!"
      });
    }

    // Step 2: Update Query
    const updateSQL = `
      UPDATE awt_childfranchisemaster
      SET
        title = @title,
        pfranchise_id = @pfranchise_id,
        licare_code = @licare_code,
        partner_name = @partner_name,
        contact_person = @contact_person,
        email = @email,
        mobile_no = @mobile_no,
        password = @password,
        address = @address,
        country_id = @country_id,
        region_id = @region_id,
        geostate_id = @state,
        area_id = @area,
        geocity_id = @city,
        pincode_id = @pincode_id,
        webste = @website,
        gstno = @gst_number,
        panno = @pan_number,
        bankname = @bank_name,
        bankacc = @bank_account_number,
        bankifsc = @bank_ifsc_code,
        bankaddress = @bank_address,
        withliebher = @with_liebherr,
        lastworkinddate = @last_working_date,
        contractacti = @contract_activation_date,
        contractexpir = @contract_expiration_date,
        updated_by = @created_by
      WHERE id = @id
    `;

    console.log("Executing Update SQL:", updateSQL);

    await pool.request()
      .input('title', title)
      .input('pfranchise_id', pfranchise_id)
      .input('licare_code', licare_code)
      .input('partner_name', partner_name)
      .input('contact_person', contact_person)
      .input('email', email)
      .input('mobile_no', mobile_no)
      .input('password', password)
      .input('address', address)
      .input('country_id', country_id)
      .input('region_id', region_id)
      .input('state', state)
      .input('area', area)
      .input('city', city)
      .input('pincode_id', pincode_id)
      .input('website', website)
      .input('gst_number', gst_number)
      .input('pan_number', pan_number)
      .input('bank_name', bank_name)
      .input('bank_account_number', bank_account_number)
      .input('bank_ifsc_code', bank_ifsc_code)
      .input('bank_address', bank_address)
      .input('with_liebherr', with_liebherr)
      .input('last_working_date', last_working_date)
      .input('contract_activation_date', contract_activation_date)
      .input('contract_expiration_date', contract_expiration_date)
      .input('created_by', created_by)
      .input('id', id)
      .query(updateSQL);

    return res.json({
      message: "Child Franchise updated successfully!"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while processing the request" });
  }
});





app.post("/deletechildfranchise", (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE awt_childfranchisemaster SET deleted = 1 WHERE id = '${id}'`;

  con.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error updating Child Franchise" });
    } else {
      return res.json(data);
    }
  });
});
// End Child Franchise Master

// ProductType Start
// API to fetch all Product Types that are not soft-deleted
app.get("/getproducttype", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM product_type WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});
// Insert for Product Type
app.post("/postdataproducttype", authenticateToken, async (req, res) => {
  const { id, product_type, created_by } = req.body;

  try {
    const pool = await poolPromise;

    if (id) {
      // Check for duplicate entries excluding the current ID
      const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = '${product_type}' AND id != ${id} AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, ProductType already exists!" });
      } else {
        // Update the existing product type
        const updateSql = `UPDATE product_type SET product_type = '${product_type}', updated_date = GETDATE(), updated_by = '${created_by}' WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "ProductType updated successfully!" });
      }

    } else {
      // Check for duplicate entries for a new product type
      const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = '${product_type}' AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, ProductType already exists!" });
      } else {
        // Check for soft-deleted entries with the same product type
        const checkSoftDeletedSql = `SELECT * FROM product_type WHERE product_type = '${product_type}' AND deleted = 1`;
        const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedResult.recordset.length > 0) {
          // Restore the soft-deleted entry
          const restoreSoftDeletedSql = `UPDATE product_type SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}' WHERE product_type = '${product_type}'`;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new product type
          const insertSql = `INSERT INTO product_type (product_type, created_date, created_by) VALUES ('${product_type}', GETDATE(), '${created_by}')`;
          await pool.request().query(insertSql);
          return res.json({ message: "ProductType added successfully!" });
        }
      }
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while processing the request" });
  }
});

// Edit for Product Type
app.get("/requestdataproducttype/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to select the product type by id
    const sql = `SELECT * FROM product_type WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    // Return the first record if it exists, otherwise return a 404 error
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "ProductType not found" });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching product type data" });
  }
});
// Update for Product Type
app.post("/putproducttypedata", authenticateToken, async (req, res) => {
  const { id, product_type, updated_by } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates, excluding the current record's ID
    const checkDuplicateSql = `SELECT * FROM product_type WHERE product_type = '${product_type}' AND deleted = 0 AND id != ${id}`;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, ProductType already exists!" });
    } else {
      // Update the product type
      const updateSql = `UPDATE product_type SET product_type = '${product_type}', updated_by = '${updated_by}', updated_date = GETDATE() WHERE id = ${id} AND deleted = 0`;
      await pool.request().query(updateSql);
      return res.json({ message: "ProductType updated successfully!" });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating product type data" });
  }
});
// Delete for Product Type
app.post("/deleteproducttypedata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Update query to set `deleted` to 1 for the specified id
    const sql = `UPDATE product_type SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json({ message: "ProductType marked as deleted successfully!", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating product type" });
  }
});
//Product Type End\

//Product Line Start
// API to fetch all product lines that are not soft deleted
app.get("/getproductline", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to get all non-deleted product lines
    const sql = `SELECT * FROM product_line WHERE deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching product lines" });
  }
});
// Insert for product line
app.post("/postdataproductline", authenticateToken, async (req, res) => {
  const { id, product_line, pline_code, created_by } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    if (id) {
      // Check for duplicate entries excluding the current ID
      const checkDuplicateSql = `SELECT * FROM product_line WHERE pline_code = '${pline_code}' AND id != ${id}`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Product Line Code already exists!" });
      } else {
        // Update the existing product line
        const updateSql = `UPDATE product_line SET product_line = '${product_line}', pline_code = '${pline_code}', updated_date = GETDATE(), updated_by = '${created_by}' WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "Product Line updated successfully!" });
      }
    } else {
      // Check for duplicate entries for a new product line
      const checkDuplicateSql = `SELECT * FROM product_line WHERE pline_code = '${pline_code}'`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Product Line Code already exists!" });
      } else {
        // Insert new product line
        const insertSql = `INSERT INTO product_line (product_line, pline_code, created_date, created_by) VALUES ('${product_line}', '${pline_code}', GETDATE(), '${created_by}')`;
        await pool.request().query(insertSql);
        return res.json({ message: "Product Line added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while processing the request" });
  }
});


// Edit for product line
app.get("/requestdataproductline/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to select the product line by id
    const sql = `SELECT * FROM product_line WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    // Return the first record if it exists, otherwise return a 404 error
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Product Line not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching product line data" });
  }
});
// Update for product line
app.post("/putproductlinedata", authenticateToken, async (req, res) => {
  const { id, product_line, pline_code, updated_by } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicate entries excluding the current ID
    const checkDuplicateSql = `SELECT * FROM product_line WHERE pline_code = '${pline_code}' AND deleted = 0 AND id != ${id}`;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Product Line already exists!" });
    } else {
      // Update the product line
      const updateSql = `UPDATE product_line SET product_line = '${product_line}', pline_code = '${pline_code}', updated_by = '${updated_by}', updated_date = GETDATE() WHERE id = ${id} AND deleted = 0`;
      await pool.request().query(updateSql);
      return res.json({ message: "Product Line updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating the product line" });
  }
});

// Delete for product line
app.post("/deleteproductlinedata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Update query to set `deleted` to 1 for the specified id
    const sql = `UPDATE product_line SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json({ message: "Product Line marked as deleted successfully!", data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error updating Product Line" });
  }
});
// Product Line End

//Material Start
// API to fetch all materials that are not soft deleted
app.get("/getmat", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to get all non-deleted materials
    const sql = `SELECT * FROM material WHERE deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching materials" });
  }
});
// Insert for material
app.post("/postdatamat", authenticateToken, async (req, res) => {
  const { id, Material, created_by } = req.body;

  try {
    const pool = await poolPromise;

    if (id) {
      // Check for duplicate materials excluding the current ID
      const checkDuplicateSql = `SELECT * FROM material WHERE material = '${Material}' AND id != ${id} AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Material already exists!" });
      } else {
        // Update the material
        const updateSql = `UPDATE material SET material = '${Material}', updated_date = GETDATE(), updated_by = '${created_by}' WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "Material updated successfully!" });
      }
    } else {
      // Check for duplicate materials
      const checkDuplicateSql = `SELECT * FROM material WHERE material = '${Material}' AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Material already exists!" });
      } else {
        // Check if soft-deleted material exists
        const checkSoftDeletedSql = `SELECT * FROM material WHERE material = '${Material}' AND deleted = 1`;
        const softDeletedData = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedData.recordset.length > 0) {
          // Restore soft-deleted material
          const restoreSoftDeletedSql = `UPDATE material SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}' WHERE material = '${Material}'`;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new material
          const insertSql = `INSERT INTO material (material, created_date, created_by) VALUES ('${Material}', GETDATE(), '${created_by}')`;
          await pool.request().query(insertSql);
          return res.json({ message: "Material added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while processing the material data" });
  }
});
// Edit for material
app.get("/requestdatamat/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Query to get the material by id, ensuring it's not deleted
    const sql = `SELECT * FROM material WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset[0] || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching the material data" });
  }
});
// Update for material
app.post("/putmatdata", authenticateToken, async (req, res) => {
  const { id, Material, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicate materials, excluding the current ID
    const checkDuplicateSql = `SELECT * FROM material WHERE material = '${Material}' AND deleted = 0 AND id != ${id}`;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      return res
        .status(409)
        .json({ message: "Duplicate entry, Material already exists!" });
    } else {
      // Update the material
      const updateSql = `UPDATE material SET material = '${Material}', updated_by = '${updated_by}', updated_date = GETDATE() WHERE id = ${id} AND deleted = 0`;
      await pool.request().query(updateSql);

      return res.json({ message: "Material updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating the material data" });
  }
});
// Delete for material
app.post("/deletematdata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to mark the material as deleted
    const sql = `UPDATE material SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Material" });
  }
});
// Material End

//Manufacturer Start
// API to fetch all Manufacturer that are not soft deleted
app.get("/getmanufacturer", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch manufacturers that are not deleted
    const sql = "SELECT * FROM manufacturer WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching manufacturer data" });
  }
});
// Insert for Mnufacturer
app.post("/postmanufacturer", authenticateToken, async (req, res) => {
  const { id, Manufacturer, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the manufacturer already exists (for both update and insert)
    let sql;
    if (id) {
      sql = `SELECT * FROM manufacturer WHERE Manufacturer = '${Manufacturer}' AND id != ${id} AND deleted = 0`;
      const result = await pool.request().query(sql);

      if (result.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Manufacturer already exists!" });
      } else {
        sql = `UPDATE manufacturer
               SET Manufacturer = '${Manufacturer}', updated_date = GETDATE(), updated_by = '${created_by}'
               WHERE id = ${id}`;
        await pool.request().query(sql);
        return res.json({ message: "Manufacturer updated successfully!" });
      }
    } else {
      // Check if the manufacturer exists (for new insert)
      sql = `SELECT * FROM manufacturer WHERE Manufacturer = '${Manufacturer}' AND deleted = 0`;
      const result = await pool.request().query(sql);

      if (result.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Manufacturer already exists!" });
      } else {
        // Check if the manufacturer is soft-deleted
        sql = `SELECT * FROM manufacturer WHERE Manufacturer = '${Manufacturer}' AND deleted = 1`;
        const softDeletedData = await pool.request().query(sql);

        if (softDeletedData.recordset.length > 0) {
          sql = `UPDATE manufacturer
                 SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}'
                 WHERE Manufacturer = '${Manufacturer}'`;
          await pool.request().query(sql);
          return res.json({ message: "Soft-deleted Manufacturer restored successfully!" });
        } else {
          // Insert new manufacturer
          sql = `INSERT INTO manufacturer (Manufacturer, created_date, created_by)
                 VALUES ('${Manufacturer}', GETDATE(), '${created_by}')`;
          await pool.request().query(sql);
          return res.json({ message: "Manufacturer added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the manufacturer data" });
  }
});


// Edit for Manufacturer
app.get("/requestmanufacturer/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch manufacturer by id and ensure it is not deleted
    const sql = `SELECT * FROM manufacturer WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Manufacturer not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching manufacturer data" });
  }
});

// Update for Manufacturer
app.post("/putmanufacturer", authenticateToken, async (req, res) => {
  const { id, Manufacturer, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if manufacturer already exists
    let sql = `SELECT * FROM manufacturer WHERE Manufacturer = '${Manufacturer}' AND deleted = 0 AND id != ${id}`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Manufacturer already exists!" });
    } else {
      // Update manufacturer details
      sql = `UPDATE manufacturer
             SET Manufacturer = '${Manufacturer}', updated_by = '${updated_by}', updated_date = GETDATE()
             WHERE id = ${id} AND deleted = 0`;
      await pool.request().query(sql);

      return res.json({ message: "Manufacturer updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating manufacturer data" });
  }
});

// Delete for Manufacturer
app.post("/delmanufacturer", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to mark manufacturer as deleted
    const sql = `UPDATE manufacturer SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Manufacturer" });
  }
});

// Rate Card code start
app.get("/getratedata", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch rate data where deleted is 0
    const sql = "SELECT * FROM rate_card WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching rate data" });
  }
});
// Insert for Ratecard
app.post("/postratedata", authenticateToken, async (req, res) => {
  const { Ratecard } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Ratecard already exists
    let sql = `SELECT * FROM rate_card WHERE Ratecard = '${Ratecard}' AND deleted = 0`;
    const result = await pool.request().query(sql);
    console.log('error');

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Ratecard already exists!" });
    } else {
      // Check if the Ratecard is soft-deleted
      sql = `SELECT * FROM rate_card WHERE Ratecard = '${Ratecard}' AND deleted = 1`;
      const softDeletedData = await pool.request().query(sql);

      if (softDeletedData.recordset.length > 0) {
        // Restore soft-deleted Ratecard
        sql = `UPDATE rate_card SET deleted = 0 WHERE Ratecard = '${Ratecard}'`;
        await pool.request().query(sql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Insert new Ratecard
        sql = `INSERT INTO rate_card (Ratecard) VALUES ('${Ratecard}')`;
        await pool.request().query(sql);
        return res.json({ message: "Ratecard added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the rate data" });
  }
});
// edit for Ratecard
app.get("/requestratedata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch rate data by id and ensure it is not deleted
    const sql = `SELECT * FROM rate_card WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Ratecard not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching rate data" });
  }
});
// update for Ratecard
app.post("/putratedata", authenticateToken, async (req, res) => {
  const { Ratecard, id } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Ratecard already exists
    let sql = `SELECT * FROM rate_card WHERE Ratecard = '${Ratecard}' AND id != ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Ratecard already exists!" });
    } else {
      // Update Ratecard
      sql = `UPDATE rate_card SET Ratecard = '${Ratecard}' WHERE id = ${id}`;
      await pool.request().query(sql);

      return res.json({ message: "Ratecard updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating rate data" });
  }
});
// delete for Ratecard
app.post("/deleteratedata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to mark rate card as deleted
    const sql = `UPDATE rate_card SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating rate card" });
  }
});

//Rate card code end


// service product code start
app.get("/getprodata", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch service product data where deleted is 0
    const sql = "SELECT * FROM service_product WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching product data" });
  }
});
// Insert for Serviceproduct
app.post("/postprodata", authenticateToken, async (req, res) => {
  const { Serviceproduct } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Serviceproduct already exists
    let sql = `SELECT * FROM service_product WHERE Serviceproduct = '${Serviceproduct}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Serviceproduct already exists!" });
    } else {
      // Check if the Serviceproduct is soft-deleted
      sql = `SELECT * FROM service_product WHERE Serviceproduct = '${Serviceproduct}' AND deleted = 1`;
      const softDeletedData = await pool.request().query(sql);

      if (softDeletedData.recordset.length > 0) {
        // Restore soft-deleted Serviceproduct
        sql = `UPDATE service_product SET deleted = 0 WHERE Serviceproduct = '${Serviceproduct}'`;
        await pool.request().query(sql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Insert new Serviceproduct
        sql = `INSERT INTO service_product (Serviceproduct) VALUES ('${Serviceproduct}')`;
        await pool.request().query(sql);
        return res.json({ message: "Serviceproduct added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the product data" });
  }
});
// edit for Serviceproduct
app.get("/requestprodata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch service product by id and ensure it is not deleted
    const sql = `SELECT * FROM service_product WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Serviceproduct not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching product data" });
  }
});
// update for Serviceproduct
app.post("/putprodata", authenticateToken, async (req, res) => {
  const { Serviceproduct, id } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Serviceproduct already exists (duplicate entry)
    let sql = `SELECT * FROM service_product WHERE Serviceproduct = '${Serviceproduct}' AND id != ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Serviceproduct already exists!" });
    } else {
      // Update the service product
      sql = `UPDATE service_product SET Serviceproduct = '${Serviceproduct}' WHERE id = ${id}`;
      await pool.request().query(sql);

      return res.json({ message: "Serviceproduct updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating the product" });
  }
});
// delete for Serviceproduct
app.post("/deleteprodata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to mark the product as deleted
    const sql = `UPDATE service_product SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating product" });
  }
});
// Service product end

// Service Contract code Start

app.get("/getservicecontract", authenticateToken,
  async (req, res) => {
    try {
      const pool = await poolPromise;

      // SQL query to fetch service product data where deleted is 0
      const sql = "SELECT * FROM awt_servicecontract WHERE deleted = 0";
      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred while fetching service_contract data" });
    }
  });

// Insert for Servicecontract
app.post("/postservicecontract", authenticateToken, async (req, res) => {
  const { customerName, customerMobile, contractNumber, contractType, productName, serialNumber, startDate, endDate } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Servicecontract already exists
    let sql = `SELECT * FROM awt_servicecontract WHERE customerName = '${customerName}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Customer already exists!" });
    } else {
      // Check if the Servicecontract is soft-deleted
      sql = `SELECT * FROM awt_servicecontract WHERE customerName = '${customerName}' AND deleted = 1`;
      const softDeletedData = await pool.request().query(sql);

      if (softDeletedData.recordset.length > 0) {
        // Restore soft-deleted Servicecontract
        sql = `UPDATE awt_servicecontract SET deleted = 0 WHERE customerName = '${customerName}'`;
        await pool.request().query(sql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Insert new Servicecontract
        sql = `INSERT INTO awt_servicecontract (customerName,customerMobile,contractNumber,contractType,productName,serialNumber,startDate,endDate,deleted) VALUES ('${customerName}','${customerMobile}','${contractNumber}','${contractType}','${productName}','${serialNumber}','${startDate}','${endDate}',0)`
        await pool.request().query(sql);
        return res.json({ message: "Service Contract added successfully!" });

      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the Service data" });
  }
});

// edit for Servicecontract
app.get("/requestservicecontract/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch service product by id and ensure it is not deleted
    const sql = `SELECT * FROM awt_servicecontract WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Servicecontract not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching product data" });
  }
});
//update for service contract


app.post("/putservicecontract", authenticateToken, async (req, res) => {
  const { id, customerName, customerMobile, contractNumber, contractType, productName, serialNumber, startDate, endDate, created_by } = req.body;


  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;


    // Step 1: Duplicate Check Query
    const duplicateCheckSQL = `
      SELECT * FROM awt_servicecontract
      WHERE customerMobile = @customerMobile
      AND deleted = 0
      AND id != @id
    `;

    console.log("Executing Duplicate Check SQL:", duplicateCheckSQL);

    const duplicateCheckResult = await pool.request()
      .input('customerMobile', customerMobile)
      .input('id', id)
      .query(duplicateCheckSQL);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry,  Service Contract already exists!"
      });
    }

    // Step 2: Update Query
    const updateSQL = `
     UPDATE awt_servicecontract
     SET
       customerName = @customerName,
       customerMobile = @customerMobile,
       contractNumber = @contractNumber,
       contractType = @contractType,
       productName = @productName,
       serialNumber = @serialNumber,
       startDate = @startDate,
       endDate = @endDate,
       updated_by = @created_by
     WHERE id = @id
   `;
    console.log("Executing Update SQL:", updateSQL);

    await pool.request()
      .input('customerName', customerName)
      .input('customerMobile', customerMobile)
      .input('contractNumber', contractNumber)
      .input('contractType', contractType)
      .input('productName', productName)
      .input('serialNumber', serialNumber)
      .input('startDate', startDate)
      .input('endDate', endDate)
      .input('created_by', created_by)
      .input('id', id)
      .query(updateSQL);

    return res.json({
      message: "Service contract updated successfully!"
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the Service Contract' });
  }
});

app.post("/deleteservicecontract", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject `id` into the SQL query (no parameter binding)
    const sql = `UPDATE awt_servicecontract SET deleted = 1 WHERE id = '${id}'`;

    // Execute the SQL query
    await pool.request().query(sql);

    return res.json({ message: "Service Contract deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Service Contract" });
  }
});

//Service contract listing
// app
//.get("/getservicecontractlist", async (req, res) => {
//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;
//     const{
//       customerName,
//       customerMobile,
//       contractNumber,
//       contractType,
//       startDate,
//       endDate,
//       productName,
//       serialNumber,

//     } = req.query;

//     // SQL query to fetch data from the master list, customize based on your needs
//     const sql = "SELECT * FROM awt_servicecontract WHERE deleted = 0";
//     // Execute the SQL query
//     const result = await pool.request().query(sql);

//     // Return the result as JSON
//     return res.json(result.recordset);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'An error occurred while fetching data' });
//   }
// });

// Service Contract list api with filters
app.get("/getservicecontractlist", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      customerName,
      contractNumber,
      startDate,
      endDate,
      productName,
      serialNumber,
      page = 1,
      pageSize = 10,

    } = req.query;

    // Debug log

    let sql = `
       SELECT s.* FROM awt_servicecontract as s  WHERE s.deleted = 0
    `;

    if (customerName) {
      sql += ` AND s.customerName LIKE '%${customerName}%'`;

    }

    if (contractNumber) {
      sql += ` AND s.contractNumber LIKE '%${contractNumber}%'`;
    }

    if (serialNumber) {
      sql += ` AND s.serialNumber LIKE '%${serialNumber}%'`;
    }

    if (productName) {
      sql += ` AND s.productName LIKE '%${productName}%'`;
    }

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY s.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_servicecontract WHERE deleted = 0`;
    if (customerName) countSql += ` AND customerName LIKE '%${customerName}%'`;
    if (contractNumber) countSql += ` AND contractNumber LIKE '%${contractNumber}%'`;
    if (productName) countSql += ` AND productName LIKE '%${productName}%'`;
    if (serialNumber) countSql += ` AND serialNumber LIKE '%${serialNumber}%'`;
    if (startDate) countSql += ` AND startDate LIKE '%${startDate}%'`;
    if (endDate) countSql += ` AND endDate LIKE '%${endDate}%'`;


    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});

// fetching data populate
app.get("/getservicecontractpopulate/:serviceid", authenticateToken, async (req, res) => {
  const { serviceid } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
         SELECT s.* from  awt_servicecontract as s Where s.deleted = 0 AND s.id = ${serviceid}
        `;
    // Execute the SQL query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// Service Contract Code End

// Lhi User code start
app.get("/getlhidata", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch lhi_user data where deleted is 0
    const sql = "SELECT * FROM lhi_user WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching LHI data" });
  }
});

//Reporting to dropdown Query

app.get("/getreport", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch lhi_user data where deleted is 0
    const sql = "SELECT Lhiuser FROM lhi_user WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching LHI data" });
  }
});
// Insert for Lhiuser
app.post("/postlhidata", authenticateToken, async (req, res) => {
  const { Lhiuser,
    mobile_no,
    Password,
    UserCode,
    email,
    remarks,
    status,
    Roles,
    Reporting_to,
    Designation,


  } = req.body;



  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists and is not soft-deleted
    let sql = `SELECT * FROM lhi_user WHERE  Lhiuser = '${Lhiuser}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      // Step 2: Check if the same Lhiuser exists but is soft-deleted
      sql = `SELECT * FROM lhi_user WHERE Lhiuser = '${Lhiuser}' AND deleted = 1`;
      const softDeletedData = await pool.request().query(sql);

      if (softDeletedData.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        sql = `UPDATE lhi_user SET deleted = 0 WHERE Lhiuser = '${Lhiuser}'`;
        await pool.request().query(sql);

        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        sql = `INSERT INTO lhi_user (Lhiuser,password,remarks,Usercode,mobile_no,email,status,Role,Reporting_to,Designation) VALUES ('${Lhiuser}','${Password}','${remarks}','${UserCode}','${mobile_no}','${email}','${status}','${Roles}','${Reporting_to}','${Designation}')`
        await pool.request().query(sql);

        return res.json({ message: "Lhiuser added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the request" });
  }
});
// edit for Lhiuser
app.get("/requestlhidata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch LHI data by id and check for deleted flag
    const sql = `SELECT * FROM lhi_user WHERE id = '${id}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "LHI data not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching LHI data" });
  }
});
// update for Lhiuser
app.post("/putlhidata", authenticateToken, async (req, res) => {
  const {
    Lhiuser, id, updated_by, mobile_no, Usercode, password, status, email, remarks, Roles, Designation, Reporting_to
  } = req.body;


  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM lhi_user
      WHERE Lhiuser = '${Lhiuser}'
      AND id != '${id}'
      AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE lhi_user
        SET
          Lhiuser = '${Lhiuser}',
          updated_by = '${updated_by}',
          updated_date = GETDATE(),
          mobile_no = '${mobile_no}',
          Usercode = '${Usercode}',
          password = '${password}',
          status = ${status},
          email = '${email}',
          remarks = '${remarks}',
          Role = '${Roles}',
          Designation = '${Designation}',
          Reporting_to = '${Reporting_to}'
        WHERE id = '${id}'
      `;
      await pool.request().query(updateSql);

      return res.json({ message: "Lhiuser updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating Lhiuser data" });
  }
});


// delete for Lhiuser
app.post("/deletelhidata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to mark the user as deleted
    const sql = `UPDATE lhi_user SET deleted = 1 WHERE id = '${id}'`;
    await pool.request().query(sql);

    return res.json({ message: "Lhiuser deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Lhiuser data" });
  }
});

// status api for lhi user
//lhi user code end

// call status code start
app.get("/getcalldata", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch call status records that are not deleted
    const sql = "SELECT * FROM call_status WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching call status data" });
  }
});
// Insert for Callstatus
app.post("/postcalldata", authenticateToken, async (req, res) => {
  const { Callstatus } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Callstatus exists and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM call_status WHERE Callstatus = '${Callstatus}' AND deleted = 0`;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Callstatus already exists!" });
    }

    // Step 2: Check if the same Callstatus exists but is soft-deleted
    const checkSoftDeletedSql = `SELECT * FROM call_status WHERE Callstatus = '${Callstatus}' AND deleted = 1`;
    const checkSoftDeletedResult = await pool.request().query(checkSoftDeletedSql);

    if (checkSoftDeletedResult.recordset.length > 0) {
      // If soft-deleted data exists, restore the entry
      const restoreSoftDeletedSql = `UPDATE call_status SET deleted = 0 WHERE Callstatus = '${Callstatus}'`;
      await pool.request().query(restoreSoftDeletedSql);
      return res.json({ message: "Soft-deleted data restored successfully!" });
    }

    // Step 3: Insert new entry if no duplicates found
    const insertSql = `INSERT INTO call_status (Callstatus) VALUES ('${Callstatus}')`;
    await pool.request().query(insertSql);

    return res.json({ message: "Call status added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the request" });
  }
});
// Edit for Callstatus
app.get("/requestcalldata/:id",
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM call_status WHERE id = '${id}' AND deleted = 0`;

    try {
      const pool = await poolPromise;
      const result = await pool.request().query(sql);

      if (result.recordset.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.status(404).json({ message: "Call status not found" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred while fetching data" });
    }
  });
// Update for Callstatus
app.post("/putcalldata", authenticateToken, async (req, res) => {
  const { Callstatus, id } = req.body;

  const checkDuplicateSql = `SELECT * FROM call_status WHERE Callstatus = '${Callstatus}' AND id != '${id}' AND deleted = 0`;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(checkDuplicateSql);

    if (result.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Callstatus already exists!" });
    } else {
      const updateSql = `UPDATE call_status SET Callstatus = '${Callstatus}' WHERE id = '${id}'`;
      await pool.request().query(updateSql);
      return res.json({ message: "Callstatus updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating Callstatus" });
  }
});
// Delete for Callstatus
app.post("/deletecalldata", authenticateToken, async (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE call_status SET deleted = 1 WHERE id = '${id}'`;

  try {
    const pool = await poolPromise;
    await pool.request().query(sql);
    return res.json({ message: "Record soft-deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user" });
  }
});
//call status end

//service agent  code start
// Service agent code
app.get("/getsdata", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch service agent records that are not deleted
    const sql = "SELECT * FROM service_agent WHERE deleted = 0";
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching service agent data" });
  }
});

// Insert for serviceagent
app.post("/postsdata", authenticateToken, async (req, res) => {
  const { id, serviceagent, created_by } = req.body;

  try {
    const pool = await poolPromise;

    if (id) {
      // Step 1: Check if the same serviceagent exists and is not soft-deleted for other IDs
      const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = '${serviceagent}' AND id != ${id} AND deleted = 0`;
      const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

      if (checkDuplicateResult.recordset.length > 0) {
        // If duplicate data exists for another ID
        return res.status(409).json({ message: "Duplicate entry, serviceagent already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `UPDATE service_agent SET serviceagent = '${serviceagent}', updated_date = GETDATE(), updated_by = '${created_by}' WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "serviceagent updated successfully!" });
      }
    } else {
      // Step 3: Same logic as before for insert if ID is not provided
      // Check if the same serviceagent exists and is not soft-deleted
      const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = '${serviceagent}' AND deleted = 0`;
      const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

      if (checkDuplicateResult.recordset.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res.status(409).json({ message: "Duplicate entry, serviceagent already exists!" });
      } else {
        // Check if the same serviceagent exists but is soft-deleted
        const checkSoftDeletedSql = `SELECT * FROM service_agent WHERE serviceagent = '${serviceagent}' AND deleted = 1`;
        const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedResult.recordset.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `UPDATE service_agent SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}' WHERE serviceagent = '${serviceagent}'`;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new entry if no duplicates found
          const insertSql = `INSERT INTO service_agent (serviceagent, created_date, created_by) VALUES ('${serviceagent}', GETDATE(), '${created_by}')`;
          await pool.request().query(insertSql);
          return res.json({ message: "serviceagent added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing data" });
  }
});

// Edit for serviceagent
app.get("/requestsdata/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch service agent record by id that is not deleted
    const sql = `SELECT * FROM service_agent WHERE id = ${id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]); // Return the first record if found
    } else {
      return res.status(404).json({ message: "Service agent not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the service agent data" });
  }
});

// Update for serviceagent
app.post("/putsdata", authenticateToken, async (req, res) => {
  const { id, serviceagent, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the updated serviceagent already exists and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM service_agent WHERE serviceagent = '${serviceagent}' AND deleted = 0 AND id != ${id}`;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate data exists
      return res.status(409).json({ message: "Duplicate entry, serviceagent already exists!" });
    } else {
      // Step 2: Update serviceagent data if no duplicates found
      const updateSql = `UPDATE service_agent SET serviceagent = '${serviceagent}', updated_by = '${updated_by}', updated_date = GETDATE() WHERE id = ${id} AND deleted = 0`;
      await pool.request().query(updateSql);
      return res.json({ message: "serviceagent updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating the service agent data" });
  }
});
// Delete for serviceagent
app.post("/deletesdata", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to soft-delete the service agent by setting deleted = 1
    const sql = `UPDATE service_agent SET deleted = 1 WHERE id = ${id}`;
    const result = await pool.request().query(sql);

    return res.json(result); // Return the result from the query
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating user" });
  }
});
//serviceagent end

// Start Complaint View

app.get("/getcomplaintview/:complaintid", authenticateToken, async (req, res) => {
  const { complaintid } = req.params;

  try {
    const pool = await poolPromise;

    // SQL query to fetch the complaint_ticket by id that is not deleted
    const sql = `SELECT * FROM complaint_ticket WHERE id = ${complaintid} AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]); // Return the first record if found
    } else {
      return res.status(404).json({ message: "Complaint not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint data" });
  }
});

app.post("/addcomplaintremark", authenticateToken, async (req, res) => {
  const { ticket_no, note, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to insert a new complaint remark
    const sql = `INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
                    VALUES (${ticket_no}, '${note}', ${created_by}, GETDATE())`;
    const result = await pool.request().query(sql);

    res.json({ insertId: result.rowsAffected[0] }); // Send the inserted ID back to the client
  } catch (err) {
    console.error("Error inserting remark:", err);
    return res.status(500).json({ error: "Database error", details: err.message }); // Send back more details for debugging
  }
});

// app.post("/uploadcomplaintattachments", upload.array("attachment"), async (req, res) => {
//   const { ticket_no, remark_id, created_by } = req.body;

//   if (!req.files || req.files.length === 0) {
//     return res.status(400).json({ error: "No files uploaded" });
//   }

//   // Combine filenames into a single string
//   const attachments = req.files.map((file) => file.filename); // Get all filenames
//   const attachmentString = attachments.join(", "); // For a comma-separated string

//   try {
//     const pool = await poolPromise;

//     // SQL query to insert attachments
//     const sql = `INSERT INTO awt_complaintattachment (remark_id, ticket_no, attachment, created_by, created_date)
//                     VALUES (${remark_id}, ${ticket_no}, '${attachmentString}', '${created_by}', GETDATE())`;
//     const result = await pool.request().query(sql);

//     res.json({
//       message: "Files uploaded successfully",
//       count: 1, // Only one entry created
//     });
//   } catch (err) {
//     console.error("Error inserting attachments:", err);
//     return res.status(500).json({ error: "Database error", details: err.message });
//   }
// });

app.get("/getComplaintDetails/:ticket_no", authenticateToken, async (req, res) => {
  const ticket_no = req.params.ticket_no;

  try {
    const pool = await poolPromise;

    // Query for remarks
    const remarkQuery = `SELECT ac.*, lu.Lhiuser
                         FROM awt_complaintremark AS ac
                         LEFT JOIN lhi_user AS lu ON lu.id = ac.created_by
                         WHERE ac.ticket_no = '${ticket_no}'`;
    const remarkResult = await pool.request().query(remarkQuery);

    // Query for attachments
    const attachmentQuery = `SELECT * FROM awt_complaintattachment WHERE ticket_no = '${ticket_no}'`;
    const attachmentResult = await pool.request().query(attachmentQuery);

    // Return the results
    res.json({ remarks: remarkResult.recordset, attachments: attachmentResult.recordset });

  } catch (err) {
    console.error("Error fetching complaint details:", err);
    return res.status(500).json({ error: "Error fetching complaint details", details: err.message });
  }
});

// app
//.get("/getComplaintDuplicate/:customer_mobile", async (req, res) => {
//   const customer_mobile = req.params.customer_mobile;

//   try {
//     const pool = await poolPromise;

//     // Query to fetch complaint tickets based on customer_mobile
//     const sql = `SELECT * FROM complaint_ticket WHERE customer_mobile = '${customer_mobile}' AND deleted = 0 ORDER BY id DESC`;
//     const result = await pool.request().query(sql);

//     // Send the result back to the client
//     res.json(result.recordset);

//   } catch (err) {
//     console.error("Error fetching complaint duplicate:", err);
//     return res.status(500).json({ error: "Error fetching complaint duplicate", details: err.message });
//   }
// });
// End Complaint View
// y end

app.get("/product_type", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id , product_type FROM product_type WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});
app.get("/fetchproductline",
  authenticateToken, async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT id , pline_code, product_line FROM product_line WHERE deleted = 0");
      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching product types' });
    }
  });
app.get("/fetchmaterial", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id ,  Material FROM material WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});
app.get("/fetchitemtype", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id , title FROM item_type ");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});
app.get("/fetchproductclass", authenticateToken,
  async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT id , class_code , product_class FROM product_class ");
      return res.json(result.recordset);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while fetching product types' });
    }
  });
app.get("/fetchmanufacturer", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id , Manufacturer FROM manufacturer ");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});

app.post("/getupdateparam", authenticateToken, async (req, res) => {

  const { productid } = req.body;
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM product_master where id = ${productid}`);


    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});

app.post("/addProduct", authenticateToken,
  async (req, res) => {
    const { item_code, item_description, product_model, product_type, product_class_code, product_class, product_line_code, product_line, material, manufacturer, item_type, serialized, size, crmproducttype, colour, handle_type, serial_identification, installation_type, customer_classification, price_group, mrp, service_partner_basic } = req.body;


    try {
      const pool = await poolPromise;
      // SQL query to insert a new complaint remark
      const sql = `INSERT INTO product_master (serial_no,item_code, item_description, itemCode,item_description,productType,productLineCode,productLine,productClassCode,productClass,material,manufacturer,itemType,serialized,sizeProduct,crm_productType,color,installationType,handleType,customerClassification,price_group,mrp,service_partner_basic)VALUES (@serial_identification,@item_code,@item_description,@item_code,@product_model,@product_type,@product_line_code,@product_line,@product_class_code,@product_class,@material,@manufacturer,@item_type,@serialized,@size,@crmproducttype,@colour,@installation_type,@handle_type,@customer_classification,@price_group,@mrp,@service_partner_basic);`;



      const request = pool.request()
        .input('item_code', item_code)
        .input('item_description', item_description)
        .input('product_model', product_model)
        .input('product_type', product_type)
        .input('product_class_code', product_class_code)
        .input('product_class', product_class)
        .input('product_line_code', product_line_code)
        .input('product_line', product_line)
        .input('material', material)
        .input('manufacturer', manufacturer)
        .input('item_type', item_type)
        .input('serialized', serialized)
        .input('size', size)
        .input('crmproducttype', crmproducttype)
        .input('colour', colour)
        .input('handle_type', handle_type)
        .input('serial_identification', serial_identification)
        .input('installation_type', installation_type)
        .input('customer_classification', customer_classification)
        .input('price_group', price_group)
        .input('mrp', mrp)
        .input('service_partner_basic', service_partner_basic);


      console.log(sql)

      const result = await request.query(sql);

      res.json({ insertId: result.rowsAffected[0] }); // Send the inserted ID back to the client
    } catch (err) {
      console.error("Error inserting remark:", err);
      return res.status(500).json({ error: "Database error", details: err.message }); // Send back more details for debugging
    }
  });


app.post("/updateProduct", authenticateToken,
  async (req, res) => {
    const {
      item_code, item_description, product_model, product_type, product_class_code, product_class,
      product_line_code, product_line, material, manufacturer, item_type, serialized, size,
      crmproducttype, colour, handle_type, serial_identification, installation_type,
      customer_classification, price_group, mrp, service_partner_basic, uid
    } = req.body;

    try {
      const pool = await poolPromise;

      // SQL query to update an existing product
      const sql = `
      UPDATE product_master
      SET
        serial_no = @serial_identification,
        item_code = @item_code,
        item_description = @item_description,
        product_model = @product_model,
        productType = @product_type,
        productLineCode = @product_line_code,
        productLine = @product_line,
        productClassCode = @product_class_code,
        productClass = @product_class,
        material = @material,
        manufacturer = @manufacturer,
        itemType = @item_type,
        serialized = @serialized,
        sizeProduct = @size,
        crm_productType = @crmproducttype,
        color = @colour,
        installationType = @installation_type,
        handleType = @handle_type,
        customerClassification = @customer_classification,
        price_group = @price_group,
        mrp = @mrp,
        service_partner_basic = @service_partner_basic
      WHERE id = @uid;
    `;

      const request = pool.request()
        .input('item_code', item_code)
        .input('item_description', item_description)
        .input('product_model', product_model)
        .input('product_type', product_type)
        .input('product_class_code', product_class_code)
        .input('product_class', product_class)
        .input('product_line_code', product_line_code)
        .input('product_line', product_line)
        .input('material', material)
        .input('manufacturer', manufacturer)
        .input('item_type', item_type)
        .input('serialized', serialized)
        .input('size', size)
        .input('crmproducttype', crmproducttype)
        .input('colour', colour)
        .input('handle_type', handle_type)
        .input('serial_identification', serial_identification)
        .input('installation_type', installation_type)
        .input('customer_classification', customer_classification)
        .input('price_group', price_group)
        .input('mrp', mrp)
        .input('service_partner_basic', service_partner_basic)
        .input('uid', uid); // Adding uid for the WHERE clause

      const result = await request.query(sql);

      res.json({ affectedRows: result.rowsAffected[0] }); // Send the affected rows count back to the client
    } catch (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
  });
//Complaint view Insert TicketFormData start

app.post("/ticketFormData", authenticateToken, async (req, res) => {
  const { ticket_no, serial_no, ModelNumber, engineerdata, call_status, sub_call_status, updated_by, group_code, site_defect, defect_type, engineername, activity_code } = req.body;


  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  let engineer_id;

  engineer_id = engineerdata.join(','); // Join the engineer IDs into a comma-separated string

  let engineer_name;

  engineer_name = engineername.join(',');


  const concatremark = `Call Status: ${call_status} , Engineer Name : ${engineer_name} , Sub Call Stutus : ${sub_call_status} ,Group Code : ${group_code} , Site Defect : ${site_defect} , Defect Type : ${defect_type} `




  try {
    const pool = await poolPromise;

    const reamrks = `
    INSERT INTO awt_complaintremark (
        ticket_no, remark, created_date, created_by
    )
    VALUES (
        @ticket_no, @additional_remarks, @formattedDate, @created_by
    )`;


    await pool.request()
      .input('ticket_no', ticket_no) // Use existing ticket_no from earlier query
      .input('formattedDate', formattedDate) // Use current timestamp
      .input('created_by', updated_by) // Use current user ID
      .input('additional_remarks', concatremark) // Use current user ID
      .query(reamrks);


    const updateSql = `
      UPDATE complaint_ticket
      SET engineer_id = '${engineer_id}',call_status = '${call_status}' , updated_by = '${updated_by}', updated_date = '${formattedDate}' , sub_call_status  = '${sub_call_status}' ,group_code = '${group_code}' , defect_type = '${defect_type}'
       , site_defect = '${site_defect}' ,assigned_to = '${engineer_name}',activity_code = '${activity_code}'   WHERE ticket_no = '${ticket_no}'`;

    await pool.request().query(updateSql);

    return res.status(200).json({ message: "Ticket Formdata updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.json(err)
    // return res.status(500).json({ error: "An error occurred while updating the ticket" });
  }
});


app.post("/add_new_ticket", authenticateToken, async (req, res) => {
  console.log('test');

  const {
    customer_name,
    email,
    mobile,
    cust_id,
    product_id,
    serial_no,
    address,
    created_by,
    state,
    city,
    area,
    pincode,
    customerId
  } = req.body;

  const formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const pool = await poolPromise;

    const productdetail = `select * from awt_uniqueproductmaster where CustomerID = '${customerId}'`
    const productdetailquery = await pool.request()
      .query(productdetail);

    console.log(productdetail);

    const details = productdetailquery.recordset[0];

    // Ensure purchase_date is a valid Date object
    const purchaseDate = new Date(details.purchase_date);

    // Format the date as yyyy-mm-dd
    const purchaseDateFormatted = purchaseDate.toISOString().slice(0, 10);

    console.log(purchaseDateFormatted); // Outputs: yyyy-mm-dd



    // Insert complaint ticket and return the inserted ID
    const complaintSQL = `
      INSERT INTO complaint_ticket (
        customer_name, customer_mobile, customer_email, address,
        customer_id, ModelNumber,serial_no,state,city,area,pincode, created_date, created_by,purchase_date,invoice_date
      )
      OUTPUT INSERTED.id
      VALUES (
        @customer_name, @mobile, @email, @address,
        @customer_id, @model,@serial_no,@state, @city,@area,@pincode, @formattedDate, @created_by,@purchase_date,@invoice_date
      )
    `;

    const result = await pool
      .request()
      .input("customer_name", sql.NVarChar, details.CustomerName)
      .input("mobile", sql.NVarChar, mobile)
      .input("email", sql.NVarChar, email)
      .input("address", sql.NVarChar, address)
      .input("customer_id", sql.Int, cust_id)
      .input("model", sql.NVarChar, details.ModelNumber)
      .input("serial_no", details.serial_no)
      .input("state", sql.NVarChar, details.state)
      .input("city", sql.NVarChar, details.city)
      .input("area", sql.NVarChar, details.district)
      .input("pincode", sql.NVarChar, details.pincode)
      .input("formattedDate", sql.DateTime, formattedDate)
      .input("created_by", sql.NVarChar, created_by)
      .input("purchase_date", purchaseDateFormatted)
      .input("invoice_date", purchaseDateFormatted)
      .query(complaintSQL);

    const insertedId = result.recordset[0].id;


    // Fetch the newly created complaint ticket
    const getComplaintRow = `
      SELECT *
      FROM complaint_ticket
      WHERE id = @id
    `;

    const result2 = await pool
      .request()
      .input("id", sql.Int, insertedId)
      .query(getComplaintRow);

    return res.status(200).json({
      message: "Ticket Form data added successfully!",
      id: insertedId,
      rowdata: result2.recordset,
    });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the ticket.", "Error": err });
  }
});

app.post("/getcustinfo", authenticateToken, async (req, res) => {

  const { cust_id } = req.body;

  try {
    const pool = await poolPromise;

    const getcustinfo = `select * from awt_customer where deleted = 0 and customer_id = '${cust_id}'`;

    const productdetailquery = await pool.request().query(getcustinfo);

    console.log(productdetailquery)

    return res.json(productdetailquery.recordset)




  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the ticket.", "Error": err });
  }
});


app.post("/updatestatus", authenticateToken, async (req, res) => {
  const { dataId } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `SELECT * FROM lhi_user WHERE id = @dataId`;

    // Execute the query to get the user
    const request = await pool.request()
      .input('dataId', dataId)
      .query(sql);

    // Check if records exist
    if (request.recordset.length > 0) {
      const status = request.recordset[0].status;
      console.log(request.recordset[0].status);
      let query;
      if (status == 1) {
        // If status is 1, deactivate and set activation date
        query = `UPDATE lhi_user
                 SET status = 0, deactivation_date = GETDATE()
                 WHERE id = @dataId`;
      } else {
        // If status is not 1, deactivate and set deactivation date
        query = `UPDATE lhi_user
                 SET status = 1, activation_date = GETDATE()
                 WHERE id = @dataId`;
      }

      // Execute the update query
      const update = await pool.request()
        .input('dataId', dataId)
        .query(query);

      // Send the response back with rows affected
      return res.json({ status: update.rowsAffected[0] });
    } else {
      // If no user found with the provided dataId
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: 'Error updating status' });
  }
});








app.get("/getcomplainlist", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      fromDate,
      toDate,
      customerName,
      customerEmail,
      serialNo,
      productCode,
      customerMobile,
      ticketno,
      status,
      customerID,
      page = 1,
      pageSize = 10,
      csp,
      msp,
      mode_of_contact,
      customer_class,
      Priority,
      upcoming = 'current'
    } = req.query;

    const offset = (page - 1) * pageSize;

    const currentDate = new Date().toISOString().split('T')[0]

    // console.log(currentDate, "$$$")

    let sql = `
        SELECT c.*,
               DATEDIFF(DAY, c.ticket_date, GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        WHERE c.deleted = 0`;

    let countSql = `
        SELECT COUNT(*) AS totalCount
        FROM complaint_ticket AS c
        WHERE c.deleted = 0`;

    let params = [];

    // Filtering conditions
    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate AND @toDate`;
      countSql += ` AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate AND @toDate`;
      params.push({ name: "fromDate", value: fromDate }, { name: "toDate", value: toDate });
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE @customerName`;
      countSql += ` AND c.customer_name LIKE @customerName`;
      params.push({ name: "customerName", value: `%${customerName}%` });
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE @customerEmail`;
      countSql += ` AND c.customer_email LIKE @customerEmail`;
      params.push({ name: "customerEmail", value: `%${customerEmail}%` });
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE @customerMobile`;
      countSql += ` AND c.customer_mobile LIKE @customerMobile`;
      params.push({ name: "customerMobile", value: `%${customerMobile}%` });
    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE @serialNo`;
      countSql += ` AND c.serial_no LIKE @serialNo`;
      params.push({ name: "serialNo", value: `%${serialNo}%` });
    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE @productCode`;
      countSql += ` AND c.ModelNumber LIKE @productCode`;
      params.push({ name: "productCode", value: `%${productCode}%` });
    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE @ticketno`;
      countSql += ` AND c.ticket_no LIKE @ticketno`;
      params.push({ name: "ticketno", value: `%${ticketno}%` });
    }

    if (customerID) {
      sql += ` AND c.customer_id LIKE @customerID`;
      countSql += ` AND c.customer_id LIKE @customerID`;
      params.push({ name: "customerID", value: `%${customerID}%` });
    }

    if (csp) {
      sql += ` AND c.csp LIKE @csp`;
      countSql += ` AND c.csp LIKE @csp`;
      params.push({ name: "csp", value: `%${csp}%` });
    }

    if (msp) {
      sql += ` AND c.msp LIKE @msp`;
      countSql += ` AND c.msp LIKE @msp`;
      params.push({ name: "msp", value: `%${msp}%` });
    }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE @mode_of_contact`;
      countSql += ` AND c.mode_of_contact LIKE @mode_of_contact`;
      params.push({ name: "mode_of_contact", value: `%${mode_of_contact}%` });
    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE @customer_class`;
      countSql += ` AND c.customer_class LIKE @customer_class`;
      params.push({ name: "customer_class", value: `%${customer_class}%` });
    }

    if (status) {
      sql += ` AND c.call_status = @status`;
      countSql += ` AND c.call_status = @status`;
      params.push({ name: "status", value: status });
    } else {
      sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
    }

    if (upcoming == 'current') {
      sql += ` AND ticket_date <= @currentdate`;
      countSql += ` AND ticket_date <= @currentdate`;
      params.push({ name: "currentdate", value: currentDate });


    } else {
      sql += ` AND ticket_date > @currentdate`;
      countSql += ` AND ticket_date > @currentdate`;

      params.push({ name: "currentdate", value: currentDate });

    }

    // Sorting by call_priority and ticket_date for additional ordering

    if (upcoming == 'current') {
      sql += `
      ORDER BY
        CASE
          WHEN c.call_priority = 'High' THEN 1
          WHEN c.call_priority = 'Regular' THEN 2
          ELSE 3
        END,
        c.ticket_date DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;







      params.push(
        { name: "offset", value: offset },
        { name: "pageSize", value: parseInt(pageSize) }
      );

    } else {
      sql += `
      ORDER BY
        CASE
          WHEN c.call_priority = 'High' THEN 1
          WHEN c.call_priority = 'Regular' THEN 2
          ELSE 3
        END,
        c.ticket_date DESC`;



    }




    // Execute queries
    const request = pool.request();
    params.forEach((param) => request.input(param.name, param.value));
    const result = await request.query(sql);

    const countRequest = pool.request();
    params.forEach((param) => countRequest.input(param.name, param.value));
    const countResult = await countRequest.query(countSql);

    const totalCount = countResult.recordset[0].totalCount;

    return res.json({
      data: result.recordset,
      totalCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("Error fetching complaint list:", err.message);
    return res.status(500).json({
      message: "An error occurred while fetching the complaint list",
      err: err.message
    });
  }
});





// CSP complaint list

// CSP complaint list

app.get("/getcomplainlistcsp", authenticateToken, async (req, res) => {
  const { licare_code } = req.query;

  try {
    const pool = await poolPromise;
    const {
      fromDate,
      toDate,
      customerName,
      customerEmail,
      serialNo,
      productCode,
      customerMobile,
      ticketno,
      status,
      customerID,
      csp,
      msp,
      mode_of_contact,
      customer_class,
      page = 1, // Default to page 1
      pageSize = 10 // Default to 10 items per page
    } = req.query;


    let sql = `
        SELECT c.*,
        DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        WHERE c.deleted = 0 AND c.csp = '${licare_code}'
    `;

    // Fetch total count of records (without pagination)
    let countSql = `
        SELECT COUNT(*) AS totalRecords
        FROM complaint_ticket AS c
        WHERE c.deleted = 0 AND c.csp = '${licare_code}'
      `;



    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) >= CAST('${fromDate}' AS DATE)
                AND CAST(c.ticket_date AS DATE) <= CAST('${toDate}' AS DATE)`;
      countSql += ` AND CAST(c.ticket_date AS DATE) >= CAST('${fromDate}' AS DATE)
                AND CAST(c.ticket_date AS DATE) <= CAST('${toDate}' AS DATE)`
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE '%${customerName}%'`;
      countSql += ` AND c.customer_name LIKE '%${customerName}%'`
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
      countSql += ` AND c.customer_email LIKE '%${customerEmail}%'`
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
      countSql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`

    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE '%${serialNo}%'`;
      countSql += ` AND c.serial_no LIKE '%${serialNo}%'`

    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
      countSql += ` AND c.ModelNumber LIKE '%${productCode}%'`

    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
      countSql += ` AND c.ticket_no LIKE '%${ticketno}%'`

    }
    if (customerID) {
      sql += ` AND c.customer_id LIKE '%${customerID}%'`;
      countSql += ` AND c.customer_id LIKE '%${customerID}%'`

    }

    if (csp) {
      sql += ` AND c.csp LIKE '%${csp}%'`;
      countSql += ` AND c.csp LIKE '%${csp}%'`

    }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
      countSql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`

    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      countSql += ` AND c.customer_class LIKE '%${customer_class}%'`

    }

    if (status) {
      sql += ` AND c.call_status = '${status}'`;
      countSql += ` AND c.call_status = '${status}'`

    } else {
      sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`

    }

    if (status == undefined) {
      sql += ``;
    }

    // Add ORDER BY and pagination
    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY c.id DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);


    const countResult = await pool.request().query(countSql);
    const totalRecords = countResult.recordset[0].totalRecords;

    // Respond with data and pagination details
    return res.json({
      data: result.recordset,
      totalRecords,
      currentPage: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      page: parseInt(Math.ceil(totalRecords / pageSize)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});



app.get("/getcsplistmsp", authenticateToken, async (req, res) => {
  const { licare_code, page = 1, pageSize = 10 } = req.query;

  try {
    // Validate input
    if (!licare_code) {
      return res.status(400).json({ message: "licare_code is required" });
    }

    const pool = await poolPromise;

    // Sanitize and validate pagination parameters
    const currentPage = Math.max(parseInt(page, 10) || 1, 1); // Default to page 1
    const size = Math.max(parseInt(pageSize, 10) || 10, 1); // Default to 10 items per page
    const offset = (currentPage - 1) * size;

    // Total count query
    const countSql = `
      SELECT COUNT(*) AS totalRecords
      FROM awt_childfranchisemaster
      WHERE pfranchise_id = @licare_code
    `;

    // Main data query with pagination
    const dataSql = `
      SELECT *
      FROM awt_childfranchisemaster
      WHERE pfranchise_id = @licare_code
      ORDER BY id DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `;

    console.log(dataSql);

    // Execute total count query
    const countResult = await pool.request()
      .input("licare_code", sql.VarChar, licare_code)
      .query(countSql);

    const totalRecords = countResult.recordset[0].totalRecords;

    // Execute paginated data query
    const dataResult = await pool.request()
      .input("licare_code", sql.VarChar, licare_code)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, size)
      .query(dataSql);

    // Respond with data and pagination details
    return res.json({
      data: dataResult.recordset,
      totalRecords,
      currentPage,
      pageSize: size,
      page: parseInt(Math.ceil(totalRecords / size)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});


app.get("/engineeringlisting", authenticateToken, async (req, res) => {
  const { licare_code, page = 1, pageSize = 10 } = req.query;

  try {
    // Validate input
    if (!licare_code) {
      return res.status(400).json({ message: "licare_code is required" });
    }

    const pool = await poolPromise;

    // Sanitize and validate pagination parameters
    const currentPage = Math.max(parseInt(page, 10) || 1, 1); // Default to page 1
    const size = Math.max(parseInt(pageSize, 10) || 10, 1); // Default to 10 items per page
    const offset = (currentPage - 1) * size;

    // Total count query
    const countSql = `
       SELECT COUNT(*) as totalRecords
    FROM awt_engineermaster
    WHERE cfranchise_id = RIGHT(@licare_code, LEN(@licare_code) - 2)`;

    // Main data query with pagination
    const dataSql = `
    SELECT *
    FROM awt_engineermaster
    WHERE cfranchise_id = RIGHT(@licare_code, LEN(@licare_code) - 2)
    ORDER BY id DESC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
  `;


    // console.log(dataSql);

    // Execute total count query
    const countResult = await pool.request()
      .input("licare_code", sql.VarChar, licare_code)
      .query(countSql);

    const totalRecords = countResult.recordset[0].totalRecords;

    // Execute paginated data query
    const dataResult = await pool.request()
      .input("licare_code", sql.VarChar, licare_code)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, size)
      .query(dataSql);

    // Respond with data and pagination details
    return res.json({
      data: dataResult.recordset,
      totalRecords,
      currentPage,
      pageSize: size,
      page: parseInt(Math.ceil(totalRecords / size)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});


//CSP LIST END


//MSP complaint list

app.get("/getcomplainlistmsp", authenticateToken, async (req, res) => {
  const { licare_code, page = 1, pageSize = 10 } = req.query;

  try {
    const pool = await poolPromise;
    const {
      fromDate,
      toDate,
      customerName,
      customerEmail,
      serialNo,
      productCode,
      customerMobile,
      ticketno,
      status,
      customerID,
      msp,
      mode_of_contact,
      customer_class,
    } = req.query;

    const offset = (page - 1) * pageSize;

    let sql = `
        SELECT c.*, e.title as assigned_name,
               DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        JOIN awt_engineermaster AS e ON c.engineer_id = e.engineer_id
        WHERE c.deleted = 0 AND c.msp = '${licare_code}'
    `;
    let countSql = `
        SELECT COUNT(*) as totalCount
        FROM complaint_ticket AS c
        JOIN awt_engineermaster AS e ON c.engineer_id = e.engineer_id
        WHERE c.deleted = 0 AND c.msp = '${licare_code}'
    `;

    // Dynamic filters
    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE)`;
      countSql += ` AND CAST(c.ticket_date AS DATE) BETWEEN CAST('${fromDate}' AS DATE) AND CAST('${toDate}' AS DATE)`;
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE '%${customerName}%'`;
      countSql += ` AND c.customer_name LIKE '%${customerName}%'`;
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
      countSql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
      countSql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE '%${serialNo}%'`;
      countSql += ` AND c.serial_no LIKE '%${serialNo}%'`;
    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
      countSql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
      countSql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
    }

    if (customerID) {
      sql += ` AND c.customer_id LIKE '%${customerID}%'`;
      countSql += ` AND c.customer_id LIKE '%${customerID}%'`;
    }

    if (msp) {
      sql += ` AND c.msp LIKE '%${msp}%'`;
      countSql += ` AND c.msp LIKE '%${msp}%'`;
    }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
      countSql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      countSql += ` AND c.customer_class LIKE '%${customer_class}%'`;
    }

    // Status filtering
    if (status === 'Closed' || status === 'Cancelled') {
      sql += ` AND c.call_status = '${status}'`;
      countSql += ` AND c.call_status = '${status}'`;
    } else if (status) {

      sql += ` AND c.call_status = '${status}'`;
      countSql += ` AND c.call_status = '${status}'`;
    } else {
      sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
    }

    // Add pagination
    sql += `
      ORDER BY c.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;





    // Execute the queries
    const dataResult = await pool.request().query(sql);
    const countResult = await pool.request().query(countSql);

    return res.json({
      data: dataResult.recordset,
      totalCount: countResult.recordset[0].totalCount,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("Error fetching complaint list:", err.message);
    return res.status(500).json({
      message: "An error occurred while fetching the complaint list",
      error: err.message,
    });
  }
});

//MSP complaint list

// end Complaint list


//Register Page Complaint Duplicate Start

app.get("/getmultiplelocation/:pincode/:classification", authenticateToken, async (req, res) => {
  const { pincode, classification } = req.params;



  try {

    const pool = await poolPromise;

    const sql = `SELECT cn.title as country, p.region_name as region, p.geostate_name as state, p.area_name as district, p.geocity_name as city, o.account_manager as msp, f.title as mspname, o.owner as csp, fm.title as cspname,  p.pincode
    FROM awt_pincode as p
    LEFT JOIN awt_region as r on p.region_id = r.id
    LEFT JOIN awt_country as cn on p.country_id = cn.id
    LEFT JOIN awt_geostate as s on p.geostate_id = s.id
    LEFT JOIN awt_district as d on p.area_id = d.id
    LEFT JOIN awt_geocity as c on p.geocity_id = c.id
    LEFT JOIN pincode_allocation as o on p.pincode = o.pincode
	LEFT JOIN awt_franchisemaster as f on f.licarecode = o.account_manager
	LEFT JOIN awt_childfranchisemaster as fm on fm.licare_code = o.owner
	where p.pincode = ${pincode} and o.customer_classification = '${classification}'`

    const result = await pool.request().query(sql);

    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});




app.get("/getserial/:serial", authenticateToken, async (req, res) => {
  const { serial } = req.params;

  try {

    const pool = await poolPromise;

    const sql = `	SELECT
    asl.*,
    spm.SalesPartner,
    spm.SalesAM,
    CASE
        WHEN asl.CountryofOrigin = 'India' THEN 'Consumer'
        ELSE 'Import'
    END AS customerClassification
FROM
    awt_serial_list AS asl
LEFT JOIN
    SalesPartnerMaster AS spm
ON
    asl.PrimarySalesDealer = spm.BPcode
WHERE
    asl.serial_no = @serial;
`

    const result = await pool.request()
      .input('serial', serial)
      .query(sql);



    const fallbackSql = `SELECT ac.salutation , ac.customer_fname ,ac.customer_lname , ac.customer_type , ac.customer_classification , ac.mobileno , ac.alt_mobileno,ac.email ,
au.CustomerID , au.ModelNumber , au.address , au.region , au.state ,au.district , au.city , au.pincode ,au.purchase_date,au.SalesDealer as SalesPartner,au.serial_no , au.SubDealer as SalesAM , au.customer_classification as customerClassification
FROM awt_uniqueproductmaster as au
left join awt_customer as ac on ac.customer_id = au.CustomerID
WHERE au.serial_no = @serial order by au.id desc`;

    const fallbackResult = await pool.request()
      .input('serial', serial)
      .query(fallbackSql);

    if (fallbackResult.recordset.length !== 0) {

      return res.json(fallbackResult.recordset);

    } else {

      return res.json(result.recordset);

    }





  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});


app.post("/getcomplaintticket", authenticateToken,
  async (req, res) => {
    const { comp_no } = req.body;

    try {
      const pool = await poolPromise;

      // Modified SQL query using parameterized query
      const sql = "SELECT t.*, f.title AS franchisee, c.title AS childPartner FROM complaint_ticket AS t LEFT JOIN awt_childfranchisemaster AS c ON c.licare_code = t.child_service_partner LEFT JOIN awt_franchisemaster AS f ON f.licarecode = c.pfranchise_id WHERE t.ticket_no = @comp_no";

      const result = await pool.request()
        .input('comp_no', comp_no) // Parameterized input
        .query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

//Register Page Complaint Duplicate End

app.get("/getcallstatus", authenticateToken,
  async (req, res) => {


    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = "select id, Callstatus from call_status where deleted = 0";

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.post("/getsubcallstatus", authenticateToken,
  async (req, res) => {
    const { Status_Id } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `select id, SubCallstatus from sub_call_status where deleted = 0 and Callstatus_Id = ${Status_Id}`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.get("/getsubcallstatusdata", authenticateToken,
  async (req, res) => {



    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `select id, SubCallstatus from sub_call_status where deleted = 0 `;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.post("/getupdateengineer", authenticateToken,
  async (req, res) => {

    const { eng_id } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `
    SELECT *
    FROM awt_engineermaster
    WHERE deleted = 0
      AND engineer_id IN (
          SELECT value
          FROM STRING_SPLIT('${eng_id}', ',')
      )
`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });
app.post("/getupdateengineer", authenticateToken,
  async (req, res) => {

    const { eng_id } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `
    SELECT *
    FROM awt_engineermaster
    WHERE deleted = 0
      AND engineer_id IN (
          SELECT value
          FROM STRING_SPLIT('${eng_id}', ',')
      )
`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.post("/getupdatesparelist", authenticateToken,
  async (req, res) => {

    const { ticket_no } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `
    SELECT * FROM awt_quotation
    WHERE deleted = 0 and ticketId = '${ticket_no}'`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

// register complaint page search customer address from end customer location
app.get("/getEndCustomerAddresses/:customerEndId", authenticateToken, async (req, res) => {
  const { customerEndId } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject the `id` into the query string
    const sql = `SELECT * FROM awt_customerlocation WHERE customer_id =  '${customerEndId}' AND deleted = 0 order by id desc`;

    // Execute the SQL query

    console.log("Get Customer Address", sql)
    const result = await pool.request().query(sql);

    return res.json(result.recordset
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching  Multiple End customer location" });
  }
});

app.get("/getSpareParts/:model", authenticateToken, async (req, res) => {
  const { model } = req.params;



  try {
    const pool = await poolPromise;
    // Parameterized query
    const sql = `
      SELECT id, ModelNumber, title as article_code ,ProductCode as spareId, ItemDescription as article_description
      FROM Spare_parts
      WHERE deleted = 0 AND ModelNumber = @model
    `;

    const result = await pool.request()
      .input("model", model) // Specify the data type for the parameter
      .query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});



app.post("/getDefectCodewisetype", authenticateToken,
  async (req, res) => {

    const { defect_code } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `SELECT * FROM awt_typeofdefect  where groupdefect_code = ${defect_code}`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.post("/getDefectCodewisesite", authenticateToken,
  async (req, res) => {

    const { defect_code } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `SELECT * FROM awt_site_defect  where defectgroupcode = ${defect_code}`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

// Quotation Listing
app.get("/getquotationlist", authenticateToken, async (req, res) => {
  try {
    const {
      ticketId,
      spareId,
      ModelNumber,
      title,
      quantity,
      price,
      quotationNumber,
      assignedEngineer,
      CustomerName,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    let sql = `SELECT q.* FROM awt_quotation as q WHERE 1=1`;

    if (CustomerName) {
      sql += ` AND q.CustomerName LIKE '%${CustomerName}%'`;
    }

    if (quotationNumber) {
      sql += ` AND q.quotationNumber LIKE '%${quotationNumber}%'`;
    }

    if (ModelNumber) {
      sql += ` AND q.ModelNumber LIKE '%${ModelNumber}%'`;
    }

    if (title) {
      sql += ` AND q.title LIKE '%${title}%'`;
    }

    if (quantity) {
      sql += ` AND q.quantity LIKE '%${quantity}%'`;
    }
    if (price) {
      sql += ` AND q.price LIKE '%${price}%'`;
    }
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY q.quotationNumber OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute the query
    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_quotation where 1=1 `;
    if (quotationNumber) countSql += ` AND quotationNumber LIKE '%${quotationNumber}%'`;
    if (assignedEngineer) countSql += ` AND assignedEngineer LIKE '%${assignedEngineer}%'`;

    if (CustomerName) countSql += ` AND CustomerName LIKE '%${CustomerName}%'`;
    if (spareId) countSql += ` AND spareId LIKE '%${spareId}%'`;
    if (ModelNumber) countSql += ` AND ModelNumber LIKE '%${ModelNumber}%'`;
    if (title) countSql += ` AND title LIKE '%${title}%'`;
    if (quantity) countSql += ` AND quantity LIKE '%${quantity}%'`;
    if (price) countSql += ` AND price LIKE '%${price}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    return res.json({
      data: result.recordset,
      totalCount: totalCount,
      page,
      pageSize,
    });


  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


app.post('/add_uniqsparepart', authenticateToken, async (req, res) => {
  try {
    const { finaldata } = req.body;

    const pool = await poolPromise;
    const newdata = finaldata.data;
    const ticket_no = finaldata.ticket_no;

    // Destructure values from `newdata`
    const { article_code, article_description, price, spareId } = newdata;




    const poolRequest = pool.request(); // Ensure `pool` is initialized correctly.

    const addspare = `
      INSERT INTO awt_uniquespare (ticketId, spareId, article_code, article_description, price)
      VALUES (@ticket_no, @product_code, @title, @ItemDescription, '100')
    `;

    await poolRequest
      .input('ticket_no', sql.VarChar, ticket_no)
      .input('product_code', sql.VarChar, spareId)
      .input('title', sql.VarChar, article_code)
      .input('ItemDescription', sql.VarChar, article_description)
      .input('price', sql.VarChar, price)
      .query(addspare);

    res.status(200).send({ message: 'Spare part added successfully!' });
  } catch (error) {
    console.error('Error inserting spare part:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});



app.post(`/add_quotation`, authenticateToken, async (req, res) => {

  let { finaldata } = req.body;

  const ModelNumber = finaldata.ModelNumber;
  const customer_id = finaldata.customer_id;
  const ticket_no = finaldata.ticket_no;
  const Customername = finaldata.Customername;
  const city = finaldata.city;
  const state = finaldata.state;
  const Engineer = finaldata.Engineer;
  const date = new Date();
  const pool = await poolPromise;




  let engineer_id;

  engineer_id = Engineer.join(',');

  console.log(finaldata.data)

  const newdata = finaldata.data;



  try {

    // Get the latest quotation number
    const getcount = `SELECT TOP 1 id FROM awt_quotation ORDER BY id DESC`;
    const countResult = await pool.request().query(getcount);

    const latestQuotation = countResult.recordset[0]?.id || 0;

    const newcount = latestQuotation + 1

    const quotationcode = 'Q' + newcount.toString().padStart(4, "0")

    console.log(quotationcode)


    const query = `
    INSERT INTO awt_quotation
    (ticketId, ticketdate, quotationNumber, CustomerName, state, city, assignedEngineer, status, customer_id, ModelNumber,  created_date, created_by)
    VALUES
    (@ticket_no, @date, @quotationNumber, @CustomerName, @state, @city, @assignedEngineer, @status, @customer_id, @ModelNumber,  @created_date, @created_by)
  `;

    const result = await pool.request()
      .input('ticket_no', sql.NVarChar, ticket_no)
      .input('date', sql.NVarChar, date.toISOString()) // Format date properly
      .input('quotationNumber', sql.NVarChar, quotationcode)
      .input('CustomerName', sql.NVarChar, Customername) // Replace with actual value
      .input('state', sql.NVarChar, state) // Replace with actual value
      .input('city', sql.NVarChar, city) // Replace with actual value
      .input('assignedEngineer', sql.NVarChar, engineer_id) // Replace with actual value
      .input('status', sql.NVarChar, 'Pending') // Replace with actual value
      .input('customer_id', sql.NVarChar, customer_id)
      .input('ModelNumber', sql.NVarChar, ModelNumber)
      .input('created_date', sql.NVarChar, date.toISOString())
      .input('created_by', sql.NVarChar, '1') // Replace with actual user
      .query(query);

    console.log(result.recordset);



    // Iterate over the items in `newdata`
    for (const item of newdata) {
      const { id, title, ItemDescription, price, product_code } = item;
      const date = new Date();

      // const addspare = `insert into awt_uniquespare ( quotation_id,ticketId , spareId , article_code ,article_description , price) values('${quotationcode}','${ticket_no}','${product_code}' ,'${title}','${ItemDescription}' , '${price}')`;


      const updatespare = `update awt_uniquespare set quotation_id = '${quotationcode}' where id = '${id}'`


      await pool.request().query(updatespare)


      // // Validate fields
      // if (!id || !title || !quantity || !price) {
      //   return res.status(400).json({ message: "Invalid item format in finaldata" });
      // }


      // Insert query

    }

    res.status(200).json({ message: "Quotation added successfully" });

  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Error inserting data", error });
  }
});

app.post('/removesparepart', authenticateToken, async (req, res) => {
  const { spare_id } = req.body; // Ensure spare_id is passed in the request body
  const pool = await poolPromise;

  try {
    // Use parameterized query to prevent SQL Injection
    const query = `UPDATE awt_uniquespare SET deleted = 1 WHERE id = @spare_id`;



    await pool.request()
      .input('spare_id', sql.Int, spare_id) // Parameterize spare_id
      .query(query);

    res.status(200).json({ message: "Spare part updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Error updating data", error });
  }
});

app.post('/updatequotation', authenticateToken, async (req, res) => {

  const { quantity, price, status, qid } = req.body; // Ensure spare_id is passed in the request body
  const pool = await poolPromise;

  try {
    // Use parameterized query to prevent SQL Injection
    const query = `UPDATE awt_quotation SET quantity = @quantity ,price = @price , status = @status  WHERE id = @qid`;



    await pool.request()
      .input('qid', sql.Int, qid) // Parameterize spare_id
      .input('quantity', sql.VarChar, quantity) // Parameterize spare_id
      .input('price', sql.VarChar, price) // Parameterize spare_id
      .input('status', sql.VarChar, status) // Parameterize spare_id
      .query(query);

    res.status(200).json({ message: "Spare part updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Error updating data", error });
  }
});

app.post('/getquotedetails', authenticateToken, async (req, res) => {
  const { quotaion_id } = req.body; // Ensure spare_id is passed in the request body
  const pool = await poolPromise;

  try {
    // Use parameterized query to prevent SQL Injection
    const query = `select * from  awt_quotation  WHERE id = @quote_id`;



    const result = await pool.request()
      .input('quote_id', sql.Int, quotaion_id) // Parameterize spare_id
      .query(query);



    return res.json(result.recordset);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Error updating data", error });
  }
});



app.post("/getuniquespare", authenticateToken, async (req, res) => {

  const { ticket_id } = req.body
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `SELECT * FROM awt_uniquespare where ticketId = '${ticket_id}' and deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


app.post("/checkuser", authenticateToken, async (req, res) => {

  const { email } = req.body
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `select * from userlogin where username = '${email}'`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)
    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


app.get("/getapproveEng", authenticateToken, async (req, res) => {

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `select * from awt_engineermaster where status != 1`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
})
app.get("/getcsp", authenticateToken, async (req, res) => {

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `select id, title , licare_code from awt_childfranchisemaster where deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
})

app.get("/getmsp", authenticateToken, async (req, res) => {

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `select id, title , licarecode from awt_franchisemaster where deleted = 0`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
})

app.get("/finalapproveenginner", authenticateToken, async (req, res) => {

  const { eng_id } = req.body;



  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `update awt_engineermaster set status = 1 where id = '${eng_id}'`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
})

app.post("/getquotationspare", authenticateToken, async (req, res) => {

  const { quote_id } = req.body;




  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `select * from awt_uniquespare where quotation_id = '${quote_id}'`;

    // Execute the query
    const result = await pool.request().query(sql);
    console.log(result)

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
})

// const API_KEY = "a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67";

app.post("/awt_service_contact", authenticateToken, async (req, res) => {
  // Validate API key
  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  try {
    const { rating1, remark, rating2, email, customerId, ticketNo } = req.body;

    const pool = await poolPromise;

    const insertSql = `
      INSERT INTO awt_service_contact_form (
        customer_id, ticket_no, email, rating1, remark, rating2, created_date
      ) VALUES (
        @customerId, @ticketNo, @email, @rating1, @remark, @rating2, GETDATE()
      )`;

    const request = pool.request()
      .input('customerId', customerId)
      .input('ticketNo', ticketNo)
      .input('email', email)
      .input('rating1', rating1)
      .input('remark', remark)
      .input('rating2', rating2);

    await request.query(insertSql);

    res.send({ message: "Contact form submitted successfully" });
  } catch (err) {
    console.log("Error /awt_service_contact", err);
    res.status(500).send({ error: "Error occurred", details: err.message });
  }
});

app.post("/query", authenticateToken, async (req, res) => {
  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  try {
    const { query, params } = req.body; // Extract query and parameters from the body

    if (!query) {
      return res.status(400).json({ error: 'Bad Request: Missing query' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    // Add parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value.type, value.value); // Assumes params is structured { key: { type, value } }
      });
    }

    const result = await request.query(query);
    res.json(result.recordsets);
  } catch (error) {
    console.error("Error in /query", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// API FOR ROLES 

// fetch roles data

app.get("/getrole", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    const sql = `
      SELECT *
      FROM role_master
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// put role data

app.post("/putrole", authenticateToken, async (req, res) => {
  const { title, id, description } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Direct SQL query to check for duplicates without parameter binding
    const checkDuplicateSql = `
      SELECT *
      FROM role_master
      WHERE title = '${title}'  AND id != ${id} AND deleted = 0
    `;

    // Execute the duplicate check query
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate title exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Role already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE role_master
        SET title = '${title}', description ='${description}'
        WHERE id = ${id}
      `;

      // Execute the update query
      await pool.request().query(updateSql);

      return res.json({ message: "Roles updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating category:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// post role data 
app.post("/postrole", authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM role_master
      WHERE title = '${title}' AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, role already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM role_master
        WHERE title = '${title}' AND deleted = 1
      `;
      const softDeletedCheckResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedCheckResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE role_master
          SET deleted = 0
          WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO role_master (title,description)
          VALUES ('${title}','${description}')
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "Roles added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error adding Roles:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// delete role data 

app.post("/deleterole", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE role_master
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the update query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting category:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating category" });
  }
});

//edit role data

app.get("/requestrole/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM role_master
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Check if the result is empty
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "role not found" });
    }

    // Return the first record from the result set
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching Role:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


app.post('/role_pages', authenticateToken, async (req, res) => {
  const role_id = req.body.role_id;

  try {
    const pool = await poolPromise;

    const sqlSelect = `
      SELECT * 
      FROM pagerole AS pg 
      LEFT JOIN page_master AS pm ON pg.pageid = pm.id 
      WHERE pg.roleid = @role_id 
      ORDER BY pg.id ASC
    `;

    const result = await pool.request()
      .input("role_id", sql.Int, role_id)
      .query(sqlSelect);

    const data = result.recordset;

    if (data.length === 0) {
      const fetchPageIds = `
        SELECT id AS page_id 
        FROM page_master 
        WHERE deleted = 0
      `;

      const pageIdsResult = await pool.request().query(fetchPageIds);
      const pageIds = pageIdsResult.recordset;

      if (pageIds.length > 0) {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          const request = transaction.request();
          for (const { page_id } of pageIds) {
            await request.query(`
                INSERT INTO pagerole (roleid, pageid, accessid) 
                VALUES (${role_id}, ${page_id},1)
              `);
          }

          await transaction.commit();

          const getData = `
            SELECT * 
            FROM pagerole AS pg 
            LEFT JOIN page_master AS pm ON pg.pageid = pm.id 
            WHERE pg.roleid = @role2_id 
            ORDER BY pg.id ASC
          `;

          const newData = await pool.request()
            .input("role2_id", sql.Int, role_id)
            .query(getData);

          return res.json(newData.recordset);
        } catch (err) {
          await transaction.rollback();
          console.error("Transaction error:", err);
          return res.status(500).json({ error: "Failed to insert rows", details: err });
        }
      }
    } else {
      return res.json(data);
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});



app.post('/getRoleData', authenticateToken, async (req, res) => {
  const { role, pageid } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on `pageid` and `roleid`
    const query = `
      SELECT * 
      FROM pagerole 
      WHERE pageid = @pageid AND roleid = @roleid
    `;

    const result = await pool.request()
      .input("pageid", sql.Int, pageid)
      .input("roleid", sql.Int, role)
      .query(query);

    // Return the fetched data
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/assign_role', authenticateToken, async (req, res) => {
  const rolePages = req.body;

  // Validate the input
  if (!Array.isArray(rolePages) || rolePages.length === 0) {
    return res.status(400).json({ error: "Invalid input: 'rolePages' should be a non-empty array." });
  }

  const role_id = rolePages[0]?.roleid;

  if (!role_id) {
    return res.status(400).json({ error: "Invalid input: 'roleid' is required." });
  }

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Delete existing roles for the given role_id
    const deleteSql = "DELETE FROM pagerole WHERE roleid = @roleid";
    await pool.request()
      .input("roleid", sql.Int, role_id)
      .query(deleteSql);

    // Prepare values for bulk insert
    const insertSql = "INSERT INTO pagerole (roleid, pageid, accessid) VALUES (@roleid, @pageid, @accessid)";
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      for (const rolePage of rolePages) {
        await transaction.request()
          .input("roleid", sql.Int, rolePage.roleid)
          .input("pageid", sql.Int, rolePage.pageid)
          .input("accessid", sql.Int, rolePage.accessid)
          .query(insertSql);
      }

      await transaction.commit();

      return res.json({
        message: "Roles assigned successfully",
        affectedRows: rolePages.length,
      });

    } catch (err) {
      await transaction.rollback();
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Failed to insert roles", details: err });
    }

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

// complete dump of ticket data 

app.get("/getcomplainticketdump", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("Select TOP 100 id,ticket_no,ticket_date,customer_id,customer_name,customer_mobile,alt_mobile,customer_email,ModelNumber,serial_no, address, region, state, city, area, pincode, sevice_partner, msp, csp, sales_partner, assigned_to, engineer_code, engineer_id, ticket_type, call_type , sub_call_status, call_status, warranty_status, invoice_date, mode_of_contact, customer_class, call_priority, closed_date, created_date, created_by,deleted From complaint_ticket where deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// feedback Report listing 

app.get("/getfeedbacklist", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = "SELECT * FROM awt_service_contact_form Where Deleted = 0 ";

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.post('/getcspusers', authenticateToken, async (req, res) => {
  const { licare_code } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on `pageid` and `roleid`
    const query = `select * from awt_childfranchisemaster where licare_code = @licare_code`;

    const result = await pool.request()
      .input("licare_code", sql.VarChar, licare_code)
      .query(query);

    // Return the fetched data
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});


app.post('/getcallrecorddetails', async (req, res) => {
  const { uuid, call_to_number, caller_id_number, start_stamp, call_id, billing_circle, customer_no_with_prefix } = req.body;

  const date = new Date();

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    const checkduplicate = `Select * from awt_call_webhook where uuid = '${uuid}' and caller_id_number = '${caller_id_number}'`

    const duplicateresult = await pool.request().query(checkduplicate)

    if (duplicateresult.recordset.length > 0) {
      return res.json("Duplicate Record Found")
    }

    // Compact query with all parameters
    const query = `INSERT INTO awt_call_webhook (uuid, call_to_number, caller_id_number, start_stamp, call_id, billing_circle, customer_no_with_prefix,created_date) 
                   VALUES (@uuid, @call_to_number, @caller_id_number, @start_stamp, @call_id, @billing_circle, @customer_no_with_prefix,@created_date)`;

    const result = await pool.request()
      .input("uuid", uuid)
      .input("call_to_number", call_to_number)
      .input("caller_id_number", caller_id_number)
      .input("start_stamp", start_stamp)
      .input("call_id", call_id)
      .input("billing_circle", billing_circle)
      .input("customer_no_with_prefix", customer_no_with_prefix)
      .input("created_date", date)
      .query(query);

    // Return success message
    return res.json({ success: true, message: "Data inserted successfully", result: result.rowsAffected });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err.message });
  }
});


//Fetch role for csp

app.get("/getcsprole", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    const sql = `
      SELECT *
      FROM csp_role_master
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



// Fetch role pages 

app.post('/csp_role_pages', authenticateToken, async (req, res) => {
  const role_id = req.body.role_id;

  try {
    const pool = await poolPromise;

    const sqlSelect = `
      SELECT * 
      FROM pagerole AS pg 
      LEFT JOIN csp_pagemaster AS pm ON pg.pageid = pm.id 
      WHERE pg.roleid = @role_id 
      ORDER BY pg.id ASC
    `;

    const result = await pool.request()
      .input("role_id", sql.Int, role_id)
      .query(sqlSelect);

    const data = result.recordset;

    if (data.length === 0) {
      const fetchPageIds = `
        SELECT id AS page_id 
        FROM csp_pagemaster 
        WHERE deleted = 0
      `;

      const pageIdsResult = await pool.request().query(fetchPageIds);
      const pageIds = pageIdsResult.recordset;

      console.log(pageIds.length, "$$")

      if (pageIds.length > 0) {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          const request = transaction.request();
          for (const { page_id } of pageIds) {
            await request.query(`
                INSERT INTO csp_pagerole (roleid, pageid, accessid) 
                VALUES (${role_id}, ${page_id},1)
              `);
          }

          await transaction.commit();

          const getData = `
            SELECT * 
            FROM csp_pagerole AS pg 
            LEFT JOIN csp_pagemaster AS pm ON pg.pageid = pm.id 
            WHERE pg.roleid = @role2_id 
            ORDER BY pg.id ASC
          `;

          const newData = await pool.request()
            .input("role2_id", sql.Int, role_id)
            .query(getData);

          return res.json(newData.recordset);
        } catch (err) {
          await transaction.rollback();
          console.error("Transaction error:", err);
          return res.status(500).json({ error: "Failed to insert rows", details: err });
        }
      }
    } else {
      return res.json(data);
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

// Fetch assign role 


app.post('/csp_assign_role', authenticateToken, async (req, res) => {
  const rolePages = req.body;

  // Validate the input
  if (!Array.isArray(rolePages) || rolePages.length === 0) {
    return res.status(400).json({ error: "Invalid input: 'rolePages' should be a non-empty array." });
  }

  const role_id = rolePages[0]?.roleid;

  if (!role_id) {
    return res.status(400).json({ error: "Invalid input: 'roleid' is required." });
  }

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Delete existing roles for the given role_id
    const deleteSql = "DELETE FROM csp_pagerole WHERE roleid = @roleid";
    await pool.request()
      .input("roleid", sql.Int, role_id)
      .query(deleteSql);

    // Prepare values for bulk insert
    const insertSql = "INSERT INTO csp_pagerole (roleid, pageid, accessid) VALUES (@roleid, @pageid, @accessid)";
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      for (const rolePage of rolePages) {
        await transaction.request()
          .input("roleid", sql.Int, rolePage.roleid)
          .input("pageid", sql.Int, rolePage.pageid)
          .input("accessid", sql.Int, rolePage.accessid)
          .query(insertSql);
      }

      await transaction.commit();

      return res.json({
        message: "Roles assigned successfully",
        affectedRows: rolePages.length,
      });

    } catch (err) {
      await transaction.rollback();
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Failed to insert roles", details: err });
    }

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});



app.get("/getmspdata/:licare_code", authenticateToken, async (req, res) => {
  const { licare_code } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    const sql = `SELECT af.* FROM awt_childfranchisemaster as acf left join awt_franchisemaster as af on af.licarecode = acf.pfranchise_id   WHERE acf.licare_code = '${licare_code}' and acf.deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// put api for csp role rights
app.post("/putcsprole", authenticateToken, async (req, res) => {
  const { title, id, description } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Direct SQL query to check for duplicates without parameter binding
    const checkDuplicateSql = `
      SELECT *
      FROM csp_role_master
      WHERE title = '${title}'  AND id != ${id} AND deleted = 0
    `;

    // Execute the duplicate check query
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate title exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Role already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE csp_role_master
        SET title = '${title}', description ='${description}'
        WHERE id = ${id}
      `;

      // Execute the update query
      await pool.request().query(updateSql);

      return res.json({ message: "Roles updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating category:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// post csp role data 
app.post("/postcsprole", authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM csp_role_master
      WHERE title = '${title}' AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, role already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM csp_role_master
        WHERE title = '${title}' AND deleted = 1
      `;
      const softDeletedCheckResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedCheckResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE csp_role_master
          SET deleted = 0
          WHERE title = '${title}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO csp_role_master (title,description)
          VALUES ('${title}','${description}')
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "Roles added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error adding Roles:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});
//edit role data

app.get("/requestcsprole/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM csp_role_master
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Check if the result is empty
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "role not found" });
    }

    // Return the first record from the result set
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching Role:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// delete role data 

app.post("/deletecsprole", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE csp_role_master
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the update query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting category:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating category" });
  }
});

// fetch qury for enquiry listing 
app.get("/getenquirylist", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = "SELECT * FROM awt_enquiry ORDER BY id ASC";

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// fetch enquiry details 

app.get("/getenquiry", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    const sql = `
      SELECT *
      FROM awt_enquirymaster
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return only the recordset from the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching enquiries:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// put enquiry data

app.post("/putenquiry", authenticateToken, async (req, res) => {
  const { name, id, mobile_no, email, address } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Direct SQL query to check for duplicates without parameter binding
    const checkDuplicateSql = `
      SELECT *
      FROM awt_enquirymaster
      WHERE mobile_no = '${mobile_no}'  AND id != ${id} AND deleted = 0
    `;

    // Execute the duplicate check query
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate title exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, enquiry already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_enquirymaster
        SET name = '${name}', address ='${address}', mobile_no ='${mobile_no}', email ='${email}'
        WHERE id = ${id}
      `;

      // Execute the update query
      await pool.request().query(updateSql);

      return res.json({ message: "enquiry updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating enquiry:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// post role data 
app.post("/postenquiry", authenticateToken, async (req, res) => {
  const { name, mobile_no, email, address } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM awt_enquirymaster
      WHERE mobile_no = '${mobile_no}' AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, enquiry already exists!" });
    } else {
      // Step 2: Check if the same title exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM awt_enquirymaster
        WHERE mobile_no = '${mobile_no}' AND deleted = 1
      `;
      const softDeletedCheckResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedCheckResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_enquirymaster
          SET deleted = 0
          WHERE mobile_no = '${mobile_no}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_enquirymaster (name,mobile_no,email,address)
          VALUES ('${name}','${mobile_no}','${email}','${address}')
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "enquiries added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error adding enquiry:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// delete role data 

app.post("/deleteenquiry", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE awt_enquirymaster
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the update query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting enquiry:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating enquiry" });
  }
});

//edit role data

app.get("/requestenquiry/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM awt_enquirymaster
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Check if the result is empty
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "role not found" });
    }

    // Return the first record from the result set
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error fetching Role:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.get('/getheaddata_web', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE());`);

    const result1 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Cancelled'`);

    const result2 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Closed'`);

    const result3 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Open'`);

    const totalTickets = result.recordset.length || 0;
    const cancelled = result1.recordset.length || 0;
    const closed = result2.recordset.length || 0;
    const open = result3.recordset.length || 0;

    res.status(200).json({
      totalTickets,
      cancelled,
      closed,
      open,
    });

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});


app.post("/getsearchcsp", authenticateToken, async (req, res) => {
  const { param } = req.body;

  if (!param) {
    return res.status(400).json({ message: "Invalid parameter" });
  }

  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
    SELECT TOP 20 id, title
    FROM awt_childfranchisemaster
    WHERE title LIKE @param AND deleted = 0
    ORDER BY title;
    `;

    const result = await pool.request()
      .input('param', `%${param}%`)
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});
app.post("/getsearchproduct", authenticateToken, async (req, res) => {
  const { param } = req.body;

  if (!param) {
    return res.status(400).json({ message: "Invalid parameter" });
  }

  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
    SELECT TOP 20 id, item_description
    FROM product_master
    WHERE item_description LIKE @param 
    ORDER BY id;
    `;

    const result = await pool.request()
      .input('param', `%${param}%`)
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


app.post("/add_grn", authenticateToken, async (req, res) => {
  const { invoice_number, invoice_date, csp_no, csp_name, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the invoice_number already exists
    const checkInvoiceQuery = `SELECT COUNT(*) AS count FROM awt_grnmaster WHERE invoice_no = @invoice_no`;
    const checkInvoiceResult = await pool.request()
      .input('invoice_no', invoice_number)
      .query(checkInvoiceQuery);

    if (checkInvoiceResult.recordset[0].count > 0) {
      return res.status(400).json({ message: "Invoice number already exists" });
    }

    // Query to get the count of rows in awt_grnmaster
    const creategrnno = `SELECT COUNT(*) AS count FROM awt_grnmaster`;
    const checkResult = await pool.request().query(creategrnno);

    // Generate the GRN number based on the count
    const grnCount = checkResult.recordset[0].count || 0;
    const grn_no = `GRN-${grnCount + 1}`; // Example: GRN-1, GRN-2, etc.

    // Insert the data into awt_grnmaster
    const sql = `INSERT INTO awt_grnmaster (grn_no, invoice_no, invoice_date, csp_name, csp_code, created_date, created_by) 
                 VALUES (@grn_no, @invoice_no, @invoice_date, @csp_name, @csp_code, @created_date, @created_by)`;

    const result = await pool.request()
      .input('grn_no', grn_no)
      .input('invoice_no', invoice_number)
      .input('invoice_date', invoice_date)
      .input('csp_name', csp_name)
      .input('csp_code', csp_no)  // Assuming you want to insert csp_no as csp_code
      .input('created_date', new Date())  // Use the current date for created_date
      .input('created_by', created_by)
      .query(sql);

    // If the insert was successful, send the result
    return res.json({ message: "GRN created successfully", grn_no: grn_no, data: result.recordset });

  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



app.post("/add_spareoutward", authenticateToken, async (req, res) => {
  const { issue_date, lhi_code, lhi_name, remark, created_by } = req.body;

  try {
    const pool = await poolPromise;


    // Query to get the count of rows in awt_grnmaster
    const creategrnno = `SELECT COUNT(*) AS count FROM awt_spareoutward`;
    const checkResult = await pool.request().query(creategrnno);

    // Generate the GRN number based on the count
    const issueCount = checkResult.recordset[0].count || 0;
    const issue_no = `Issue-${issueCount + 1}`; // Example: GRN-1, GRN-2, etc.


    // Insert the data into awt_grnmaster
    const sql = `INSERT INTO awt_spareoutward (issue_no, issue_date, lhi_name, lhi_code, created_date, created_by) 
                 VALUES (@issue_no, @issue_date, @lhi_name, @lhi_code, @created_date, @created_by)`;

    const result = await pool.request()
      .input('issue_no', issue_no)
      .input('issue_date', issue_date)
      .input('lhi_name', lhi_name)
      .input('lhi_code', lhi_code)  // Assuming you want to insert csp_no as csp_code
      .input('created_date', new Date())  // Use the current date for created_date
      .input('created_by', created_by)
      .query(sql);

    // If the insert was successful, send the result
    return res.json({ message: "Issue created successfully", issue_no: issue_no, data: result.recordset });

  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post('/updategrnspares', async (req, res) => {
  const spareData = req.body; // Expecting an array of spare objects

  // console.log(req.body);

  if (!Array.isArray(spareData)) {
    return res.status(400).json({ error: 'Invalid payload format. Expected an array.' });
  }

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Use a transaction for bulk updates
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Loop through spareData and update each row
    for (const item of spareData) {
      const request = new sql.Request(transaction); // Create a new request for each iteration
      const query = `
        UPDATE awt_cspgrnspare
        SET quantity = @quantity , actual_received = @actual_received , pending_quantity = @pending_quantity
        WHERE grn_no = @grn_no AND spare_no = @spare_no
      `;

      request.input('grn_no', sql.VarChar, item.grn_no);
      request.input('spare_no', sql.VarChar, item.article_code);
      request.input('quantity', sql.Int, item.quantity);
      request.input('actual_received', sql.Int, item.actual_received);
      request.input('pending_quantity', sql.Int, item.pending_quantity);
      await request.query(query);
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data updated successfully',
      affectedRows: spareData.length,
    });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    // Close the database connection
    sql.close();
  }
});


app.post('/updateissuespares', async (req, res) => {
  const spareData = req.body; // Expecting an array of spare objects

  // console.log(req.body);

  if (!Array.isArray(spareData)) {
    return res.status(400).json({ error: 'Invalid payload format. Expected an array.' });
  }

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Use a transaction for bulk updates
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Loop through spareData and update each row
    for (const item of spareData) {
      const request = new sql.Request(transaction); // Create a new request for each iteration
      const query = `
        UPDATE awt_cspissuespare
        SET quantity = @quantity 
        WHERE issue_no = @issue_no AND spare_no = @spare_no
      `;

      request.input('issue_no', sql.VarChar, item.issue_no);
      request.input('spare_no', sql.VarChar, item.article_code);
      request.input('quantity', sql.Int, item.quantity);
      await request.query(query);
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data updated successfully',
      affectedRows: spareData.length,
    });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    // Close the database connection
    sql.close();
  }
});



app.post("/getselctedspare", authenticateToken, async (req, res) => {
  const { article_id } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
   SELECT id, ModelNumber, title as article_code ,ProductCode as spareId, ItemDescription as article_description
       from Spare_parts where id = '${article_id}' 
    `;

    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


app.post("/getgrnlist", authenticateToken, async (req, res) => {

  const { csp_code, fromDate, toDate, received_from, invoice_number, product_code, product_name } = req.body;

  let sql;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    sql = `select * from awt_grnmaster where created_by = '${csp_code}' and  deleted = 0 
    `;

    if (fromDate && toDate) {
      sql += ` AND CAST(invoice_date AS DATE) BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (received_from) {
      sql += ` AND csp_name LIKE '%${received_from}%'`;
    }

    if (invoice_number) {
      sql += ` AND invoice_no LIKE '%${invoice_number}%'`;

    }


    sql += ' order by id desc'




    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post("/getoutwardlisting", authenticateToken, async (req, res) => {

  const { issue_no, csp_code, fromDate, toDate, lhi_name, product_code, product_name } = req.body;

  let sql;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    sql = `select * from awt_spareoutward where created_by = '${csp_code}' and  deleted = 0 
    `;

    if (fromDate && toDate) {
      sql += ` AND CAST(issue_date AS DATE) BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (lhi_name) {
      sql += ` AND lhi_name LIKE '%${lhi_name}%'`;
    }

    if (issue_no) {
      sql += ` AND issue_no LIKE '%${issue_no}%'`;

    }


    sql += ' order by id desc'




    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


app.post('/addgrnspares', async (req, res) => {
  const { spare_id, grn_no, created_by } = req.body; // Expecting required fields in the request body

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Fetch spare parts data
    const getspare = `
      SELECT id, ModelNumber, title as article_code, ProductCode as spareId, ItemDescription as article_description
      FROM Spare_parts WHERE id = @spare_id
    `;
    const result = await pool.request()
      .input('spare_id', sql.VarChar, spare_id)
      .query(getspare);

    const spareData = result.recordset.map(record => ({
      grn_no,
      article_code: record.article_code,
      article_title: record.article_description,
      spare_qty: 0,
      created_by,
      created_date: new Date()
    }));

    console.log(spareData, "%%");

    // Use a transaction for bulk inserts
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const bulkQuery = `
      INSERT INTO awt_cspgrnspare (grn_no, spare_no, spare_title, quantity, created_by, created_date)
      VALUES (@grn_no, @article_code, @article_title, @spare_qty, @created_by, @created_date)
    `;

    const duplicateCheckQuery = `
      SELECT COUNT(*) as count
      FROM awt_cspgrnspare
      WHERE spare_no = @article_code_d AND grn_no = @grn_no_d
    `;

    let affectedRows = 0; // To count how many rows are actually inserted

    for (const item of spareData) {
      // Create a new request instance for each iteration to avoid reusing parameters
      const bulkRequest = new sql.Request(transaction);

      // Check if the spare_id already exists in the table
      const duplicateCheck = await bulkRequest
        .input('article_code_d', sql.VarChar, item.article_code) // Renamed parameter
        .input('grn_no_d', sql.VarChar, item.grn_no) // Correct parameter names
        .query(duplicateCheckQuery);

      if (duplicateCheck.recordset[0].count === 0) {
        // If not a duplicate, insert the new record with correct parameters
        await bulkRequest
          .input('grn_no', sql.VarChar, item.grn_no) // Correct parameter names
          .input('article_code', sql.VarChar, item.article_code) // Correct parameter names
          .input('article_title', sql.VarChar, item.article_title)
          .input('spare_qty', sql.Int, item.spare_qty)
          .input('created_by', sql.VarChar, item.created_by)
          .input('created_date', sql.DateTime, item.created_date)
          .query(bulkQuery);
        affectedRows++; // Increment affected rows
      } else {
        // If duplicate, skip the insert
        console.log(`Duplicate entry found for spare_id: ${item.article_code} and grn_no: ${item.grn_no}`);
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data saved successfully (duplicates skipped)',
      affectedRows, // Send the actual count of affected rows
    });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    // Close the database connection
    sql.close();
  }
});
app.post('/addissuespares', async (req, res) => {
  const { spare_id, issue_no, created_by } = req.body; // Expecting required fields in the request body

  try {
    // Connect to the database
    const pool = await sql.connect(dbConfig);

    // Fetch spare parts data
    const getspare = `
      SELECT id, ModelNumber, title as article_code, ProductCode as spareId, ItemDescription as article_description
      FROM Spare_parts WHERE id = @spare_id
    `;
    const result = await pool.request()
      .input('spare_id', sql.VarChar, spare_id)
      .query(getspare);

    const spareData = result.recordset.map(record => ({
      issue_no,
      article_code: record.article_code,
      article_title: record.article_description,
      spare_qty: 0,
      created_by,
      created_date: new Date()
    }));


    // Use a transaction for bulk inserts
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const bulkQuery = `
      INSERT INTO awt_cspissuespare (issue_no, spare_no, spare_title, quantity, created_by, created_date)
      VALUES (@issue_no, @article_code, @article_title, @spare_qty, @created_by, @created_date)
    `;

    const duplicateCheckQuery = `
      SELECT COUNT(*) as count
      FROM awt_cspissuespare
      WHERE spare_no = @article_code_d AND issue_no = @issue_no_d
    `;

    let affectedRows = 0; // To count how many rows are actually inserted

    for (const item of spareData) {
      // Create a new request instance for each iteration to avoid reusing parameters
      const bulkRequest = new sql.Request(transaction);

      // Check if the spare_id already exists in the table
      const duplicateCheck = await bulkRequest
        .input('article_code_d', sql.VarChar, item.article_code) // Renamed parameter
        .input('issue_no_d', sql.VarChar, item.issue_no) // Correct parameter names
        .query(duplicateCheckQuery);

      if (duplicateCheck.recordset[0].count === 0) {
        // If not a duplicate, insert the new record with correct parameters
        await bulkRequest
          .input('issue_no', sql.VarChar, item.issue_no) // Correct parameter names
          .input('article_code', sql.VarChar, item.article_code) // Correct parameter names
          .input('article_title', sql.VarChar, item.article_title)
          .input('spare_qty', sql.Int, item.spare_qty)
          .input('created_by', sql.VarChar, item.created_by)
          .input('created_date', sql.DateTime, item.created_date)
          .query(bulkQuery);
        affectedRows++; // Increment affected rows
      } else {
        // If duplicate, skip the insert
        console.log(`Duplicate entry found for spare_id: ${item.article_code} and issue_no: ${item.issue_no}`);
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data saved successfully (duplicates skipped)',
      affectedRows, // Send the actual count of affected rows
    });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    // Close the database connection
    sql.close();
  }
});



app.post("/getgrnsparelist", authenticateToken, async (req, res) => {

  const { grn_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `select * from awt_cspgrnspare where grn_no = '${grn_no}'`;

    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post("/getissuesparelist", authenticateToken, async (req, res) => {

  const { Issue_No } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `select * from awt_cspissuespare where issue_no = '${Issue_No}'`;

    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post('/getgrndetails', authenticateToken, async (req, res) => {
  const { grn_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `select * from awt_grnmaster where grn_no = '${grn_no}'`;

    const result = await pool.request()
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }


})
app.post('/updategrnapprovestatus', authenticateToken, async (req, res) => {

  const { grn_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `update awt_grnmaster set status = 1 where grn_no = '${grn_no}'`;

    console.log(sql)

    await pool.request()
      .query(sql);


    return res.json("Status Updated");
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }


})

app.post('/deletedgrn', authenticateToken, async (req, res) => {

  const { grn_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `update awt_grnmaster set deleted = 1 where grn_no = '${grn_no}'`;

    console.log(sql)

    await pool.request()
      .query(sql);


    return res.json("Grn deleted successfully");
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }


})

app.post('/deletespareoutward' , authenticateToken , async (req, res) =>{

  const { issue_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `update awt_spareoutward set deleted = 1 where issue_no = '${issue_no}'`;

    console.log(sql)

     await pool.request()
      .query(sql);


    return res.json("Grn deleted successfully");
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }


})


app.get('/cspgetheaddata_web', authenticateToken, async (req, res) => {
  try {
    const { licare_code } = req.query;
    const csp = licare_code.csp;
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and csp = '${licare_code}'`);

    const result1 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Cancelled' and csp = '${licare_code}'`);

    const result2 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Closed' and csp = '${licare_code}'`);

    const result3 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Open' and csp = '${licare_code}'`);

    const totalTickets = result.recordset.length || 0;
    const cancelled = result1.recordset.length || 0;
    const closed = result2.recordset.length || 0;
    const open = result3.recordset.length || 0;

    res.status(200).json({
      totalTickets,
      cancelled,
      closed,
      open,
    });

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});

app.get('/mspgetheaddata_web', authenticateToken, async (req, res) => {
  try {
    const { licare_code } = req.query;
    const msp = licare_code.msp;
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and msp = '${licare_code}'`);

    const result1 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Cancelled' and msp = '${licare_code}'`);

    const result2 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Closed' and msp = '${licare_code}'`);

    const result3 = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE YEAR([created_date]) = YEAR(GETDATE()) and call_status = 'Open' and msp = '${licare_code}'`);

    const totalTickets = result.recordset.length || 0;
    const cancelled = result1.recordset.length || 0;
    const closed = result2.recordset.length || 0;
    const open = result3.recordset.length || 0;

    res.status(200).json({
      totalTickets,
      cancelled,
      closed,
      open,
    });

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});

app.get("/getstock", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM csp_stock WHERE deleted = 0 ");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});







