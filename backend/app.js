const sql = require("mssql");
const express = require('express');
const app = express();
const cors = require('cors');
const complaint = require("./Routes/complaint");
const common = require("./Routes/common");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");

app.use(cors({ origin: "*" }));
app.use(express.json());

// this is for use routing

app.use("/", complaint);
app.use("/", common);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Folder where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
 
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

 

//Country Master Start
app.get("/getdata", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM awt_country WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});


app.post("/login", async (req, res) => {
  const { Lhiuser, password } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      SELECT id, Lhiuser 
      FROM lhi_user 
      WHERE Lhiuser = '${Lhiuser}' 
        AND password = '${password}'
    `;

    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      res.json({ id: result.recordset[0].id, Lhiuser: result.recordset[0].Lhiuser });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});


app.get("/requestdata/:id", async (req, res) => {
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


app.post("/postdata", async (req, res) => {
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
app.put("/putdata", async (req, res) => {
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


app.post("/deletedata", async (req, res) => {
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
      WHERE r.deleted = 0
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
      WHERE title = '${title}' 
        AND deleted = 0
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
      WHERE title = '${title}' 
        AND id != ${id} 
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
// API to fetch  Region based on the selected country
app.get("/getregion/:country_id", async (req, res) => {
  const { country_id } = req.params;
  
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch regions for the given country_id, excluding soft-deleted records
    const sqlQuery = `
      SELECT * FROM awt_region
      WHERE country_id = ${country_id} 
        AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sqlQuery);

    if (result.recordset.length > 0) {
      // Return the fetched regions
      res.json(result.recordset);
    } else {
      res.status(404).json({ message: "No regions found for this country" });
    }
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    res.status(500).json({ message: "Database error", error: err });
  }
});


// API to fetch all Geo states that are not soft deleted
app.get("/getgeostates", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch geostates, including country and region titles
    const sqlQuery = `
      SELECT gs.*, c.title as country_title, r.title as region_title 
      FROM awt_geostate gs 
      JOIN awt_country c ON gs.country_id = c.id 
      JOIN awt_region r ON gs.region_id = r.id 
      WHERE gs.deleted = 0
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
app.get("/requestgeostate/:id", async (req, res) => {
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
app.post("/postgeostate", async (req, res) => {
  const { title, country_id, region_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the same title exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM awt_geostate 
      WHERE title = '${title}' AND deleted = 0
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
app.put("/putgeostate", async (req, res) => {
  const { title, id, country_id, region_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the same title exists for another record, excluding the current ID
    const checkDuplicateSql = `
      SELECT * FROM awt_geostate 
      WHERE title = '${title}' AND id != ${id} AND deleted = 0
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
app.post("/deletegeostate", async (req, res) => {
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
app.get("/getregionscity/:country_id", async (req, res) => {
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
app.get("/getgeostatescity/:region_id", async (req, res) => {
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


// API to fetch all cities (joining countries, regions, and geostates)
app.get("/getgeocities", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to fetch geocities with related country, region, and geostate titles
    const sql = `
      SELECT gc.*, c.title AS country_title, r.title AS region_title, gs.title AS geostate_title
      FROM awt_geocity gc
      JOIN awt_country c ON gc.country_id = c.id
      JOIN awt_region r ON gc.region_id = r.id
      JOIN awt_geostate gs ON gc.geostate_id = gs.id
      WHERE gc.deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the fetched geocities
    return res.json(result.recordset);

  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Database error", error: err });
  }
});


// API to fetch a specific GEO city by ID
app.get("/requestgeocity/:id", async (req, res) => {
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
app.post("/postgeocity", async (req, res) => {
  const { title, country_id, region_id, geostate_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to check for duplicate entries
    const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = '${title}' AND geostate_id ='${geostate_id}' AND deleted = 0`;
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
        const insertSql = `INSERT INTO awt_geocity (title, country_id, region_id, geostate_id) VALUES ('${title}', ${country_id}, ${region_id}, ${geostate_id})`;
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
app.put("/putgeocity", async (req, res) => {
  const { title, id, country_id, region_id, geostate_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // SQL query to check for duplicates (excluding the current record's id)
    const checkDuplicateSql = `SELECT * FROM awt_geocity WHERE title = '${title}' AND geostate_id ='${geostate_id}' AND id != ${id} AND deleted = 0`;
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
app.post("/deletegeocity", async (req, res) => {
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
app.get("/getcountries", async (req, res) => {
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
app.get("/getregions/:country_id", async (req, res) => {
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
app.get("/getgeostates/:region_id", async (req, res) => {
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
app.get("/getgeocities_a/:geostate_id", async (req, res) => {
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
app.get("/getareas", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `
      SELECT a.*, c.title as country_title, r.title as region_title, gs.title as geostate_title, gc.title as geocity_title
      FROM awt_area a
      JOIN awt_country c ON a.country_id = c.id
      JOIN awt_region r ON a.region_id = r.id
      JOIN awt_geostate gs ON a.geostate_id = gs.id
      JOIN awt_geocity gc ON a.geocity_id = gc.id
      WHERE a.deleted = 0
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
             gs.title AS geostate_title, 
             gc.title AS geocity_title
      FROM awt_area a
      JOIN awt_country c ON a.country_id = c.id
      JOIN awt_region r ON a.region_id = r.id
      JOIN awt_geostate gs ON a.geostate_id = gs.id
      JOIN awt_geocity gc ON a.geocity_id = gc.id
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
  const { title, country_id, region_id, geostate_id, geocity_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the area already exists
    const checkDuplicateSql = `
      SELECT * FROM awt_area WHERE title = '${title}' AND geocity_id = '${geocity_id}' AND deleted = 0
    `;
    const checkResult = await pool.request().query(checkDuplicateSql);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Area already exists!" });
    }

    // Insert the new area
    const insertSql = `
      INSERT INTO awt_area (title, country_id, region_id, geostate_id, geocity_id)
      VALUES ('${title}', ${country_id}, ${region_id}, ${geostate_id}, ${geocity_id})
    `;
    const insertResult = await pool.request().query(insertSql);

    return res.json({ message: "Area added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

// Update existing area with duplicate check
app.put("/putarea", async (req, res) => {
  const { title, id, country_id, region_id, geostate_id, geocity_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the area already exists
    const checkDuplicateSql = `
      SELECT * FROM awt_area WHERE title = '${title}' AND geocity_id = '${geocity_id}' AND id != ${id} AND deleted = 0
    `;
    const checkResult = await pool.request().query(checkDuplicateSql);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Area already exists!" });
    }

    // Update the area
    const updateSql = `
      UPDATE awt_area 
      SET title = '${title}', country_id = ${country_id}, region_id = ${region_id}, 
          geostate_id = ${geostate_id}, geocity_id = ${geocity_id}
      WHERE id = ${id}
    `;
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
      UPDATE awt_area SET deleted = 1 WHERE id = ${id}
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
app.get("/getregionspincode/:country_id", async (req, res) => {
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
app.get("/getgeostatespincode/:region_id", async (req, res) => {
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
app.get("/getgeocities_a/:geostate_id", async (req, res) => {
  const { geostate_id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_geocity WHERE geostate_id = ${geostate_id} AND deleted = 0`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Return only the recordset data
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json(err); // Return error response
  }
});


// API to fetch areas based on selected geocity (for the area dropdown)
app.get("/getareas/:geocity_id", async (req, res) => {
  const { geocity_id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `SELECT * FROM awt_area WHERE geocity_id = ${geocity_id} AND deleted = 0`;
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
      JOIN awt_area a ON p.area_id = a.id
      WHERE p.deleted = 0
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

    // Direct SQL query without parameter binding
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
      INNER JOIN awt_area a ON p.area_id = a.id
      WHERE p.id = ${id} AND p.deleted = 0
    `;

    // Execute the query and get the result
    const result = await pool.request().query(sql);

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
app.post("/deletepincode", async (req, res) => {
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
// Product list end

//Category Start
app.get("/getcat", async (req, res) => {
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
app.post("/postdatacat", async (req, res) => {
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
app.get("/requestdatacat/:id", async (req, res) => {
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
app.put("/putcatdata", async (req, res) => {
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
app.post("/deletecatdata", async (req, res) => {
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
app.get("/getsubcategory", async (req, res) => {
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

app.get("/requestsubcat/:id", async (req, res) => {
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
app.post("/postsubcategory", async (req, res) => {
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
app.put("/putsubcategory", async (req, res) => {
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
app.post("/deletesubcat", async (req, res) => {
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
app.get("/getcategory", async (req, res) => {
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
app.get("/getcdata", async (req, res) => {
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

// Insert for Channelpartner
app.post("/postcdata", async (req, res) => {
  try {
    const { Channelpartner } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same channelpartner exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * 
      FROM awt_channelpartner 
      WHERE Channel_partner = '${Channelpartner}' AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Channelpartner already exists!" });
    } else {
      // Step 2: Check if the same channelpartner exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT * 
        FROM awt_channelpartner 
        WHERE Channel_partner = '${Channelpartner}' AND deleted = 1
      `;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE awt_channelpartner 
          SET deleted = 0 
          WHERE Channel_partner = '${Channelpartner}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO awt_channelpartner (Channel_partner) 
          VALUES ('${Channelpartner}')
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




// edit for Channelpartner

app.get("/requestcdata/:id", async (req, res) => {
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


// update for Channelpartner
app.put("/putcdata", async (req, res) => {
  try {
    const { Channelpartner, id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same channelpartner exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * 
      FROM awt_channelpartner 
      WHERE Channel_partner = '${Channelpartner}' AND id != ${id} AND deleted = 0
    `;
    const duplicateCheckResult = await pool.request().query(checkDuplicateSql);

    if (duplicateCheckResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Channelpartner already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
        UPDATE awt_channelpartner 
        SET Channel_partner = '${Channelpartner}' 
        WHERE id = ${id}
      `;
      await pool.request().query(updateSql);
      return res.json({ message: "Channelpartner updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating channel partner:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating channel partner" });
  }
});

// delete for Channelpartner
app.post("/deletecdata", async (req, res) => {
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

// complaint code
app.get("/getcom", async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    const sql = `
      SELECT * 
      FROM complaint_code 
      WHERE deleted = 0
    `;
    
    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaint codes:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching complaint codes" });
  }
});

// Insert for complaintcode
app.post("/postdatacom", async (req, res) => {
  try {
    const { id, complaintcode, created_by } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    if (id) {
      // Step 1: Check if the same complaintcode exists and is not soft-deleted for other IDs
      const checkDuplicateSql = `
        SELECT * 
        FROM complaint_code 
        WHERE complaintcode = '${complaintcode}' AND id != ${id} AND deleted = 0
      `;
      const duplicateData = await pool.request().query(checkDuplicateSql);

      if (duplicateData.recordset.length > 0) {
        // If duplicate data exists for another ID
        return res.status(409).json({ message: "Duplicate entry, complaintcode already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `
          UPDATE complaint_code 
          SET complaintcode = '${complaintcode}', updated_date = GETDATE(), updated_by = '${created_by}' 
          WHERE id = ${id}
        `;
        await pool.request().query(updateSql);

        return res.json({ message: "complaintcode updated successfully!" });
      }
    } else {
      // Step 3: Same logic as before for insert if ID is not provided
      // Check if the same complaintcode exists and is not soft-deleted
      const checkDuplicateSql = `
        SELECT * 
        FROM complaint_code 
        WHERE complaintcode = '${complaintcode}' AND deleted = 0
      `;
      const duplicateData = await pool.request().query(checkDuplicateSql);

      if (duplicateData.recordset.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res.status(409).json({ message: "Duplicate entry, complaintcode already exists!" });
      } else {
        // Check if the same complaintcode exists but is soft-deleted
        const checkSoftDeletedSql = `
          SELECT * 
          FROM complaint_code 
          WHERE complaintcode = '${complaintcode}' AND deleted = 1
        `;
        const softDeletedData = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedData.recordset.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `
            UPDATE complaint_code 
            SET deleted = 0, updated_date = GETDATE(), updated_by = '${created_by}' 
            WHERE complaintcode = '${complaintcode}'
          `;
          await pool.request().query(restoreSoftDeletedSql);

          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new entry if no duplicates found
          const insertSql = `
            INSERT INTO complaint_code (complaintcode, created_date, created_by) 
            VALUES ('${complaintcode}', GETDATE(), '${created_by}')
          `;
          await pool.request().query(insertSql);

          return res.json({ message: "complaintcode added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error("Error processing request:", err); // Log error for debugging
    return res.status(500).json({ message: "Error processing request" });
  }
});

// edit for complaintcode

app.get("/requestdatacom/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      SELECT * 
      FROM complaint_code 
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Check if data is found and return the first entry
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

// update for complaintcode
app.put("/putcomdata", async (req, res) => {
  try {
    const { id, complaintcode, updated_by } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the updated complaintcode already exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * 
      FROM complaint_code 
      WHERE complaintcode = '${complaintcode}' 
        AND deleted = 0 
        AND id != ${id}
    `;

    // Execute the query to check for duplicates
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If duplicate data exists
      return res.status(409).json({ message: "Duplicate entry, complaintcode already exists!" });
    } else {
      // Step 2: Update complaintcode data if no duplicates found
      const updateSql = `
        UPDATE complaint_code 
        SET complaintcode = '${complaintcode}', 
            updated_by = '${updated_by}', 
            updated_date = GETDATE() 
        WHERE id = ${id} AND deleted = 0
      `;

      // Execute the update query
      await pool.request().query(updateSql);

      return res.json({ message: "Complaintcode updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating complaintcode:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating complaintcode" });
  }
});

// delete for complaintcode
app.post("/deletecomdata", async (req, res) => {
  try {
    const { id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE complaint_code 
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

//Reason Code Start
// Get all reason codes
app.get("/getreason", async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = "SELECT * FROM reason_code WHERE deleted = 0";

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the result as JSON
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching reason codes:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching reason codes" });
  }
});

// Insert or update reason code
app.post("/postdatareason", async (req, res) => {
  const { id, reasoncode, created_by } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    if (id) {
      // Step 1: Check if the same reasoncode exists and is not soft-deleted for other IDs
      const checkDuplicateSql = `
        SELECT * FROM reason_code 
        WHERE reasoncode = '${reasoncode}' 
        AND id != ${id} 
        AND deleted = 0
      `;
      
      // Execute the query
      const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

      if (checkDuplicateResult.recordset.length > 0) {
        // If duplicate data exists for another ID
        return res.status(409).json({ message: "Duplicate entry, reasoncode already exists!" });
      } else {
        // Step 2: Update the entry with the given ID
        const updateSql = `
          UPDATE reason_code 
          SET reasoncode = '${reasoncode}', 
              updated_date = GETDATE(), 
              updated_by = '${created_by}' 
          WHERE id = ${id}
        `;
        
        // Execute the query
        await pool.request().query(updateSql);
        
        return res.json({ message: "reasoncode updated successfully!" });
      }
    } else {
      // Step 3: Same logic as before for insert if ID is not provided

      // Check if the same reasoncode exists and is not soft-deleted
      const checkDuplicateSql = `
        SELECT * FROM reason_code 
        WHERE reasoncode = '${reasoncode}' 
        AND deleted = 0
      `;
      
      // Execute the query
      const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

      if (checkDuplicateResult.recordset.length > 0) {
        // If duplicate data exists (not soft-deleted)
        return res.status(409).json({ message: "Duplicate entry, reasoncode already exists!" });
      } else {
        // Check if the same reasoncode exists but is soft-deleted
        const checkSoftDeletedSql = `
          SELECT * FROM reason_code 
          WHERE reasoncode = '${reasoncode}' 
          AND deleted = 1
        `;
        
        // Execute the query
        const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

        if (softDeletedResult.recordset.length > 0) {
          // If soft-deleted data exists, restore the entry
          const restoreSoftDeletedSql = `
            UPDATE reason_code 
            SET deleted = 0, 
                updated_date = GETDATE(), 
                updated_by = '${created_by}' 
            WHERE reasoncode = '${reasoncode}'
          `;
          
          // Execute the query
          await pool.request().query(restoreSoftDeletedSql);

          return res.json({ message: "Soft-deleted data restored successfully!" });
        } else {
          // Insert new entry if no duplicates found
          const insertSql = `
            INSERT INTO reason_code (reasoncode, created_date, created_by) 
            VALUES ('${reasoncode}', GETDATE(), '${created_by}')
          `;
          
          // Execute the query
          await pool.request().query(insertSql);
          
          return res.json({ message: "reasoncode added successfully!" });
        }
      }
    }
  } catch (err) {
    console.error("Error handling reasoncode:", err);
    return res.status(500).json({ message: "Error handling reasoncode" });
  }
});

// Edit reason code by ID
app.get("/requestdatareason/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query with the 'id' value inserted directly into the query string
    const sql = `
      SELECT * FROM reason_code 
      WHERE id = ${id} 
      AND deleted = 0
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    // Return the first result, assuming the ID is unique
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    } else {
      return res.status(404).json({ message: "Reason not found" });
    }
  } catch (err) {
    console.error("Error fetching reason code:", err);
    return res.status(500).json({ message: "Error fetching reason code" });
  }
});

// Update reason code
app.put("/putreasondata", async (req, res) => {
  const { id, reasoncode, updated_by } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the updated reasoncode already exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM reason_code 
      WHERE reasoncode = '${reasoncode}' 
      AND deleted = 0 
      AND id != ${id}
    `;

    // Execute the check duplicate query
    const checkResult = await pool.request().query(checkDuplicateSql);

    if (checkResult.recordset.length > 0) {
      // If duplicate data exists
      return res.status(409).json({ message: "Duplicate entry, reasoncode already exists!" });
    } else {
      // Step 2: Update reasoncode data if no duplicates found
      const sql = `
        UPDATE reason_code 
        SET reasoncode = '${reasoncode}', 
            updated_by = '${updated_by}', 
            updated_date = GETDATE() 
        WHERE id = ${id} AND deleted = 0
      `;

      // Execute the update query
      await pool.request().query(sql);

      // Return success message
      return res.json({ message: "reasoncode updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating reasoncode:", err);
    return res.status(500).json({ message: "Error updating reasoncode" });
  }
});

// Soft-delete reason code by ID
app.post("/deletereasondata", async (req, res) => {
  const { id } = req.body;

  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
      UPDATE reason_code 
      SET deleted = 1 
      WHERE id = ${id}
    `;

    // Execute the query
    await pool.request().query(sql);

    // Return success message
    return res.json({ message: "Reason data deleted successfully!" });
  } catch (err) {
    console.error("Error deleting reason data:", err);
    return res.status(500).json({ message: "Error updating reason data" });
  }
});

// Reason Code end

//action code Start
app.get("/getaction", async (req, res) => {
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

    // Return the data
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error retrieving action data:", err);
    return res.status(500).json({ message: "Error retrieving action data" });
  }
});

// Insert for actioncode
app.post("/postdataaction", async (req, res) => {
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
app.get("/requestdataaction/:id", async (req, res) => {
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
app.put("/putactiondata", async (req, res) => {
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
app.post("/deleteactiondata", async (req, res) => {
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
    const result = await pool.request().query(sql);

    // Return the result
    return res.json(result);
  } catch (err) {
    console.error("Error deleting action data:", err);
    return res.status(500).json({ message: "Error updating user" });
  }
});
// action code end
