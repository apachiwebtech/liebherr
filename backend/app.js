const sql = require("mssql");
const express = require('express');
const app = express();
const cors = require('cors');
const complaint = require("./Routes/complaint");
const common = require("./Routes/common");
const Category = require("./Routes/ProductMaster/Category");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");


// Secret key for JWT
const JWT_SECRET = "Lh!_Login_123"; // Replace with a strong, secret key


app.use(cors({ origin: "*" }));
app.use(express.json());
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

app.use("/", complaint);
app.use("/", common);
app.use("/", Category);


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

  console.log(Lhiuser);

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `SELECT id, Lhiuser FROM lhi_user WHERE Lhiuser = '${Lhiuser}' AND password = '${password}'`;

    console.log(sql);

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, Lhiuser: user.Lhiuser }, // Payload
        JWT_SECRET, // Secret key
        { expiresIn: "1h" } // Token validity
      );

      res.json({
        message: "Login successful",
        token, // Send token to client
        user: {
          id: user.id,
          Lhiuser: user.Lhiuser,
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

    // console.log(sql)

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      res.json({ id: result.recordset[0].id, Lhiuser: result.recordset[0].email, licare_code: result.recordset[0].licare_code });
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

    console.log(sql)

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      res.json({ id: result.recordset[0].id, Lhiuser: result.recordset[0].email, licare_code: result.recordset[0].licarecode });
    } else {
      res.status(500).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});
// app.post("/msplogin", async (req, res) => {
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
app.put("/putdata", authenticateToken, async (req, res) => {
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
app.get("/getregionsr", async (req, res) => {
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
app.get("/requestregion/:id", async (req, res) => {
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
app.post("/postregion", async (req, res) => {
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
app.put("/putregion", async (req, res) => {
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

app.post("/deleteregion", async (req, res) => {
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
      WHERE gs.deleted = 0 ORDER BY gs.id DESC
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
app.put("/putgeostate", authenticateToken, async (req, res) => {
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
app.put("/putgeocity", authenticateToken,
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
app.get("/requestarea/:id", async (req, res) => {
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
app.post("/postarea", async (req, res) => {
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
app.put("/putarea", async (req, res) => {
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
app.post("/deletearea", async (req, res) => {
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
app.get("/getpincodes", async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT p.*,
             c.title as country_title,
             r.title as region_title,
             gs.title as geostate_title,
             gc.title as geocity_title,
             a.title as area_title
      FROM awt_pincode p
      JOIN awt_country c ON p.country_id = c.id
      JOIN awt_region r ON p.region_id = r.id
      JOIN awt_geostate gs ON p.geostate_id = gs.id
      JOIN awt_geocity gc ON p.geocity_id = gc.id
      JOIN awt_district a ON p.area_id = a.id
      WHERE p.deleted = 0 ORDER BY p.id DESC
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
app.get("/requestpincode/:id", async (req, res) => {
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
app.post("/postpincode", async (req, res) => {
  const { pincode, country_id, region_id, geostate_id, geocity_id, area_id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Check for duplicates based on pincode and country_id
    const checkDuplicateSql = `
      SELECT * FROM awt_pincode
      WHERE pincode = ${pincode}
      AND country_id = ${country_id}
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
        INSERT INTO awt_pincode (pincode, country_id, region_id, geostate_id, geocity_id, area_id)
        VALUES (${pincode}, ${country_id}, ${region_id}, ${geostate_id}, ${geocity_id}, ${area_id})
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
app.put("/putpincode", async (req, res) => {
  const {
    pincode,
    id,
    country_id,
    region_id,
    geostate_id,
    geocity_id,
    area_id,
  } = req.body;

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
            region_id = ${region_id},
            geostate_id = ${geostate_id},
            geocity_id = ${geocity_id},
            area_id = ${area_id}
        WHERE id = ${id}
      `;
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

    // Directly use the query (no parameter binding)
    const sql = "SELECT * FROM product_master ORDER BY id ASC";

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
// Product list end
//customer list start
app.get("/getcustomerlist", authenticateToken, async (req, res) => {
  try {

    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      customer_fname,
      customer_id,
      customer_type,
      customer_lname,
      mobileno,
      email,



    } = req.query;

    let sql = `
    SELECT c.* FROM awt_customer as c  WHERE c.deleted = 0
 `;

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

    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});

app.get("/requestcustomerlist/:id", async (req, res) => {
  try {

    const pool = await poolPromise;
    const id = req.params.id;
    const sql = `SELECT * FROM awt_customer WHERE id = @id`;

    const result = await pool.request()
      .input('id', id)
      .query(sql);


    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(result.recordset);
  }
  catch (err) {
    console.error('Error in requestcustomerlist/:id endpoint:', err);
    return res.status(500).json({ error: 'An error occurred while fetching customer data' });
  }
})
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
app.put("/putcatdata", authenticateToken, async (req, res) => {
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
app.put("/putsubcategory", authenticateToken, async (req, res) => {
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
app.put("/putcdata", authenticateToken, async (req, res) => {
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
      WHERE deleted = 0
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
app.put("/putcomdata",authenticateToken, async (req, res) => {
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
app.post("/deletecomdata",authenticateToken, async (req, res) => {
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
app.get("/getgroupdefectcode", async (req, res) => {
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


app.get("/gettypeofdefect", async (req, res) => {
  try {
    const pool = await poolPromise;
    const sql = `
     SELECT 
        td.*, dg.defectgrouptitle as grouptitle
      FROM awt_typeofdefect td
      LEFT JOIN awt_defectgroup dg ON td.groupdefect_code = dg.defectgroupcode
      WHERE td.deleted = 0
    `;
    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Type of Defects:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Type of Defects" });
  }
});

// Insert  Type Of Defect Code
app.post("/postdatatypeofdefect", async (req, res) => {
  const { defect_code, groupdefect_code, defect_title, description, created_by } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the same defect_code exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_typeofdefect
      WHERE defect_code = '${defect_code}'
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
app.get("/requestdatatypeofdefect/:id", async (req, res) => {
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
app.put("/putdatatypeofdefect", async (req, res) => {
  const { id, defect_code, groupdefect_code, defect_title, description, updated_by } = req.body;

  try {
    const pool = await poolPromise;
    const checkDuplicateSql = `
      SELECT * FROM awt_typeofdefect
      WHERE defect_code = '${defect_code}'
      AND deleted = 0
      AND id != ${id}
    `;
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
      await pool.request().query(updateSql);
      return res.json({ message: "Type Of Defect updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating Type Of Defect:", err);
    return res.status(500).json({ message: "Error updating Type Of Defect" });
  }
});


// Soft-delete rType Of Defect Code by ID
app.post("/deletetypeofdefect", async (req, res) => {
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

//action code Start
app.get("/getaction", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT *
      FROM action_code
      WHERE deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if data was found
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Return the result set
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});



// Insert for actioncode
app.post("/postdataaction", authenticateToken, async (req, res) => {
  const { id, actioncode, created_by } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    if (id) {
      // Direct SQL query without parameter binding to check for duplicates on update
      const checkDuplicateSql = `
        SELECT *
        FROM action_code
        WHERE actioncode = '${actioncode}' AND id != ${id} AND deleted = 0
      `;

      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, actioncode already exists!" });
      } else {
        // Direct SQL query without parameter binding for update
        const updateSql = `
          UPDATE action_code
          SET actioncode = '${actioncode}', updated_date = GETDATE(), updated_by = '${created_by}'
          WHERE id = ${id}
        `;
        await pool.request().query(updateSql);
        return res.json({ message: "actioncode updated successfully!" });
      }
    } else {
      // Direct SQL query without parameter binding to check for duplicates on insert
      const checkDuplicateSql = `
        SELECT *
        FROM action_code
        WHERE actioncode = '${actioncode}' AND deleted = 0
      `;

      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, actioncode already exists!" });
      } else {
        // Check if a soft-deleted entry with the same actioncode exists
        const checkSoftDeletedSql = `
          SELECT *
          FROM action_code
          WHERE actioncode = '${actioncode}' AND deleted = 1
        `;

        const softDeletedCheckResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedCheckResult.recordset.length > 0) {
          // Restore the soft-deleted entry
          const restoreSoftDeletedSql = `
            UPDATE action_code
            SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}'
            WHERE actioncode = '${actioncode}'
          `;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert a new action code
          const insertSql = `
            INSERT INTO action_code (actioncode, created_date, created_by)
            VALUES ('${actioncode}', GETDATE(), '${created_by}')
          `;
          await pool.request().query(insertSql);
          return res.json({ message: "actioncode added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error("Error handling action data:", err);
    return res.status(500).json({ message: "Error handling action data" });
  }
});

// edit for actioncode
app.get("/requestdataaction/:id", authenticateToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      // Access the connection pool using poolPromise
      const pool = await poolPromise;

      // Direct SQL query without parameter binding
      const sql = `
      SELECT *
      FROM action_code
      WHERE id = ${id} AND deleted = 0
    `;

      // Execute the query
      const result = await pool.request().query(sql);

      // Return the first matching record
      return res.json(result.recordset[0]);
    } catch (err) {
      console.error("Error retrieving action data:", err);
      return res.status(500).json({ message: "Error retrieving action data" });
    }
  });

// update for actioncode
app.put("/putactiondata", authenticateToken, async (req, res) => {
  const { id, actioncode, updated_by } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding to check for duplicates
    const checkDuplicateSql = `
      SELECT *
      FROM action_code
      WHERE actioncode = '${actioncode}' AND deleted = 0 AND id != ${id}
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, actioncode already exists!" });
    } else {
      // Direct SQL query without parameter binding for the update
      const sql = `
        UPDATE action_code
        SET actioncode = '${actioncode}', updated_by = '${updated_by}', updated_date = GETDATE()
        WHERE id = ${id} AND deleted = 0
      `;
      await pool.request().query(sql);
      return res.json({ message: "actioncode updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating action data:", err);
    return res.status(500).json({ message: "Error updating action data" });
  }
});

// delete for actioncode
app.post("/deleteactiondata",
  authenticateToken, async (req, res) => {
    const { id } = req.body;

    try {
      // Access the connection pool using poolPromise
      const pool = await poolPromise;

      // Direct SQL query without parameter binding
      const sql = `
      UPDATE action_code
      SET deleted = 1
      WHERE id = ${id}
    `;

      // Execute the query
      await pool.request().query(sql);

      // Return success response
      return res.json({ message: "Action code deleted successfully!" });
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred" });
    }
  });

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

app.post("/addcomplaintremark", async (req, res) => {
  const { ticket_no, note, created_by } = req.body;
  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const pool = await poolPromise;

    // Insert remark and retrieve the remark_id
    const sql = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
      OUTPUT INSERTED.id AS remark_id
      VALUES ('${ticket_no}', '${note}', '${created_by}', '${formattedDate}')
    `;

    const result = await pool.request().query(sql);
    const remark_id = result.recordset[0].remark_id;

    return res.json({
      message: "Remark added successfully!",
      remark_id: remark_id // Send the generated remark ID back to the client
    });
  } catch (err) {
    console.error("Error inserting remark:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});



app.post("/uploadcomplaintattachments", upload.array("attachment"), async (req, res) => {
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
      VALUES (${remark_id}, '${ticket_no}', '${attachmentString}', ${created_by}, '${formattedDate}')
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




app.get("/getComplaintDetails/:ticket_no", async (req, res) => {
  const ticket_no = req.params.ticket_no;

  try {
    const pool = await poolPromise;

    // Direct SQL query without parameter binding for remarks
    const remarkQuery = `SELECT ac.*, lu.Lhiuser FROM awt_complaintremark as ac LEFT JOIN lhi_user as lu ON lu.id = ac.created_by WHERE ac.ticket_no = ${"'" + ticket_no + "'"} order by id DESC`;

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

app.get("/getcvengineer", authenticateToken, async (req, res) => {
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

app.get("/getProducts", async (req, res) => {
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

app.get("/getchildfranchises", async (req, res) => {
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


app.get("/product_master", async (req, res) => {
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
app.post("/getticketendcustomer", async (req, res) => {
  let { searchparam } = req.body;

  if (searchparam === "") {
    return res.json([]);
  }

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    //     const sql = `
    // SELECT c.*, 
    //        l.address, 
    //        CONCAT(c.customer_fname, ' ', c.customer_lname) AS customer_name
    // FROM awt_customer AS c 
    // LEFT JOIN awt_customerlocation AS l ON c.id = l.customer_id 
    // WHERE c.deleted = 0 
    //   AND (c.email LIKE '%${searchparam}%' 
    //        OR c.mobileno LIKE '%${searchparam}%')


    //     `;

    const checkincomplaint = `select * from complaint_ticket where (customer_email LIKE '%${searchparam}%' OR ticket_no LIKE '%${searchparam}%' OR customer_name LIKE '%${searchparam}%' OR serial_no LIKE '%${searchparam}%' OR customer_mobile LIKE '%${searchparam}%' OR customer_id LIKE '%${searchparam}%')`

    console.log(checkincomplaint)

    const result = await pool.request().query(checkincomplaint);

    // Product of End Customer using customer_id | in Table awt_customer id is primary key and customer_id is foreign key in awt_customerlocation
    const sql1 = `
    SELECT * FROM awt_uniqueproductmaster
    WHERE deleted = 0 AND CustomerID = @customerId
  `;
    // console.log(result.recordset[0])
    const result1 = await pool.request()
      .input('customerId', result.recordset[0].customer_id)
      .query(sql1);

    if (result1.recordset === 0) {
      return res.json({ information: result.recordset, product: [] });
    }
    else {

      return res.json({ information: result.recordset, product: result1.recordset });
    }
  } catch (err) {
    console.error(err);
    return res.json({ information: [], product: [] });
  }
});

// Comaplint Module -> Start

// Add Complaint Start
app.post("/add_complaintt", authenticateToken, async (req, res) => {
  let {
    complaint_date, customer_name, contact_person, email, mobile, address,
    state, city, area, pincode, mode_of_contact, ticket_type, cust_type,
    warrenty_status, invoice_date, call_charge, cust_id, model, alt_mobile, serial, purchase_date, created_by, child_service_partner, master_service_partner, specification, additional_remarks, ticket_id
  } = req.body;

  console.log(ticket_id, "$$$")

  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let t_type;

  if (ticket_type == 'Breakdown') {
    t_type = 'B'
  }
  else if (ticket_type == 'Demo') {
    t_type = 'D'

  } else if (ticket_type == 'Installation') {
    t_type = 'I'

  } else if (ticket_type == 'Maintenance') {
    t_type = 'M'

  } else if (ticket_type == 'Helpdesk') {
    t_type = 'H'
  }
  else if (ticket_type == 'Visit') {
    t_type = 'V'
  }


  try {
    const pool = await poolPromise;


    if (ticket_id == '') {
      // Split customer_name into customer_fname and customer_lname
      const [customer_fname, ...customer_lnameArr] = customer_name.split(' ');
      const customer_lname = customer_lnameArr.join(' ');

      // Insert into awt_customer
      const customerSQL = `
    INSERT INTO awt_customer (customer_fname, customer_lname, email, mobileno, alt_mobileno, created_date, created_by)
    OUTPUT INSERTED.id
    VALUES (@customer_fname, @customer_lname, @email, @mobile, @alt_mobile, @formattedDate, @created_by)`;
      // Debugging log

      const customerResult = await pool.request()
        .input('customer_fname', customer_fname)
        .input('customer_lname', customer_lname)
        .input('email', email)
        .input('mobile', mobile)
        .input('alt_mobile', alt_mobile)
        .input('formattedDate', formattedDate)
        .input('created_by', created_by)
        .query(customerSQL);

      const insertedCustomerId = customerResult.recordset[0].id;
      console.log("Inserted Customer ID:", insertedCustomerId);
    }




    // Insert into awt_customerlocation using insertedCustomerId as customer_id
    const customerLocationSQL = `
      INSERT INTO awt_customerlocation (
        customer_id, geostate_id, geocity_id, district_id, pincode_id, 
        created_date, created_by, ccperson, ccnumber, address
      )
      VALUES (
        @customer_id, @state, @city, @area, @pincode, 
        @formattedDate, @created_by, @customer_name, @mobile, @address
      )`;

    console.log("Executing customer location SQL:", customerLocationSQL);  // Debugging log

    await pool.request()
      .input('customer_id', cust_id)
      .input('state', state)
      .input('city', city)
      .input('area', area)
      .input('created_by', created_by)
      .input('pincode', pincode)
      .input('formattedDate', formattedDate)
      .input('customer_name', customer_name)
      .input('mobile', mobile)
      .input('address', address)
      .query(customerLocationSQL);

    // Insert into awt_uniqueproductmaster using insertedCustomerId as customer_id
    const productSQL = `
      INSERT INTO awt_uniqueproductmaster (
        CustomerID, ModelNumber, serial_no,  pincode , created_date, created_by
      )
      VALUES (
        @customer_id, @model, @serial,  @pincode, @formattedDate, @created_by
      )`;

    console.log("Executing product SQL:", productSQL);  // Debugging log

    await pool.request()
      .input('customer_id', cust_id)
      .input('model', model)
      .input('created_by', created_by)
      .input('serial', serial)
      .input('purchase_date', purchase_date)
      .input('pincode', pincode)
      .input('formattedDate', formattedDate)
      .query(productSQL);

    const checkResult = await pool.request().query(`
      SELECT COUNT(*) AS count FROM complaint_ticket WHERE deleted = 0`);

    const count = checkResult.recordset[0].count + 1;
    const formatDate = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;
    const ticket_no = `${t_type}G${formatDate}-${count.toString().padStart(4, "0")}`;

    let complaintSQL

    if (!ticket_id) {
      complaintSQL = `
        INSERT INTO complaint_ticket (
          ticket_no, ticket_date, customer_name, customer_mobile, customer_email, address, 
          state, city, area, pincode, customer_id, ModelNumber, ticket_type, call_type, 
          call_status, warranty_status, invoice_date, call_charges, mode_of_contact, 
          contact_person, assigned_to, created_date, created_by, engineer_id, purchase_date, serial_no, child_service_partner, sevice_partner, specification
        ) 
        VALUES (
          @ticket_no, @complaint_date, @customer_name, @mobile, @email, @address, 
          @state, @city, @area, @pincode, @customer_id, @model, @ticket_type, @cust_type, 
          'Pending', @warranty_status, @invoice_date, @call_charge, @mode_of_contact, 
          @contact_person, 1, @formattedDate, @created_by, 1, @purchase_date, @serial, @child_service_partner, @master_service_partner, @specification
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
          call_status = 'Pending',
          warranty_status = @warranty_status,
          invoice_date = @invoice_date,
          call_charges = @call_charge,
          mode_of_contact = @mode_of_contact,
          contact_person = @contact_person,
          assigned_to = 1,
          created_date = @formattedDate,
          created_by = @created_by,
          engineer_id = 1,
          purchase_date = @purchase_date,
          serial_no = @serial,
          child_service_partner = @child_service_partner,
          sevice_partner = @master_service_partner,
          specification = @specification
        WHERE
          id = @ticket_id
      `;
    }




    // console.log("Executing complaint SQL:", complaintSQL); 

    await pool.request()
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
      .input('customer_id', cust_id)
      .input('model', model)
      .input('ticket_type', ticket_type)
      .input('cust_type', cust_type)
      .input('warranty_status', sql.NVarChar, warrenty_status || "WARRENTY")
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

    return res.json({ message: 'Complaint added successfully!', ticket_no, cust_id });
  } catch (err) {
    console.error("Error inserting complaint:", err.stack);
    return res.status(500).json({ error: 'An error occurred while adding the complaint', details: err.message });
  }
});


app.post("/update_complaint", authenticateToken,
  async (req, res) => {
    let {
      complaint_date, customer_name, contact_person, email, mobile, address,
      state, city, area, pincode, mode_of_contact, ticket_type, cust_type,
      warrenty_status, invoice_date, call_charge, cust_id, model, alt_mobile, serial, purchase_date, created_by, child_service_partner, master_service_partner, specification, additional_remarks, ticket_no
    } = req.body;

    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


    try {
      const pool = await poolPromise;



      const complaintSQL = `
  UPDATE complaint_ticket
  SET
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
    call_status = 'Pending',
    warranty_status = @warranty_status,
    invoice_date = @invoice_date,
    call_charges = @call_charge,
    mode_of_contact = @mode_of_contact,
    contact_person = @contact_person,
    assigned_to = 1,
    created_date = @formattedDate,
    created_by = @created_by,
    engineer_id = 1,
    purchase_date = @purchase_date,
    serial_no = @serial,
    child_service_partner = @child_service_partner,
    sevice_partner = @master_service_partner,
    specification = @specification
  WHERE
    ticket_no = @ticket_no
`;

      console.log(complaintSQL, "$$")
      console.log(warrenty_status, "$$")

      console.log("Executing complaint SQL:", complaintSQL);  // Debugging log

      await pool.request()
        .input('ticket_no', ticket_no)
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
        .input('customer_id', cust_id)
        .input('model', model)
        .input('ticket_type', ticket_type)
        .input('cust_type', cust_type)
        .input("warranty_status", sql.NVarChar, warrenty_status || "WARRENTY")
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
      return res.status(500).json({ error: 'An error occurred while adding the complaint', details: err.message });
    }
  });


//Master Service Partner
app.get("/getmasterlist/:masterid", async (req, res) => {
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

app.get("/getchildfranchisegroupm", async (req, res) => {
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

app.get("/getgroupmengineer/:cfranchise_id", async (req, res) => {
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

//Start Product List
app.get("/getproductlist", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = "SELECT * FROM product_master ORDER BY id ASC";

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


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
app.get("/requestcustomer", async (req, res) => {
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
    customer_lname,
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

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customer WHERE customer_id = ${customer_id} AND deleted = 0`;

    // Execute the duplicate check query
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    // If a duplicate customer is found
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same Customer_id  already exists!",
      });
    } else {
      // Insert the customer if no duplicate is found
      sql = `INSERT INTO awt_customer (customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email,salutation,customer_id)
      VALUES ('${customer_fname}', '${customer_lname}', '${customer_type}', '${customer_classification}', '${mobileno}', '${alt_mobileno}', '${dateofbirth}', '${anniversary_date}', '${email}','${salutation}','${customer_id}')`;

      // Execute the insert query
      await pool.request().query(sql);

      // Send success response
      return res.status(201).json({
        message: "Customer master added successfully",
      });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


// customer put 

app.put("/putcustomer", authenticateToken, async (req, res) => {
  const { id, customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email, salutation, customer_id, created_by } = req.body;


  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;


    // Step 1: Duplicate Check Query
    const duplicateCheckSQL = `
      SELECT * FROM awt_customer
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
        message: "Duplicate entry,  Customer already exists!"
      });
    }

    // Step 2: Update Query
    const updateSQL = `
     UPDATE awt_customer
     SET 
       customer_fname = @customer_fname,
       email = @email,
       mobileno = @mobileno,
       customer_lname = @customer_lname,
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
      .input('customer_lname', customer_lname)
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
app.get("/getcustomerlocation", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `
       SELECT * FROM awt_customerlocation ORDER BY id ASC
      `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// API to fetch a specific Customer Location by ID
app.get("/requestcustomerlocation/:id", async (req, res) => {
  const { id } = req.params;



  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Construct the SQL query (no parameter binding)
    const sql = `SELECT
                  ccl.*,
                  c.title as country_title,
                  r.title as region_title,
                  gs.title as geostate_title,
                  gc.title as geocity_title,
                  a.title as district_title,
                  p.pincode as pincode_title
                FROM awt_customerlocation as ccl,
                 awt_country as c ,
                 awt_region as r ,
                 awt_geostate as gs,
                 awt_geocity as gc,
                 awt_district as a ,
                 awt_pincode as p 
                WHERE ccl.deleted = 0 AND ccl.id = ${id}`;

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

// Insert new Customer Location with duplicate check
app.post("/postcustomerlocation", authenticateToken, async (req, res) => {
  const { country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccperson = '${ccperson}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_customerlocation (country_id, region_id, geostate_id, geocity_id, district_id, pincode_id, address, ccperson, ccnumber, address_type)
                         VALUES ('${country_id}', '${region_id}', '${geostate_id}', '${geocity_id}', '${area_id}', '${pincode_id}', '${address}', '${ccperson}', '${ccnumber}', '${address_type}')`;

      await pool.request().query(insertSql);

      return res.json({ message: "Customer Location added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while adding the customer location' });
  }
});

// Update existing Customer Location with duplicate check
app.put("/putcustomerlocation", authenticateToken, async (req, res) => {
  const {
    country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type, id
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = '${ccnumber}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const updateSql = `UPDATE awt_customerlocation SET country_id = '${country_id}', region_id = '${region_id}', geostate_id = '${geostate_id}', geocity_id = '${geocity_id}', district_id = '${area_id}', pincode_id = '${pincode_id}', address = '${address}', ccperson = '${ccperson}', ccnumber = '${ccnumber}', address_type = '${address_type}' WHERE id = '${id}'`;

      await pool.request().query(updateSql);

      return res.json({ message: "Customer Location updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the customer location' });
  }
});

// API to soft delete a Customer Location
app.post("/deletepincode", async (req, res) => {
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
app.get("/getproductunique", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the database
    const sql = "SELECT * FROM awt_uniqueproductmaster WHERE deleted = 0";

    // Execute the SQL query
    const result = await pool.request().query(sql);

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
  const { product, location, date, serialnumber } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = '${serialnumber}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with same serial number already exists!",
      });
    } else {
      // Check for soft-deleted products
      const checkSoftDeletedSql = `SELECT * FROM awt_uniqueproductmaster WHERE serial_no = '${serialnumber}' AND deleted = 1`;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // Restore soft-deleted product
        const restoreSoftDeletedSql = `UPDATE awt_uniqueproductmaster SET deleted = 0 WHERE serial_no = '${serialnumber}'`;
        await pool.request().query(restoreSoftDeletedSql);

        return res.json({
          message: "Soft-deleted Product with same serial number restored successfully!",
        });
      } else {
        // Insert new product
        const insertSql = `INSERT INTO awt_uniqueproductmaster (product, location, date, serial_no)
                          VALUES ('${product}', '${location}', '${date}', '${serialnumber}')`;
        await pool.request().query(insertSql);

        return res.json({ message: "Product added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});
app.put("/putproductunique", authenticateToken, async (req, res) => {
  const { product, id, location, date, serialnumber } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates (excluding the current product)
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = '${serialnumber}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with same serial number already exists!",
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
//Unique Product Master Linked to Location End

//Start Engineer Master
app.get("/getchildfranchise/:mfranchise_id",
  authenticateToken, async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      // SQL query to fetch data from the database
      const sql = "SELECT * FROM awt_childfranchisemaster WHERE deleted = 0";

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

    // SQL query to fetch data from the database with an INNER JOIN
    const sql = `
      SELECT r.*, c.title as childfranchise_title
      FROM awt_engineermaster r
      INNER JOIN awt_childfranchisemaster c ON r.cfranchise_id = c.id
      WHERE r.deleted = 0
    `;

    // Execute the SQL query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
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
    const { title,mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, employee_code, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address } = req.body;

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
app.put("/putengineer", authenticateToken, async (req, res) => {
  const { title,mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, employee_code, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address, id } = req.body;

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

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
  SELECT m.* FROM awt_engineermaster m
  WHERE m.deleted = 0 and m.id = ${engineerid}
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



// End Engineer Master

app.get("/getmasterlist", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Modified SQL query with explicit JOIN conditions
    const sql = `
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

    const result = await pool.request().query(sql);
    return res.json(result.recordset);
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



app.put("/putfranchisedata", authenticateToken, async (req, res) => {
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

// app.get("/getchildFranchiseDetails", async (req, res) => {
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

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
    SELECT m.*,
    p.title as parentfranchisetitle,
    c.title as country_name, 
    r.title as region_name, 
    s.title as state_name, 
    d.title as district_name,
    ct.title as city_name 
FROM awt_childfranchisemaster as m
INNER JOIN awt_country as c ON m.country_id = c.id
INNER JOIN awt_region as r ON m.region_id = r.id
INNER JOIN awt_geostate as s ON m.geostate_id = s.id
INNER JOIN awt_district as d ON m.area_id = d.id
INNER JOIN awt_geocity as ct ON TRY_CAST(m.geocity_id AS INT) = ct.id  -- Safer casting
INNER JOIN awt_franchisemaster as p ON m.pfranchise_id = p.licarecode
WHERE m.deleted = 0
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


//request Child Franchise populate data

app.get("/getchildfranchisepopulate/:childid", authenticateToken, async (req, res) => {
  const { childid } = req.params;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch data from the master list, customize based on your needs
    const sql = `
     SELECT m.*,p.title as parentfranchisetitle,c.title as country_name, r.title as region_name, s. title as state_name, d.title as district_name,ct. title city_name from  awt_childfranchisemaster as m,
awt_country as c,awt_region as r,awt_geostate as s,awt_district as d,awt_geocity as ct,awt_franchisemaster as p WHERE m.country_id = c.id AND m.region_id = r.id AND m.geostate_id = s.id 
AND m.area_id = d.id AND m.geocity_id = ct.id AND m.pfranchise_id = p.licarecode AND m.deleted = 0 and m.id = ${childid}
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
app.get("/requestchildfranchise/:id", async (req, res) => {
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
// app.post("/postchildfranchise", async (req, res) => {
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
      .query(`
        INSERT INTO awt_childfranchisemaster 
        (title, pfranchise_id, licare_code, partner_name, contact_person, email, mobile_no, password, address, 
         country_id, region_id, geostate_id, area_id, geocity_id, pincode_id, webste, gstno, panno, bankname, 
         bankacc, bankifsc, bankaddress, withliebher, lastworkinddate, contractacti, contractexpir, created_by)
        VALUES 
        (@title, @pfranchise_id, @licare_code, @partner_name, @contact_person, @email, @mobile_no, @password, 
         @address, @country_id, @region_id, @state, @area, @city, @pincode_id, @website, @gst_number, @pan_number, 
         @bank_name, @bank_account_number, @bank_ifsc_code, @bank_address,${with_liebherr} , @last_working_date, 
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
app.put("/putchildfranchise", authenticateToken, async (req, res) => {
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
app.put("/putproducttypedata", authenticateToken, async (req, res) => {
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
      const checkDuplicateSql = `SELECT * FROM product_line WHERE product_line = '${product_line}' AND id != ${id} AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Product Line already exists!" });
      } else {
        // Update the existing product line
        const updateSql = `UPDATE product_line SET product_line = '${product_line}', pline_code = '${pline_code}', updated_date = GETDATE(), updated_by = '${created_by}' WHERE id = ${id}`;
        await pool.request().query(updateSql);
        return res.json({ message: "Product Line updated successfully!" });
      }
    } else {
      // Check for duplicate entries for a new product line
      const checkDuplicateSql = `SELECT * FROM product_line WHERE product_line = '${product_line}' AND deleted = 0`;
      const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

      if (duplicateCheckResult.recordset.length > 0) {
        return res.status(409).json({ message: "Duplicate entry, Product Line already exists!" });
      } else {
        // Check for soft-deleted entries with the same product line
        const checkSoftDeletedSql = `SELECT * FROM product_line WHERE product_line = '${product_line}' AND deleted = 1`;
        const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedResult.recordset.length > 0) {
          // Restore the soft-deleted entry
          const restoreSoftDeletedSql = `UPDATE product_line SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}' WHERE product_line = '${product_line}'`;
          await pool.request().query(restoreSoftDeletedSql);
          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new product line
          const insertSql = `INSERT INTO product_line (product_line, pline_code, created_date, created_by) VALUES ('${product_line}', '${pline_code}', GETDATE(), '${created_by}')`;
          await pool.request().query(insertSql);
          return res.json({ message: "Product Line added successfully!" });
        }
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
app.put("/putproductlinedata", authenticateToken, async (req, res) => {
  const { id, product_line, pline_code, updated_by } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicate entries excluding the current ID
    const checkDuplicateSql = `SELECT * FROM product_line WHERE product_line = '${product_line}' AND deleted = 0 AND id != ${id}`;
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
app.put("/putmatdata", authenticateToken, async (req, res) => {
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
app.put("/putmanufacturer", authenticateToken, async (req, res) => {
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
app.put("/putratedata", authenticateToken, async (req, res) => {
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
app.put("/putprodata", authenticateToken, async (req, res) => {
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
app.get("/requestservicecontract/:id", async (req, res) => {
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


app.put("/putservicecontract", authenticateToken, async (req, res) => {
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
// app.get("/getservicecontractlist", async (req, res) => {
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
app.get("/getservicecontractlist", async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      customerName,
      customerMobile,
      contractNumber,
      contractType,
      startDate,
      endDate,
      productName,
      serialNumber,

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

    if (customerMobile) {
      sql += ` AND s.c.customer_mobile LIKE '%${customerMobile}%'`;
    }

    if (serialNumber) {
      sql += ` AND s.serialNumber LIKE '%${serialNumber}%'`;
    }

    if (productName) {
      sql += ` AND s.productName LIKE '%${productName}%'`;
    }

    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
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
// Insert for Lhiuser
app.post("/postlhidata", authenticateToken, async (req, res) => {
  const { Lhiuser,
    mobile_no,
    Password,
    UserCode,
    email,
    remarks,
    status,


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
        sql = `INSERT INTO lhi_user (Lhiuser,password,remarks,Usercode,mobile_no,email,status) VALUES ('${Lhiuser}','${Password}','${remarks}','${UserCode}','${mobile_no}','${email}','${status}')`
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
app.put("/putlhidata", authenticateToken, async (req, res) => {
  const {
    Lhiuser, id, updated_by, mobile_no, Usercode, password, status, email, remarks
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
          remarks = '${remarks}'
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
app.post("/deletelhidata", async (req, res) => {
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
app.post("/postcalldata", async (req, res) => {
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
app.put("/putcalldata", async (req, res) => {
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
app.put("/putsdata", authenticateToken, async (req, res) => {
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

app.get("/getcomplaintview/:complaintid", async (req, res) => {
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

app.post("/addcomplaintremark", async (req, res) => {
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

app.post("/uploadcomplaintattachments", upload.array("attachment"), async (req, res) => {
  const { ticket_no, remark_id, created_by } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  // Combine filenames into a single string
  const attachments = req.files.map((file) => file.filename); // Get all filenames
  const attachmentString = attachments.join(", "); // For a comma-separated string

  try {
    const pool = await poolPromise;

    // SQL query to insert attachments
    const sql = `INSERT INTO awt_complaintattachment (remark_id, ticket_no, attachment, created_by, created_date)
                    VALUES (${remark_id}, ${ticket_no}, '${attachmentString}', ${created_by}, GETDATE())`;
    const result = await pool.request().query(sql);

    res.json({
      message: "Files uploaded successfully",
      count: 1, // Only one entry created
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

// app.get("/getComplaintDuplicate/:customer_mobile", async (req, res) => {
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

app.get("/product_type", async (req, res) => {
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
      const sql = `INSERT INTO product_master (serial_no,item_code, item_description, itemCode,product_model,productType,productLineCode,productLine,productClassCode,productClass,material,manufacturer,itemType,serialized,sizeProduct,crm_productType,color,installationType,handleType,customerClassification,price_group,mrp,service_partner_basic)VALUES (@serial_identification,@item_code,@item_description,@item_code,@product_model,@product_type,@product_line_code,@product_line,@product_class_code,@product_class,@material,@manufacturer,@item_type,@serialized,@size,@crmproducttype,@colour,@installation_type,@handle_type,@customer_classification,@price_group,@mrp,@service_partner_basic);`;



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
  const { ticket_no, serial_no, ModelNumber, engineerdata, call_status, updated_by } = req.body;
  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  
  const engineer_code = engineerdata.join(',')

  try {
    const pool = await poolPromise;

    const updateSql = `
      UPDATE complaint_ticket
      SET engineer_code = '${engineer_code}',call_status = '${call_status}' , updated_by = '${updated_by}', updated_date = '${formattedDate}' WHERE ticket_no = '${ticket_no}'`;

    await pool.request().query(updateSql);

    return res.status(200).json({ message: "Ticket Formdata updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating the ticket" });
  }
});


app.post("/add_new_ticket", authenticateToken, async (req, res) => {
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
    pincode
  } = req.body;

  const formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const pool = await poolPromise;

    // Insert complaint ticket and return the inserted ID
    const complaintSQL = `
      INSERT INTO complaint_ticket (
        customer_name, customer_mobile, customer_email, address, 
        customer_id, ModelNumber,serial_no, assigned_to,state,city,area,pincode, created_date, created_by
      ) 
      OUTPUT INSERTED.id
      VALUES (
        @customer_name, @mobile, @email, @address, 
        @customer_id, @model,@serial_no, 1,@state, @city,@area,@pincode, @formattedDate, @created_by
      )
    `;

    const result = await pool
      .request()
      .input("customer_name", sql.NVarChar, customer_name)
      .input("mobile", sql.NVarChar, mobile)
      .input("email", sql.NVarChar, email)
      .input("address", sql.NVarChar, address)
      .input("customer_id", sql.Int, cust_id)
      .input("model", sql.NVarChar, product_id)
      .input("serial_no", serial_no)
      .input("state", sql.NVarChar, state)
      .input("city", sql.NVarChar, city)
      .input("area", sql.NVarChar, area)
      .input("pincode", sql.NVarChar, pincode)
      .input("formattedDate", sql.DateTime, formattedDate)
      .input("created_by", sql.Int, created_by)
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
      .json({ error: "An error occurred while adding the ticket." });
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





// Bahvehsh dubey


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const pool = await poolPromise;



    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password) // Adjust if password is hashed
      .query('SELECT * FROM awt_engineermaster WHERE mobile_no = @username AND password = @password');

    // console.log('SELECT * FROM awt_engineermaster WHERE email = @username AND password = @password')
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(400).json({ message: 'Invalid username or password' });
      console.log(res)
    }
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

app.get('/getheaddata', async (req, res) => {
  try {
    const pool = await poolPromise;

    const en_id = req.query.en_id;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE engineer_id = '${en_id}' ORDER BY id DESC`);

    const result1 = await pool.request()
      .query(`SELECT * FROM complaint_ticket where engineer_id = '${en_id}' and call_status in ('Closed', 'Cancelled') order by id DESC `);

    const totalTickets = result.recordset.length || 0;
    const cancleled = result1.recordset.length || 0;
    const pendingTickets = Math.max(totalTickets - cancleled, 0);

    res.status(200).json({
      totalTickets,
      cancleled,
      pendingTickets
    });

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});

app.get('/getcomplaint', async (req, res) => {
  try {
    const pool = await poolPromise;

    const en_id = req.query.en_id;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE engineer_id = '${en_id}' ORDER BY id DESC`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});

app.get('/SymptomCode', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from symptom_code where deleted = 0`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});
app.get('/CauseCode', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from cause_code where deleted = 0`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});
app.get('/ActionCode', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from action_code where deleted = 0`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});
app.get('/CallType', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from calltype where deleted = 0`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});
app.get('/CallStatus', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from call_status where deleted = 0`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});


app.get('/getcomplaintdetailsdata', async (req, res) => {
  try {
    const pool = await poolPromise;

    const id = req.query.cid;

    const result = await pool.request()
      .query(`SELECT * FROM complaint_ticket WHERE id = '${id}'`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});


app.get('/getremark', async (req, res) => {
  try {
    const pool = await poolPromise;

    const id = req.query.cid;

    const result = await pool.request()
      .query(`SELECT * FROM awt_complaintremark WHERE ticket_no = '${id}'`);

    if (result.recordset.length > 0) {
      res.status(200).json({ data: result.recordset });
    } else {
      res.status(200).json({ Message: 'No records found' });
    }

  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the database query' });
  }
});

// .input('call_remark', sql.VarChar, call_remark)
app.post('/updatecomplaint', authenticateToken, async (req, res) => {
  const { actioncode, service_charges, call_remark, call_status, call_type, causecode, other_charge, symptomcode, com_id, warranty_status } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('actioncode', sql.VarChar, actioncode)
      .input('symptomcode', sql.VarChar, symptomcode)
      .input('causecode', sql.VarChar, causecode)
      .input('service_charges', sql.VarChar, service_charges)
      .input('call_status', sql.VarChar, call_status)
      .input('call_type', sql.VarChar, call_type)
      .input('other_charge', sql.VarChar, other_charge)
      .input('warranty_status', sql.VarChar, warranty_status)
      .input('com_id', sql.VarChar, com_id)
      .query('UPDATE complaint_ticket SET warranty_status = @warranty_status, symptom_code = @symptomcode, cause_code = @causecode, action_code = @actioncode, service_charges = @service_charges, call_status = @call_status, call_type = @call_type, other_charges = @other_charge WHERE id = @com_id');

    // Check if any rows were updated
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Update successful' });
    } else {
      res.status(400).json({ message: 'Failed to update: No rows affected' });
    }
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during the update' });
  }
});

//Start Complaint List
// Complaint List API with filters
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

      csp,
      msp,
      mode_of_contact,
      customer_class,
    } = req.query;

    console.log('Received status:', status); // Debug log

    let sql = `
        SELECT c.*, e.title as assigned_name, 
        DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays 
        FROM complaint_ticket AS c
        JOIN awt_engineermaster AS e ON c.engineer_id = e.id
        WHERE c.deleted = 0
    `;

    let nots = 'NOT';



    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) >= CAST('${fromDate}' AS DATE)
                AND CAST(c.ticket_date AS DATE) <= CAST('${toDate}' AS DATE)`;
      nots = ''
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE '%${customerName}%'`;
      nots = ''
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
      nots = ''
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
      nots = ''
    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE '%${serialNo}%'`;
      nots = ''
    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
      nots = ''
    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
      nots = ''
    }
    if (customerID) {
      sql += ` AND c.customer_id LIKE '%${customerID}%'`;
      nots = ''
    }
    //csp msp call_type and customer_class

    if (csp) {
      sql += ` AND c.csp LIKE '%${csp}%'`;
      nots = ''
    }

    if (msp) {
      sql += ` AND c.msp LIKE '%${msp}%'`;
      nots = ''
    }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
      nots = ''
    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      nots = ''
    }



    // Modified status filtering logic
    if (status === 'Closed' || status === 'Cancelled') {
      sql += ` AND c.call_status = '${status}'`;
    } else if (status === '') {
      // sql += ` AND c.call_status  IN ('Closed', 'Cancelled')`;
      sql += ``;
    } else if (status) {
      sql += ` AND c.call_status = '${status}'`;
    } else {
      // sql += ` AND c.call_status ${nots} IN ('Closed', 'Cancelled')`;
      sql += ``;
    }

    if (status == undefined) {
      sql += ``
    }


    sql += " ORDER BY c.id DESC";



    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
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
    } = req.query;

    console.log('Received status:', status); // Debug log

    let sql = `
        SELECT c.*, e.title as assigned_name, 
        DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays 
        FROM complaint_ticket AS c
        JOIN awt_engineermaster AS e ON c.engineer_id = e.id
        WHERE c.deleted = 0 AND c.csp = '${licare_code}'
    `;

    let nots = 'NOT';



    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) >= CAST('${fromDate}' AS DATE)
                AND CAST(c.ticket_date AS DATE) <= CAST('${toDate}' AS DATE)`;
      nots = ''
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE '%${customerName}%'`;
      nots = ''
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
      nots = ''
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
      nots = ''
    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE '%${serialNo}%'`;
      nots = ''
    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
      nots = ''
    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
      nots = ''
    }
    if (customerID) {
      sql += ` AND c.customer_id LIKE '%${customerID}%'`;
      nots = ''
    }

    //csp msp call_type and customer_class

    if (csp) {
      sql += ` AND c.csp LIKE '%${csp}%'`;
      nots = ''
    }

    // if (msp) {
    //   sql += ` AND c.msp LIKE '%${msp}%'`;
    //   nots = ''
    // }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
      nots = ''
    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      nots = ''
    }


    // Modified status filtering logic
    if (status === 'Closed' || status === 'Cancelled') {
      sql += ` AND c.call_status = '${status}'`;
    } else if (status === '') {
      // sql += ` AND c.call_status  IN ('Closed', 'Cancelled')`;
      sql += ``;
    } else if (status) {
      sql += ` AND c.call_status = '${status}'`;
    } else {
      // sql += ` AND c.call_status ${nots} IN ('Closed', 'Cancelled')`;
      sql += ``;
    }

    if (status == undefined) {
      sql += ``
    }


    sql += " ORDER BY c.id DESC";



    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});

//CSP LIST END 


//MSP complaint list

app.get("/getcomplainlistmsp", authenticateToken, async (req, res) => {
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

      msp,
      mode_of_contact,
      customer_class,
    } = req.query;

    console.log('Received status:', status); // Debug log

    let sql = `
        SELECT c.*, e.title as assigned_name, 
        DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays 
        FROM complaint_ticket AS c
        JOIN awt_engineermaster AS e ON c.engineer_id = e.id
        WHERE c.deleted = 0 AND c.msp = '${licare_code}'
    `;

    let nots = 'NOT';



    if (fromDate && toDate) {
      sql += ` AND CAST(c.ticket_date AS DATE) >= CAST('${fromDate}' AS DATE)
                AND CAST(c.ticket_date AS DATE) <= CAST('${toDate}' AS DATE)`;
      nots = ''
    }

    if (customerName) {
      sql += ` AND c.customer_name LIKE '%${customerName}%'`;
      nots = ''
    }

    if (customerEmail) {
      sql += ` AND c.customer_email LIKE '%${customerEmail}%'`;
      nots = ''
    }

    if (customerMobile) {
      sql += ` AND c.customer_mobile LIKE '%${customerMobile}%'`;
      nots = ''
    }

    if (serialNo) {
      sql += ` AND c.serial_no LIKE '%${serialNo}%'`;
      nots = ''
    }

    if (productCode) {
      sql += ` AND c.ModelNumber LIKE '%${productCode}%'`;
      nots = ''
    }

    if (ticketno) {
      sql += ` AND c.ticket_no LIKE '%${ticketno}%'`;
      nots = ''
    }
    if (customerID) {
      sql += ` AND c.customer_id LIKE '%${customerID}%'`;
      nots = ''
    }

    //csp msp call_type and customer_class


    if (msp) {
      sql += ` AND c.msp LIKE '%${msp}%'`;
      nots = ''
    }

    if (mode_of_contact) {
      sql += ` AND c.mode_of_contact LIKE '%${mode_of_contact}%'`;
      nots = ''
    }

    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      nots = ''
    }


    // Modified status filtering logic
    if (status === 'Closed' || status === 'Cancelled') {
      sql += ` AND c.call_status = '${status}'`;
    } else if (status === '') {
      // sql += ` AND c.call_status  IN ('Closed', 'Cancelled')`;
      sql += ``;
    } else if (status) {
      sql += ` AND c.call_status = '${status}'`;
    } else {
      // sql += ` AND c.call_status ${nots} IN ('Closed', 'Cancelled')`;
      sql += ``;
    }

    if (status == undefined) {
      sql += ``
    }


    sql += " ORDER BY c.id DESC";



    console.log('SQL Query:', sql); // Debug log
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});

//MSP complaint list

// end Complaint list


//Register Page Complaint Duplicate Start

app.get("/getmultiplelocation/:pincode", authenticateToken, async (req, res) => {
  const { pincode } = req.params;

  try {

    const pool = await poolPromise;

    const sql = `SELECT cn.title as country,r.title as region, s.title as state, d.title as district, c.title as city, o.owner, f.title as franchiseem, fm.title as childfranchiseem FROM awt_pincode as p 
    LEFT JOIN awt_region as r on p.region_id = r.id 
    LEFT JOIN awt_country as cn on p.country_id = cn.id
    LEFT JOIN awt_geostate as s on p.geostate_id = s.id 
    LEFT JOIN awt_district as d on p.area_id = d.id 
    LEFT JOIN awt_geocity as c on p.geocity_id = c.id 
    LEFT JOIN pincode_allocation as o on p.pincode = o.pincode
    LEFT JOIN awt_childfranchisemaster as fm on fm.licare_code = o.owner
    LEFT JOIN awt_franchisemaster as f on f.licarecode = fm.pfranchise_id
    where p.pincode = @pincode`

    const result = await pool.request()
      .input('pincode', pincode)
      .query(sql);

    return res.json(result.recordset);

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
      const sql = "EXEC GetComplaintDetails @comp_no = @comp_no";

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



