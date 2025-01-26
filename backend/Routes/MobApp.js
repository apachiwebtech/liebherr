const express = require('express');
const app = express.Router();
const sql = require('mssql');
const poolPromise = require('../db');
const jwt = require("jsonwebtoken");
const multer = require('multer');
// const path = require('path');
const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = "Lh!_Login_123";


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


app.post('/applogin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password) // Ensure the password is securely handled
      .query('SELECT * FROM awt_engineermaster WHERE engineer_id = @username AND password = @password');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Create JWT payload
      const payload = {
        engineer_id: user.engineer_id, // Example: use a unique identifier
        title: user.title, // Include other necessary user info
        employee_code: user.employee_code, // Example: Add a role if available
      };

      // Generate JWT token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

      // Respond with user info and token
      res.status(200).json({
        message: 'Login successful',
        user: {
          engineer_id: user.engineer_id, // Example: use a unique identifier
          title: user.title, // Include other necessary user info
          employee_code: user.employee_code, // Example: Add a role if available
        },
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Database Query Error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

app.get('/getheaddata', authenticateToken, async (req, res) => {
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

app.get('/getcomplaint/:en_id/:page/:limit', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    console.log(
      req.params.en_id,
      req.params.page,
      req.params.limit

    );


    const en_id = req.params.en_id;
    const page = parseInt(req.params.page) || 1; // Default to page 1
    const limit = parseInt(req.params.limit) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;


    console.log(`SELECT t.*, c.alt_mobileno FROM ( SELECT * FROM complaint_ticket WHERE engineer_id LIKE '${en_id}' ) AS t LEFT JOIN awt_customer AS c ON t.customer_id = c.customer_id CROSS APPLY STRING_SPLIT(t.engineer_id, ',') AS split_values WHERE split_values.value = '${en_id}' ORDER BY t.id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;`);


    const result = await pool.request()
      .query(`SELECT t.*, c.alt_mobileno FROM ( SELECT * FROM complaint_ticket WHERE engineer_id LIKE '${en_id}' ) AS t LEFT JOIN awt_customer AS c ON t.customer_id = c.customer_id CROSS APPLY STRING_SPLIT(t.engineer_id, ',') AS split_values WHERE split_values.value = '${en_id}' ORDER BY t.id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;`);




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




app.get('/awt_subcat', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query(`select * from awt_subcat where deleted = 0`);

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




app.get('/CallType', authenticateToken, async (req, res) => {
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
app.get('/CallStatus', authenticateToken, async (req, res) => {
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


app.get('/getcomplaintdetails', authenticateToken, async (req, res) => {
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


app.get('/getremark', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const id = req.query.cid;

    const result = await pool.request()
      .query(`select TOP 1 * from awt_complaintremark where ticket_no ='${id}' order by id desc; `);

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




app.post('/updatecomplaint', authenticateToken, upload.fields([
  { name: 'spare_doc', maxCount: 1 },
  { name: 'spare_doc_two', maxCount: 1 },
  { name: 'spare_doc_three', maxCount: 1 },
]), async (req, res) => {
  const { actioncode, service_charges, call_remark, call_status, call_type, causecode, other_charge, symptomcode, activitycode, com_id, warranty_status, spare_detail, ticket_no, user_id , serial_no,ModelNumber } = req.body;


  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  const finalremark = [
    call_remark && call_remark !== 'undefined' ? `Remark: ${call_remark}` : '',
    call_type && call_type !== 'undefined' ? `Call Type: ${call_type}` : '',
    `Warranty Status: ${warranty_status ? warranty_status : "NA"}`,
    call_status && call_status !== 'undefined' ? `Call Status: ${call_status}` : '',
    service_charges && service_charges !== 'undefined' ? `Price: ${service_charges}` : '',
    other_charge && other_charge !== 'undefined' ? `Other Charges: ${other_charge}` : '',
    serial_no && serial_no !== 'undefined'? `Serial No: ${serial_no}` : '',
    ModelNumber && ModelNumber !== 'undefined' ? `Model Number: ${ModelNumber}` : ''
  ].filter(Boolean).join(', ');




  const spareDoc = req.files['spare_doc'] ? req.files['spare_doc'][0].filename : null;
  const spareDocTwo = req.files['spare_doc_two'] ? req.files['spare_doc_two'][0].filename : null;
  const spareDocThree = req.files['spare_doc_three'] ? req.files['spare_doc_three'][0].filename : null;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('actioncode', sql.VarChar, actioncode != 'undefined' ? actioncode : null)
      .input('symptomcode', sql.VarChar, symptomcode != 'undefined' ? symptomcode : null)
      .input('causecode', sql.VarChar, causecode != 'undefined' ? causecode : null)
      .input('activitycode', sql.VarChar, activitycode != 'undefined' ? activitycode : null)
      .input('service_charges', sql.VarChar, service_charges != 'undefined' ? service_charges : null)
      .input('call_status', sql.VarChar, call_status != 'undefined' ? call_status : null)
      .input('call_type', sql.VarChar, call_type != 'undefined' ? call_type : null)
      .input('other_charge', sql.VarChar, other_charge != 'undefined' ? other_charge : null)
      .input('warranty_status', sql.VarChar, warranty_status != 'undefined' ? warranty_status : null)
      .input('com_id', sql.VarChar, com_id != 'undefined' ? com_id : null)
      .input('spare_doc_path', sql.VarChar, spareDoc)
      .input('call_remark', sql.VarChar, call_remark != 'undefined' ? call_remark : null) // Add call_remark
      .input('spare_detail', sql.VarChar, spare_detail != 'undefined' ? spare_detail : null)
      .input('serial_no', sql.VarChar, serial_no != 'undefined' ? serial_no : null)
      .input('ModelNumber', sql.VarChar, ModelNumber != 'undefined' ? ModelNumber : null)
      .query('UPDATE complaint_ticket SET warranty_status = @warranty_status, group_code = @symptomcode, defect_type = @causecode, site_defect = @actioncode,activity_code = @activitycode,service_charges = @service_charges, call_status = @call_status, call_type = @call_type, other_charges = @other_charge, spare_doc_path = @spare_doc_path, call_remark = @call_remark, spare_detail = @spare_detail , ModelNumber = @ModelNumber , serial_no = @serial_no WHERE id = @com_id');

    // Check if any rows were updated
    if (result.rowsAffected[0] > 0) {




      const updateremarkQuery = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
      VALUES (@ticket_no, @remark, @created_by, GETDATE());
      SELECT SCOPE_IDENTITY() AS remark_id;
  `;

      const result = await pool.request()
        .input('ticket_no', sql.VarChar, ticket_no)
        .input('remark', sql.VarChar, finalremark)
        .input('created_by', sql.VarChar, user_id)
        .query(updateremarkQuery);

      const remark_id = result.recordset[0].remark_id;

      // Array of documents
      const spareDocs = [spareDoc, spareDocTwo, spareDocThree];

      for (const doc of spareDocs) {
        if (doc) {
          const updateAttachQuery = `
          INSERT INTO awt_complaintattachment (remark_id, ticket_no, attachment, created_by, created_date)
          VALUES (@remark_id, @ticket_no, @attachment, @created_by, @created_date);
        `;

          await pool.request()
            .input('remark_id', sql.Int, remark_id)
            .input('ticket_no', sql.VarChar, ticket_no)
            .input('attachment', sql.VarChar, doc)
            .input('created_by', sql.VarChar, user_id)
            .input('created_date', sql.DateTime, formattedDate)
            .query(updateAttachQuery);
        }
      }


      res.status(200).json({ message: 'Update successful' });


    } else {
      res.status(400).json({ message: 'Failed to update: No rows affected' });
    }
  } catch (error) {
    console.error('Database Query Error:', error.message, error.stack);
    res.status(500).json({ message: 'An error occurred during the update', error: error.message });
  }
});


app.post("/appgetDefectCodewisetype", authenticateToken,
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



// Defect Group Code start

app.get("/getcom_app", authenticateToken, async (req, res) => {
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

app.post("/getDefectCodewisetype_app12", authenticateToken, async (req, res) => {

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


app.post("/getDefectCodewisesite_app", authenticateToken, async (req, res) => {

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


app.post("/getsparelistapp", authenticateToken, async (req, res) => {
  const { ticket } = req.body;
  try {
    const pool = await poolPromise;
    // Modified SQL query using parameterized query
    const sql = `select * from awt_uniquespare where ticketId ='${ticket}';`;

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});


app.get("/getSpareParts_app/:model", authenticateToken, async (req, res) => {
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


app.post("/addspareapp", authenticateToken, async (req, res) => {
  const { ItemDescription, title, product_code, ticket_no } = req.body;

  try {
    const pool = await poolPromise;
    // Modified SQL query using parameterized query

    const addspare = `insert into awt_uniquespare (ticketId , spareId , article_code ,article_description ) values('${ticket_no}','${product_code}' ,'${title}','${ItemDescription}'  )`;



    const result = await pool.request().query(addspare);

    return res.json({ message: 'done' });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});

app.post("/getotpapp", authenticateToken, async (req, res) => {
  const { otp, orderid } = req.body;

  try {
    const pool = await poolPromise;
    // Modified SQL query using parameterized query

    const addspare = `update complaint_ticket  set totp = ${otp} where id = ${orderid}`;


    const result = await pool.request().query(addspare);

    return res.json({ message: 'done' });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});

app.get("/getcomplaintlist/:customer_id", authenticateToken, async (req, res) => {
  const { customer_id } = req.params;

  try {
    const pool = await poolPromise;
    // Parameterized query
    const sql = `
          select * from complaint_ticket where customer_id= '${customer_id}'
        `;

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});



app.get("/checkstatus_app/:e_id", authenticateToken, async (req, res) => {
  const { e_id } = req.params;

  try {
    const pool = await poolPromise;
    // Parameterized query
    const sql = `select * from awt_engineermaster where engineer_id = '${e_id}'`;

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});



app.get("/getcompdata/:ticket_no", authenticateToken, async (req, res) => {
  const { ticket_no } = req.params;

  try {
    const pool = await poolPromise;
    // Parameterized query
    const sql = `
          select * from complaint_ticket where id = '${ticket_no}'
        `;

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});



app.get("/getactivity_app", authenticateToken, async (req, res) => {
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

app.post("/getuniquesparelist", authenticateToken, async (req, res) => {

  let { ticket_no } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `select * from awt_uniquespare WHERE deleted = 0 and ticketId = '${ticket_no}'`;

    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

app.post("/removeappsparepart", authenticateToken, async (req, res) => {

  let { spare_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `update awt_uniquespare set deleted = 1 where id = '${spare_id}'`;

    const result = await pool.request().query(sql);



    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

module.exports = app;
