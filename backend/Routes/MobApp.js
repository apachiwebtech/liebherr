const express = require('express');
const app = express.Router();
const sql = require('mssql');
const poolPromise = require('../db');

const multer = require('multer');
// const path = require('path');
const upload = multer({ dest: 'uploads/' });


app.post('/login', async (req, res) => {
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
      .query(`SELECT t.* , c.alt_mobileno  FROM complaint_ticket as t left join awt_customer as c on t.customer_id = c.customer_id  CROSS APPLY STRING_SPLIT(t.engineer_id, ',') AS split_values WHERE split_values.value = '${en_id}' ORDER BY t.id ASC;
`);


    console.log(result, "ddDd")
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




app.get('/awt_subcat', async (req, res) => {
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


app.get('/getcomplaintdetails', async (req, res) => {
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



// app.post('/updatecomplaint', async (req, res) => {
//   const { actioncode, service_charges, call_remark, call_status, call_type, causecode, other_charge, symptomcode, com_id ,warranty_status} = req.body;

//   try {
//     const pool = await poolPromise;
//     const result = await pool.request()
//       .input('actioncode', sql.VarChar, actioncode)
//       .input('symptomcode', sql.VarChar, symptomcode)
//       .input('causecode', sql.VarChar, causecode)
//       .input('service_charges', sql.VarChar, service_charges)
//       .input('call_status', sql.VarChar, call_status)
//       .input('call_type', sql.VarChar, call_type)
//       .input('other_charge', sql.VarChar, other_charge)
//       .input('warranty_status', sql.VarChar, warranty_status)
//       .input('com_id', sql.VarChar, com_id)
//       .query('UPDATE complaint_ticket SET warranty_status = @warranty_status, symptom_code = @symptomcode, cause_code = @causecode, action_code = @actioncode, service_charges = @service_charges, call_status = @call_status, call_type = @call_type, other_charges = @other_charge WHERE id = @com_id');

//     // Check if any rows were updated
//     if (result.rowsAffected[0] > 0) {
//       res.status(200).json({ message: 'Update successful' });
//     } else {
//       res.status(400).json({ message: 'Failed to update: No rows affected' });
//     }
//   } catch (error) {
//     console.error('Database Query Error:', error);
//     res.status(500).json({ message: 'An error occurred during the update' });
//   }
// });

app.post('/updatecomplaint', upload.single('spare_doc'), async (req, res) => {
  const { actioncode, service_charges, call_remark, call_status, call_type, causecode, other_charge, symptomcode, com_id, warranty_status, spare_detail, ticket_no, user_id } = req.body;



  const finalremark = `Remark :${call_remark},Call Type:${call_type},Warranty Status :${warranty_status ? warranty_status : "NA"},Call Status: ${call_status} , Price : ${service_charges} and Other Charges ${other_charge}`;


  // If you want to get the file information
  const file = req.file;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('actioncode', sql.VarChar, actioncode != 'undefined' ? actioncode : null)
      .input('symptomcode', sql.VarChar, symptomcode != 'undefined' ? symptomcode : null)
      .input('causecode', sql.VarChar, causecode != 'undefined' ? causecode : null)
      .input('service_charges', sql.VarChar, service_charges != 'undefined' ? service_charges : null)
      .input('call_status', sql.VarChar, call_status != 'undefined' ? call_status : null)
      .input('call_type', sql.VarChar, call_type != 'undefined' ? call_type : null)
      .input('other_charge', sql.VarChar, other_charge != 'undefined' ? other_charge : null)
      .input('warranty_status', sql.VarChar, warranty_status != 'undefined' ? warranty_status : null)
      .input('com_id', sql.VarChar, com_id != 'undefined' ? com_id : null)
      .input('spare_doc_path', sql.VarChar, file ? file.path : null)
      .input('call_remark', sql.VarChar, call_remark != 'undefined' ? call_remark : null) // Add call_remark
      .input('spare_detail', sql.VarChar, spare_detail != 'undefined' ? spare_detail : null)
      .query('UPDATE complaint_ticket SET warranty_status = @warranty_status, group_code = @symptomcode, defect_type = @causecode, site_defect = @actioncode, service_charges = @service_charges, call_status = @call_status, call_type = @call_type, other_charges = @other_charge, spare_doc_path = @spare_doc_path, call_remark = @call_remark, spare_detail = @spare_detail WHERE id = @com_id');

    // Check if any rows were updated
    if (result.rowsAffected[0] > 0) {


      const updateremarkQuery = `
        INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
          VALUES (@ticket_no, @remark, @created_by, GETDATE())
      `;

      await pool.request()
        .input('ticket_no', sql.VarChar, ticket_no)
        .input('remark', sql.VarChar, finalremark)
        .input('created_by', sql.VarChar, user_id)
        .query(updateremarkQuery);

      res.status(200).json({ message: 'Update successful' });


    } else {
      res.status(400).json({ message: 'Failed to update: No rows affected' });
    }
  } catch (error) {
    console.error('Database Query Error:', error.message, error.stack);
    res.status(500).json({ message: 'An error occurred during the update', error: error.message });
  }
});


app.post("/appgetDefectCodewisetype",
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


app.get("/getsitedefect", async (req, res) => {
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

app.get("/getcom_app", async (req, res) => {
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

app.post("/getDefectCodewisetype_app12", async (req, res) => {

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


app.post("/getDefectCodewisesite_app", async (req, res) => {

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


app.post("/getsparelistapp", async (req, res) => {
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


app.get("/getSpareParts_app/:model", async (req, res) => {
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


app.post("/addspareapp", async (req, res) => {
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

app.post("/getotpapp", async (req, res) => {
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

app.get("/getcomplaintlist/:customer_id", async (req, res) => {
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



app.get("/checkstatus_app/:e_id", async (req, res) => {
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



app.get("/getcompdata/:ticket_no", async (req, res) => {
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



module.exports = app;
