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
app.get("/getcustomer", async (req, res) => {
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
app.post("/deletecustomer", async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Create the SQL query with string interpolation (no parameter binding)
    const sql = `UPDATE awt_customer SET deleted = 1 WHERE id = ${id}`;

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
app.post("/postcustomer", async (req, res) => {
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
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customer WHERE mobileno = ${mobileno} AND dateofbirth = '${dateofbirth}' AND deleted = 0`;

    // Execute the duplicate check query
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    // If a duplicate customer is found
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number and DOB already exists!",
      });
    } else {
      // Insert the customer if no duplicate is found
      const insertSql = `INSERT INTO awt_customer (customer_fname, customer_lname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email)
                         VALUES ('${customer_fname}', '${customer_lname}', '${customer_type}', '${customer_classification}', '${mobileno}', '${alt_mobileno}', '${dateofbirth}', '${anniversary_date}', '${email}')`;

      // Execute the insert query
      await pool.request().query(insertSql);

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

//Customer Location Start
app.get("/getareadrop/:geocity_id", async (req, res) => {
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

app.get("/getpincodedrop/:area_id", async (req, res) => {
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
  app.get("/getcustomerlocation", async (req, res) => {
    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;
  
      // Construct the SQL query (no parameter binding)
      const sql = `
        SELECT 
          ccl.*, 
          c.title AS country_title, 
          r.title AS region_title, 
          gs.title AS geostate_title, 
          gc.title AS geocity_title, 
          a.title AS area_title, 
          p.pincode AS pincode_title 
        FROM awt_customerlocation ccl 
        JOIN awt_country c ON ccl.country_id = c.id 
        JOIN awt_region r ON ccl.region_id = r.id 
        JOIN awt_geostate gs ON ccl.geostate_id = gs.id 
        JOIN awt_geocity gc ON ccl.geocity_id = gc.id 
        JOIN awt_area a ON ccl.area_id = a.id 
        JOIN awt_pincode p ON ccl.pincode_id = p.id 
        WHERE ccl.deleted = 0;
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
                  a.title as area_title, 
                  p.pincode as pincode_title 
                FROM awt_customerlocation ccl 
                JOIN awt_country c ON ccl.country_id = c.id 
                JOIN awt_region r ON ccl.region_id = r.id 
                JOIN awt_geostate gs ON ccl.geostate_id = gs.id 
                JOIN awt_geocity gc ON ccl.geocity_id = gc.id 
                JOIN awt_area a ON ccl.area_id = a.id 
                JOIN awt_pincode p ON ccl.pincode_id = p.id 
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
app.post("/postcustomerlocation", async (req, res) => {
  const { country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = '${ccnumber}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_customerlocation (country_id, region_id, geostate_id, geocity_id, area_id, pincode_id, address, ccperson, ccnumber, address_type) 
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
app.put("/putcustomerlocation", async (req, res) => {
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
      const updateSql = `UPDATE awt_customerlocation SET country_id = '${country_id}', region_id = '${region_id}', geostate_id = '${geostate_id}', geocity_id = '${geocity_id}', area_id = '${area_id}', pincode_id = '${pincode_id}', address = '${address}', ccperson = '${ccperson}', ccnumber = '${ccnumber}', address_type = '${address_type}' WHERE id = '${id}'`;

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
app.get("/getproductunique", async (req, res) => {
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
app.get("/requestproductunique/:id", async (req, res) => {
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
app.post("/postproductunique", async (req, res) => {
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
      const checkSoftDeletedSql = `SELECT * FROM awt_uniqueproductmaster WHERE serialnumber = '${serialnumber}' AND deleted = 1`;
      const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (softDeletedResult.recordset.length > 0) {
        // Restore soft-deleted product
        const restoreSoftDeletedSql = `UPDATE awt_uniqueproductmaster SET deleted = 0 WHERE serialnumber = '${serialnumber}'`;
        await pool.request().query(restoreSoftDeletedSql);

        return res.json({
          message: "Soft-deleted Product with same serial number restored successfully!",
        });
      } else {
        // Insert new product
        const insertSql = `INSERT INTO awt_uniqueproductmaster (product, location, date, serialnumber) 
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
app.put("/putproductunique", async (req, res) => {
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
app.post("/deleteproductunique", async (req, res) => {
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
app.get("/getchildfranchise", async (req, res) => {
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
app.get("/getengineer", async (req, res) => {
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
app.get("/requestengineer/:id", async (req, res) => {
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
app.post("/postengineer", async (req, res) => {
  const { title, cfranchise_id, password, email, mobile_no } = req.body;

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
        const insertSql = `INSERT INTO awt_engineermaster (title, cfranchise_id, mobile_no, email, password) 
                           VALUES ('${title}', '${cfranchise_id}', '${mobile_no}', '${email}', '${password}')`;
        await pool.request().query(insertSql);
        return res.json({ message: "Engineer added successfully!" });
      }
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while adding the engineer" });
  }
});
app.put("/putengineer", async (req, res) => {
  const { title, id, cfranchise_id, password, email, mobile_no } = req.body;

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
                         SET title = '${title}', cfranchise_id = '${cfranchise_id}', mobile_no = '${mobile_no}', email = '${email}', password = '${password}' 
                         WHERE id = '${id}'`;

      await pool.request().query(updateSql);
      return res.json({ message: "Engineer updated successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while updating the engineer" });
  }
});
app.post("/deleteengineer", async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject `id` into the SQL query
    const sql = `UPDATE awt_engineermaster SET deleted = 1 WHERE id = '${id}'`;

    // Execute the SQL query
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Engineer" });
  }
});
// End Engineer Master

// Start Franchise Master - Parent
app.get("/getfranchisedata", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM awt_franchisemaster WHERE deleted = 0");
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching franchise data' });
  }
});
app.get("/requestfranchisedata/:id", async (req, res) => {
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

app.post("/postfranchisedata", async (req, res) => {
  const { title } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicate entries in awt_franchisemaster
    const checkDuplicateResult = await pool.request().query(`SELECT * FROM awt_franchisemaster WHERE title = '${title}' AND deleted = 0`);
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Franchise Master already exists!",
      });
    }

    // Check for soft deleted entries
    const checkSoftDeletedResult = await pool.request().query(`SELECT * FROM awt_franchisemaster WHERE title = '${title}' AND deleted = 1`);
    if (checkSoftDeletedResult.recordset.length > 0) {
      // Restore soft deleted record
      await pool.request().query(`UPDATE awt_franchisemaster SET deleted = 0 WHERE title = '${title}'`);
      return res.json({
        message: "Soft-deleted Franchise Master restored successfully!",
      });
    } else {
      // Insert new record
      await pool.request().query(`INSERT INTO awt_franchisemaster (title) VALUES ('${title}')`);
      return res.json({
        message: "Franchise Master added successfully!",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

app.put("/putfranchisedata", async (req, res) => {
  const { title, id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicate entries (excluding the current record)
    const checkDuplicateResult = await pool.request().query(`SELECT * FROM awt_franchisemaster WHERE title = '${title}' AND id != '${id}' AND deleted = 0`);
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, Franchise Master already exists!" });
    }

    // Update the record
    await pool.request().query(`UPDATE awt_franchisemaster SET title = '${title}' WHERE id = '${id}'`);
    
    return res.json({ message: "Franchise Master updated successfully!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating the Franchise Master' });
  }
});
app.post("/deletefranchisedata", async (req, res) => {
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
app.get("/getparentfranchise", async (req, res) => {
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
app.get("/getchildfranchise", async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject the query string without parameters
    const sql = `SELECT r.*, c.title as parentfranchise_title 
                 FROM awt_childfranchisemaster r 
                 INNER JOIN awt_franchisemaster c 
                 ON r.pfranchise_id = c.id 
                 WHERE r.deleted = 0`;

    // Execute the SQL query
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching child franchise data" });
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
app.post("/postchildfranchise", async (req, res) => {
  const { title, pfranchise_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the title already exists and is not deleted
    const checkDuplicateSql = `SELECT * FROM awt_childfranchisemaster WHERE title = '${title}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Child Franchise Master already exists!",
      });
    }

    // Check if the title exists and is soft-deleted
    const checkSoftDeletedSql = `SELECT * FROM awt_childfranchisemaster WHERE title = '${title}' AND deleted = 1`;
    const softDeletedResult = await pool.request().query(checkSoftDeletedSql);

    if (softDeletedResult.recordset.length > 0) {
      const restoreSoftDeletedSql = `UPDATE awt_childfranchisemaster SET deleted = 0 WHERE title = '${title}'`;
      await pool.request().query(restoreSoftDeletedSql);

      return res.json({
        message: "Soft-deleted Child Franchise Master restored successfully!",
      });
    }

    // Insert the new child franchise if no duplicates or soft-deleted records found
    const insertSql = `INSERT INTO awt_childfranchisemaster (title, pfranchise_id) VALUES ('${title}', '${pfranchise_id}')`;
    await pool.request().query(insertSql);

    return res.json({
      message: "Child Franchise Master added successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});
app.put("/putchildfranchise", (req, res) => {
  const { title, id, pfranchise_id } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_childfranchisemaster WHERE title = '${title}' AND id != '${id}' AND deleted = 0`;

  con.query(checkDuplicateSql, (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Child Franchise already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE awt_childfranchisemaster SET title = '${title}', pfranchise_id = '${pfranchise_id}' WHERE id = '${id}'`;

      con.query(updateSql, (err, data) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json({ message: "Child Franchise updated successfully!" });
      });
    }
  });
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
app.get("/getproducttype", async (req, res) => {
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
app.post("/postdataproducttype", async (req, res) => {
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
app.get("/requestdataproducttype/:id", async (req, res) => {
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
app.put("/putproducttypedata", async (req, res) => {
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
app.post("/deleteproducttypedata", async (req, res) => {
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
app.get("/getproductline", async (req, res) => {
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
app.post("/postdataproductline", async (req, res) => {
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
app.get("/requestdataproductline/:id", async (req, res) => {
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
app.put("/putproductlinedata", async (req, res) => {
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
app.post("/deleteproductlinedata", async (req, res) => {
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
app.get("/getmat", async (req, res) => {
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
app.post("/postdatamat", async (req, res) => {
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
app.get("/requestdatamat/:id", async (req, res) => {
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
app.put("/putmatdata", async (req, res) => {
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
app.post("/deletematdata", async (req, res) => {
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
app.get("/getmanufacturer", async (req, res) => {
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
app.post("/postmanufacturer", async (req, res) => {
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
app.get("/requestmanufacturer/:id", async (req, res) => {
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
app.put("/putmanufacturer", async (req, res) => {
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
app.post("/delmanufacturer", async (req, res) => {
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
app.get("/getratedata", async (req, res) => {
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
app.post("/postratedata", async (req, res) => {
  const { Ratecard } = req.body;

  try {
    const pool = await poolPromise;

    // Check if Ratecard already exists
    let sql = `SELECT * FROM rate_card WHERE Ratecard = '${Ratecard}' AND deleted = 0`;
    const result = await pool.request().query(sql);

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
app.get("/requestratedata/:id", async (req, res) => {
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
app.put("/putratedata", async (req, res) => {
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
app.post("/deleteratedata", async (req, res) => {
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
app.get("/getprodata", async (req, res) => {
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
app.post("/postprodata", async (req, res) => {
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
app.get("/requestprodata/:id", async (req, res) => {
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
app.put("/putprodata", async (req, res) => {
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
app.post("/deleteprodata", async (req, res) => {
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

// Lhi User code start
app.get("/getlhidata", async (req, res) => {
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
app.post("/postlhidata", async (req, res) => {
  const { Lhiuser } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists and is not soft-deleted
    let sql = `SELECT * FROM lhi_user WHERE Lhiuser = '${Lhiuser}' AND deleted = 0`;
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
        sql = `INSERT INTO lhi_user (Lhiuser) VALUES ('${Lhiuser}')`;
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
app.get("/requestlhidata/:id", async (req, res) => {
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
app.put("/putlhidata", async (req, res) => {
  const { Lhiuser, id, updated_by } = req.body;

  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `SELECT * FROM lhi_user WHERE Lhiuser = '${Lhiuser}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `UPDATE lhi_user SET Lhiuser = '${Lhiuser}', updated_by = '${updated_by}', updated_date = NOW() WHERE id = '${id}'`;
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
//lhi user code end

// call status code start
app.get("/getcalldata", async (req, res) => {
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
app.get("/requestcalldata/:id", async (req, res) => {
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
app.post("/deletecalldata", async (req, res) => {
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
app.get("/getsdata", async (req, res) => {
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
app.post("/postsdata", async (req, res) => {
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
app.get("/requestsdata/:id", async (req, res) => {
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
app.put("/putsdata", async (req, res) => {
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
app.post("/deletesdata", async (req, res) => {
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

//Start Complaint List
app.get("/getcomplainlist", async (req, res) => {
  try {
    const pool = await poolPromise;

    // SQL query to fetch complaint_ticket records that are not deleted and ordered by ticket_no
    const sql = "SELECT * FROM complaint_ticket WHERE deleted = 0 ORDER BY ticket_no ASC";
    const result = await pool.request().query(sql);

    return res.json(result.recordset); // Return the result from the query
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});
// end Complaint list
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

    console.log(ticket_no, "##");

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

app.get("/getComplaintDetails/:ticket_no", async (req, res) => {
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

app.get("/getComplaintDuplicate/:customer_mobile", async (req, res) => {
  const customer_mobile = req.params.customer_mobile;

  try {
    const pool = await poolPromise;

    // Query to fetch complaint tickets based on customer_mobile
    const sql = `SELECT * FROM complaint_ticket WHERE customer_mobile = '${customer_mobile}' AND deleted = 0 ORDER BY id DESC`;
    const result = await pool.request().query(sql);

    // Send the result back to the client
    res.json(result.recordset);

  } catch (err) {
    console.error("Error fetching complaint duplicate:", err);
    return res.status(500).json({ error: "Error fetching complaint duplicate", details: err.message });
  }
});
// End Complaint View