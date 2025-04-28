require('dotenv').config();
const express = require('express');
const sql = require("mssql");
const app = express();
const PORT = process.env.PORT;
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');
const fs = require("fs");
const jwt = require("jsonwebtoken");
const MobApp = require("./Routes/MobApp");
const fetchdata = require('./fetchdata')
// const RateCardExcel = require('./Routes/Utils/RateCardExcel')
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const axios = require("axios");
const https = require('https');
const ExcelJS = require('exceljs');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;
const secretKey = process.env.SECRET_KEY

// Create HTTPS agent with self-signed certificate
const httpsAgent = new https.Agent({
  ca: fs.readFileSync(process.env.CERT_PATH), // Adjust path accordingly
  rejectUnauthorized: false // Set to true if you trust the cert (recommended for production)
});

//middleware
app.use(cors({ origin: process.env.ORIGIN }));
//app.use(cors({ origin: "*" }));

app.use(express.json({ limit: '500mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(fileUpload());

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

function decryptData(encryptedData, secretKey) {
  try {
    // Decrypt the data using AES and convert to UTF-8 string
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
      throw new Error("Decryption failed or invalid data");
    }

    return decryptedData; // Return decrypted string
  } catch (err) {
    throw new Error("Error decrypting data: " + err.message);
  }
}

app.use("/", MobApp);
app.use("/", fetchdata);
// app.use("/", RateCardExcel)

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
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig).connect()

  .then(pool => { console.log("Connected to MSSQL via connection pool"); return pool; })

  .catch(err => console.error("Database Connection Pool Error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//Country Master Start
//app.get("/", async (req, res) => {
//  try {
//     Use the poolPromise to get the connection pool
//    const pool = await poolPromise;
//   const result = await pool.request().query("SELECT * FROM awt_country WHERE deleted = 0");
//    return res.json(result.recordset);
//  } catch (err) {
//    console.error(err);
//    return res.status(500).json({ error: 'An error occurred while fetching data' });
//  }
//});

app.get("/", async (req, res) => {
  try {
    // Check if the database is connected
    await poolPromise; // This will throw an error if not connected
    return res.json({
      message: 'Welcome to our Liebherr API!',
      databaseStatus: 'Database is running'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'An error occurred',
      databaseStatus: 'Database connection error'
    });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zeliant997@gmail.com', // Replace with your email
    pass: 'zazb zhkl khsn jehv', // Replace with your email password or app password
  },
});

app.get('/send-otp', authenticateToken, async (req, res) => {
  // const { email, otp } = req.body;



  const mailOptions = {
    from: 'zeliant997@gmail.com',
    to: 'monikakharb90@gmail.com',
    subject: 'This is for open ticket',
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>Dear Customer,</p>

    <p style="margin-bottom: 0px;">Greetings from Liebherr!</p>
    <p style="margin: 0px;">Your Ticket Number is <b>VH0130-0002</b>. Please share OTP <b>123456</b> with the engineer once the ticket is resolved.</p>

    <p>For any query please contact  7038 100 400 or write us at customercare.lhi@liebherr.com for any support required.</p>
    <br/>
    <p style="margin: 0px;">Regards</p>
    <p style="margin: 0px;">Team – Customer Care</p>
    <p style="margin: 0px;">Liebherr Appliances India Pvt Ltd</p>
    <p style="margin: 0px;">Operation Timings: 8:30 AM to 5:30 PM (Business Days)</p>

</body>

</html>`,
  };

  try {
    // Verify the transporter connection
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'OTP sent successfully', info });


  } catch (error) {
    console.error('Error sending email:', error);

  }


});


app.get('/send-appointment', authenticateToken, async (req, res) => {
  // const { email, otp } = req.body;



  const mailOptions = {
    from: 'zeliant997@gmail.com',
    to: 'monikakharb90@gmail.com',
    subject: 'This is for appointment ticket',
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>Dear Customer,</p>

    <p style="margin-bottom: 0px;">Greetings from Liebherr!</p>
    <p style="margin: 0px;">Your Ticket Number <b>VH0130-0002</b> has been successfully scheduled. Our Service engineer will attend as per the appointment.</p>

    <p>For any query please contact  7038 100 400 or write us at customercare.lhi@liebherr.com for any support required.</p>
    <br />
    <p style="margin: 0px;">Regards</p>
    <p style="margin: 0px;">Team – Customer Care</p>
    <p style="margin: 0px;">Liebherr Appliances India Pvt Ltd</p>
    <p style="margin: 0px;">Operation Timings: 8:30 AM to 5:30 PM (Business Days)</p>

</body>

</html>`,
  };

  try {
    // Verify the transporter connection
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'OTP sent successfully', info });


  } catch (error) {
    console.error('Error sending email:', error);

  }


});
app.get('/send-cancelled', authenticateToken, async (req, res) => {
  // const { email, otp } = req.body;



  const mailOptions = {
    from: 'zeliant997@gmail.com',
    to: 'monikakharb90@gmail.com',
    subject: 'This is for cancelled ticket',
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>Dear Customer,</p>

    <p style="margin-bottom: 0px;">Greetings from Liebherr!</p>
    <p style="margin: 0px;">We regret to inform that the ticket registered with Liebherr is cancelled <b>VH0130-0002</b>. To reschedule, please contact 7038100400 or write us at customercare.lhi@liebherr.com for any support required.</p>

    <br />
    <p style="margin: 0px;">Regards</p>
    <p style="margin: 0px;">Team – Customer Care</p>
    <p style="margin: 0px;">Liebherr Appliances India Pvt Ltd</p>
    <p style="margin: 0px;">Operation Timings: 8:30 AM to 5:30 PM (Business Days)</p>

</body>

</html>`,
  };

  try {
    // Verify the transporter connection
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'OTP sent successfully', info });


  } catch (error) {
    console.error('Error sending email:', error);

  }


});

app.get('/send-closed', authenticateToken, async (req, res) => {
  // const { email, otp } = req.body;



  const mailOptions = {
    from: 'zeliant997@gmail.com',
    to: 'monikakharb90@gmail.com',
    subject: 'This is for closed ticket',
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>Dear Customer,</p>

    <p style="margin-bottom: 0px;">Greetings from Liebherr!</p>
    <p style="margin: 0px;">Your Ticket Number <b>VH0130-0002</b> has been successfully closed. </p>
    <p style="margin: 0px;">Please contact 7038100400 for future assistance. Thank you for choosing Liebherr.</p>
    <br />
    <p style="margin: 0px;">Regards</p>
    <p style="margin: 0px;">Team – Customer Care</p>
    <p style="margin: 0px;">Liebherr Appliances India Pvt Ltd</p>
    <p style="margin: 0px;">Operation Timings: 8:30 AM to 5:30 PM (Business Days)</p>

</body>

</html>`,
  };

  try {
    // Verify the transporter connection
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'OTP sent successfully', info });


  } catch (error) {
    console.error('Error sending email:', error);

  }


});
app.get('/send-spare', authenticateToken, async (req, res) => {
  // const { email, otp } = req.body;



  const mailOptions = {
    from: 'zeliant997@gmail.com',
    to: 'monikakharb90@gmail.com',
    subject: 'This is for spares ticket',
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <p>Dear Customer,</p>

    <p style="margin-bottom: 0px;">Greetings from Liebherr!</p>
    <p style="margin: 0px;">Ticket Number <b>VH0130-0002</b> has been raised for a spare request and will be processed shortly. </p>
    <p>For any query, please contact 7038100400 or write us at customercare.lhi@liebherr.com for any support required.</p>
    <br />
    <p style="margin: 0px;">Regards</p>
    <p style="margin: 0px;">Team – Customer Care</p>
    <p style="margin: 0px;">Liebherr Appliances India Pvt Ltd</p>
    <p style="margin: 0px;">Operation Timings: 8:30 AM to 5:30 PM (Business Days)</p>

</body>

</html>`,
  };

  try {
    // Verify the transporter connection
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'OTP sent successfully', info });


  } catch (error) {
    console.error('Error sending email:', error);

  }


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
    const sql = `SELECT top 1  id, Lhiuser, email FROM lhilogin WHERE email = '${lhiemail}' `;

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



app.get("/getdata", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM awt_country WHERE deleted = 0 ORDER BY id DESC");

    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData }); // Send the encrypted data
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching data" });
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)



  const { title, id } = JSON.parse(decryptedData);

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

    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData }); // Use `recordset` for MSSQL result
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, country_id } = JSON.parse(decryptedData);


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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id, country_id } = JSON.parse(decryptedData);

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

      // Convert data to JSON string and encrypt it
      const jsonData = JSON.stringify(result.recordset);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


      if (result.recordset.length > 0) {
        // Return the fetched geostates
        res.json({ encryptedData });
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, country_id, region_id } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id, country_id, region_id } = JSON.parse(decryptedData);

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
      // Convert data to JSON string and encrypt it
      const jsonData = JSON.stringify(result.recordset);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

      // Return the fetched geocities
      return res.json({ encryptedData });

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, country_id, region_id, geostate_id, district } = JSON.parse(decryptedData);

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
    const { encryptedData } = req.body;
    const decryptedData = decryptData(encryptedData, secretKey)
    const { title, id, country_id, region_id, geostate_id, district } = JSON.parse(decryptedData);

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
      // Convert data to JSON string and encrypt it
      const jsonData = JSON.stringify(result.recordset);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


      return res.json({ encryptedData });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, country_id, region_id, geostate_id } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id, country_id, region_id, geostate_id } = JSON.parse(decryptedData);

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return only the recordset from the result
    return res.json({ encryptedData });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
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

app.get("/getproductexcel", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;

    // Directly use the query (no parameter binding)
    let sql = `SELECT m.* FROM product_master as m WHERE 1= 1 `;


    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY m.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM product_master where 1=1 `;


    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the customer list" });
  }
});

app.get("/downloadcustomerexcel", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Fetch all customers who are not deleted
    const result = await pool.request().query(`SELECT * FROM awt_customer WHERE deleted = 0`);
    const customers = result.recordset;

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer');

    // Define columns
    worksheet.columns = [
      { header: 'Salutation', key: 'salutation' },
      { header: 'CustomerName', key: 'customer_fname' },
      { header: 'customerID', key: 'customer_id' },
      { header: 'CustomerType', key: 'customer_type' },
      { header: 'CustomerClassification', key: 'customer_classification' },
      { header: 'MobileNumber', key: 'mobileno' },
      { header: 'Email', key: 'email' },
      { header: 'Mwhatsapp', key: 'mwhatsapp' },
      { header: 'Alternate Mobileno', key: 'alt_mobileno' },
      { header: 'Alternate whatsapp', key: 'a_whatsapp' },
      { header: 'Date of Birth', key: 'dateofbirth' },
      { header: 'Anniversary Date', key: 'anniversary_date' },

    ];

    // Add all customer data as rows
    worksheet.addRows(customers);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Customer.xlsx');

    // Write and download
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error generating Customer Excel file');
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return only the recordset from the result
    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



// Insert for category
app.post("/postdatacat", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id } = JSON.parse(decryptedData);

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return only the recordset from the result
    return res.json({ encryptedData });
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, category_id } = JSON.parse(decryptedData);
  try {


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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id, category_id } = JSON.parse(decryptedData);
  try {


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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching Defect Group Code:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Defect Group Codes" });
  }
});

// Insert for Defect Group Code
app.post("/postdatacom", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, defectgroupcode, defectgrouptitle, description, created_by } = JSON.parse(decryptedData);
  try {

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)

  const { id, defectgroupcode, defectgrouptitle, description, updated_by } = JSON.parse(decryptedData);
  try {

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching Type of Defects:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Type of Defects" });
  }
});

// Insert  Type Of Defect Code
app.post("/postdatatypeofdefect", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { defect_code, groupdefect_code, defect_title, description, created_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, defect_code, groupdefect_code, defect_title, description, updated_by } = JSON.parse(decryptedData);
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





// app.get("/getsitedefect", authenticateToken, async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const sql = `
//     SELECT
//     td.*, dg.defectgrouptitle as grouptitle
//   FROM awt_site_defect td
//   LEFT JOIN awt_defectgroup dg ON td.defectgroupcode = dg.defectgroupcode
//   WHERE td.deleted = 0 order by td.id DESC
//     `;
//     const result = await pool.request().query(sql);
//     return res.json(result.recordset);
//   } catch (err) {
//     console.error("Error fetching Type of Defects:", err); // Log error for debugging
//     return res.status(500).json({ message: "Error fetching Site Defects" });
//   }
// });

app.get("/getsite", authenticateToken, async (req, res) => {
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching Type of Defects:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching Site Defects" });
  }
});

// Insert  Type Of Defect Code
app.post("/postactivity", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { dsite_code, groupdefectcode, dsite_title, description, created_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { dsite_code, groupdefectcode, dsite_title, description, created_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, dsite_code, groupdefectcode, dsite_title, description, updated_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, dsite_code, groupdefectcode, dsite_title, description, updated_by } = JSON.parse(decryptedData);

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
  const { ticket_no, note, created_by, call_status, call_status_id, sub_call_status, group_code, site_defect, defect_type, activity_code, serial_no, ModelNumber, purchase_date, warrenty_status, engineerdata, engineername, ticket_type, call_city, ticket_start_date, mandaysprice, gas_chargs, gas_transportation, transportation_charge, visit_count, customer_mobile, totp, complete_date, allocation, dealercustid, item_code, nps_link, customer_email, customer_id } = req.body;

  const username = process.env.TATA_USER;
  const password = process.env.PASSWORD;



  let temp_id;
  let temp_msg;

  if (call_status == 'Open') {
    temp_id = '1207173530305447084';
    temp_msg = `Dear Customer, Greetings from Liebherr! Your Ticket Number is ${ticket_no}. Please share OTP ${totp} with the engineer once the ticket is resolved.`
  }
  else if (call_status == 'In Process') {
    temp_id = '1207173530751596304';
    temp_msg = `Dear Liebherr Customer, Your Ticket Number ${ticket_no} has been assigned to ${engineername} and will be contact shortly for appointment.`
  }
  else if (call_status == 'Appointment') {
    temp_id = '1207173530643890095';
    temp_msg = `Dear Liebherr Customer, Your Ticket Number ${ticket_no} has been successfully scheduled. Our Service engineer will attend as per the appointment.`
  }
  else if (call_status == 'Cancelled') {
    temp_id = '1207173530833742041';
    temp_msg = `Dear Customer, We regret to inform that the ticket registered with Liebherr is cancelled ${ticket_no}). To reschedule, please contact 7038100400`
  }
  else if (call_status == 'Closed') {
    temp_id = '1207173530271700565';
    temp_msg = `Dear Customer, Your Ticket Number ${ticket_no} has been successfully closed. Please contact 7038100400 for future assistance. Thank you for choosing Liebherr.`
  }
  else if (call_status == 'Approval') {
    temp_id = '1207173530799359858';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for quotation and will be processed once approved. For any query, please contact 7038100400`
  }
  else if (call_status == 'Spares' && sub_call_status == 'Spare Ordered') {
    temp_id = '1207173530641222930';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for a spare request and will be processed shortly. For any query, please contact 7038100400`
  }
  else if (call_status == 'Spares' && sub_call_status == 'Spare Required') {
    temp_id = '1207173530641222930';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for a spare request and will be processed shortly. For any query, please contact 7038100400`
  }
  else if (call_status == 'Spares' && sub_call_status == 'Spare in-transit') {
    temp_id = '1207173530201018241';
    temp_msg = `Dear Liebherr Customer, for your Ticket Number ${ticket_no}, spare parts are in-transit. For any query, please contact 7038100400`
  }

  else if (call_status == 'Spares' && sub_call_status == 'Spare Delivery Delayed') {
    temp_id = '1207173530566445149';
    temp_msg = `Dear Liebherr Customer, We apologize for the delay in Ticket Number${ticket_no} due to unforeseen challenges in part transit. We are on it right away.
`
  }
  else if (call_status == 'Completed') {
    temp_id = '1207173530028299875';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been successfully completed. For future assistance, please contact 7038100400`
  }



  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let engineer_id;

  engineer_id = engineerdata.join(','); // Join the engineer IDs into a comma-separated string

  let engineer_name;

  engineer_name = engineername.join(',');

  const concatremark = [
    call_status ? `Call Status: ${call_status}` : '',
    sub_call_status ? `Sub Call Status: ${sub_call_status}` : '',
    group_code ? `Group Code: ${group_code}` : '',
    site_defect ? `Site Defect: ${site_defect}` : '',
    defect_type ? `Defect Type: ${defect_type}` : '',
    activity_code ? `Activity Code : ${activity_code}` : '',
    engineer_name ? `Engineer Name: ${engineer_name}` : '',
    serial_no ? `Serial No: ${serial_no}` : '',
    visit_count ? `Visit Count: ${visit_count}` : '',
    ModelNumber ? `Model Number: ${ModelNumber}` : '',
    note ? `<b>Remark:</b> ${note}` : '',
    complete_date ? `<b>Field Complete Date:</b> ${complete_date}` : ''

  ].filter(Boolean).join(' , ');





  try {
    const pool = await poolPromise;

    const updateSql = `
    UPDATE complaint_ticket
    SET call_status = '${call_status}' , updated_by = '${created_by}', updated_date = '${formattedDate}' , sub_call_status  = '${sub_call_status}' ,group_code = '${group_code}' , defect_type = '${defect_type}' , ModelNumber = '${ModelNumber}',serial_no = '${serial_no}' , site_defect = '${site_defect}' ,activity_code = '${activity_code}' , purchase_date = '${purchase_date}' , warranty_status = '${warrenty_status}' ,engineer_id = '${engineer_id}' ,mandays_charges = '${mandaysprice}',transport_charge = '${transportation_charge}', assigned_to = '${engineer_name}' , call_status_id = '${call_status_id}' , visit_count = '${visit_count}' , item_code ='${item_code}'  WHERE ticket_no = '${ticket_no}' `;

    await pool.request().query(updateSql);

    // Use parameterized queries to prevent SQL injection
    const sql = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by, created_date)
      OUTPUT INSERTED.id AS remark_id
      VALUES (@ticket_no, @note, @created_by, @created_date)
    `;

    const result = await pool.request()
      .input("ticket_no", ticket_no)
      .input("note", concatremark)
      .input("created_by", created_by)
      .input("created_date", formattedDate)
      .query(sql);

    const remark_id = result.recordset[0]?.remark_id;



    if (allocation == 'Available') {

      if (dealercustid) {


        const updatestatus = `update awt_uniqueproductmaster set SerialStatus = 'Inactive' where CustomerID = '${dealercustid}'`;

        await pool.request().query(updatestatus)



      }

      const {
        customer_id,
        customer_name,
        ModelNumber,
        address,
        region,
        state,
        city,
        area,
        pincode,
        customer_class,
        purchase_date,
        item_code
      } = req.body;




      const insertQuery = `INSERT INTO awt_uniqueproductmaster (CustomerID, CustomerName, ModelNumber, serial_no, address, region, state, district, city, pincode, created_by, created_date, customer_classification,SerialStatus,purchase_date,ModelName) VALUES (@CustomerID, @CustomerName, @ModelNumber, @SerialNo, @Address, @Region, @State, @District, @City, @Pincode, @CreatedBy, GETDATE(), @CustomerClassification , 'Active' , @PurchaseDate ,@item_code);`;

      await pool.request()
        .input('CustomerID', customer_id)
        .input('CustomerName', customer_name)
        .input('ModelNumber', ModelNumber)
        .input('SerialNo', serial_no)
        .input('Address', address)
        .input('Region', region)
        .input('State', state)
        .input('District', area) // Assuming area is district
        .input('City', city)
        .input('Pincode', pincode)
        .input('CreatedBy', created_by) // Example for created_by
        .input('CustomerClassification', customer_class)
        .input('PurchaseDate', purchase_date)
        .input('item_code', item_code)
        .query(insertQuery)


    }


    if (call_status == 'Closed' && sub_call_status == 'Fully') {


      const updateSql = `
      UPDATE complaint_ticket
      SET closed_date = '${complete_date}' WHERE ticket_no = '${ticket_no}'`;

      await pool.request().query(updateSql);

      const startdate = new Date(ticket_start_date); // Ensure this is a Date object
      const ticketenddate = new Date(); // Current date and time

      // Calculate the difference in hours
      const diffInMilliseconds = ticketenddate - startdate;
      const hoursDifference = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Convert to hours



      //rate card logic

      const getproductinfo = `select top 1 id, productType ,  productLine , productClass from product_master where item_description = '${ModelNumber}'`;

      const productresult = await pool.request().query(getproductinfo)



      //Nps Msg

      // const encrypt = (data) => {
      //   return CryptoJS.AES.encrypt(data, secretKey).toString();
      // };

      // // Encrypt each part
      // const encryptedEmail = encrypt(customer_email);
      // const encryptedTicket = encrypt(ticket_no);
      // const encryptedCustomerId = encrypt(customer_id);


      // // Build the URL-safe message
      // const encryptedPath = `${encodeURIComponent(encryptedEmail)}/${encodeURIComponent(encryptedTicket)}/${encodeURIComponent(encryptedCustomerId)}`;

      // const npsmsg = `Dear Customer, Your feedback helps us grow. Please rate us in survey: ${nps_link} ${'hgjhghj'} . Thanks for choosing Liebherr.`;

      // const nps_msg = encodeURIComponent(npsmsg);


      // const npsapiUrl = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${customer_mobile}&dr=false&msg=${nps_msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=1207173855461934489`;

      // console.log(npsapiUrl)
      // await axios.get(npsapiUrl, { httpsAgent });




      // const msg = encodeURIComponent(temp_msg);

      // const apiUrl = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${customer_mobile}&dr=false&msg=${msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=${temp_id}`;

      // const response = await axios.get(apiUrl, { httpsAgent }); 



      // const mailOptions = {
      //   from: 'zeliant997@gmail.com',
      //   to: 'monikakharb90@gmail.com',
      //   subject: 'Feedback form',
      //   html: `<div>This is nps form link  ${/nps/:email/:ticketNo/:customerId}</div>`,
      // };

      // try {
      //   // Verify the transporter connection
      //   await transporter.verify();
      //   const info = await transporter.sendMail(mailOptions);


      //   res.status(200).json({ message: 'OTP sent successfully', info });


      // } catch (error) {
      //   console.error('Error sending email:', error);

      // }






      if (productresult.recordset.length > 0) {

        const { productType, productLine, productClass } = productresult.recordset[0];

        const getrate = `select * from rate_card where ProductType ='${productType}' AND ProductLine = '${productLine}' AND ProductClass = '${productClass}' AND call_type = '${ticket_type}' AND class_city = '${call_city}' `



        const getresult = await pool.request().query(getrate);







        if (getresult.recordset && getresult.recordset[0]) {

          if (gas_chargs == 'on') {



            const gascharges = getresult.recordset[0].gas_charging;



            const updategascharges = `update complaint_ticket  set gas_charges = '${gascharges}' where ticket_no = '${ticket_no}'`;




            await pool.request().query(updategascharges);


          }

          if (gas_transportation == 'on') {

            const gastransport = getresult.recordset[0].transportation;


            const updategastransportcharges = `update complaint_ticket  set gas_transoprt = '${gastransport}' where ticket_no = '${ticket_no}'`;

            console.log(updategastransportcharges)

            await pool.request().query(updategastransportcharges);

          }

          const within24 = getresult.recordset[0].Within_24_Hours;
          const within48 = getresult.recordset[0].Within_48_Hours;
          const within98 = getresult.recordset[0].Within_96_Hours;
          const Morethan98 = getresult.recordset[0].MoreThan96_Hours;

          let updatecomplaint;

          if (hoursDifference <= 24) {
            updatecomplaint = `update complaint_ticket  set service_charges = '${within24}' where ticket_no = '${ticket_no}'`
          } else if (hoursDifference <= 48) {
            updatecomplaint = `update complaint_ticket  set service_charges = '${within48}' where ticket_no = '${ticket_no}'`
          } else if (hoursDifference <= 98) {
            updatecomplaint = `update complaint_ticket  set service_charges = '${within98}' where ticket_no = '${ticket_no}'`
          } else if (hoursDifference >= 98) {
            updatecomplaint = `update complaint_ticket  set service_charges = '${Morethan98}' where ticket_no = '${ticket_no}'`
          }

          const finalresult = await pool.request().query(updatecomplaint);




          return res.json({
            hoursDifference, // Include the hours difference in the response
            rateCardData: finalresult.affectedRows,
          });

        }


      }





    } else {

      // const msg = encodeURIComponent(temp_msg);

      // const apiUrl = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${customer_mobile}&dr=false&msg=${msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=${temp_id}`;

      // const response = await axios.get(apiUrl, { httpsAgent }); 
    }





    //End


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
    const remarkQuery = `SELECT   ac.created_by , ac.id , ac.ticket_no , ac.remark  ,ac.created_date  , ud.title   FROM awt_complaintremark as ac LEFT JOIN userdetails as ud on ud.usercode = ac.created_by WHERE ac.ticket_no = ${"'" + ticket_no + "'"}  order by ac.id DESC`;



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

app.post("/uploadAttachment2", authenticateToken, upload.array("attachment2"), async (req, res) => {
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


      console.log(sql, "%%%")

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

  let { csp } = req.params;

  try {
    const pool = await poolPromise;




    const sql = `select * from awt_engineermaster where cfranchise_id = '${csp}' and deleted = 0 and status = 1 and employee_code = 'SRV'`
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



app.get("/gethelplhi", authenticateToken, async (req, res) => {

  try {
    const pool = await poolPromise;

    const sql = `select Lhiuser as title , Usercode as engineer_id from lhi_user where assigncsp like '%9999999%' and deleted = '0' and status = '1'`
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


app.get("/getlhiengineer", authenticateToken, async (req, res) => {



  try {
    const pool = await poolPromise;

    // const sql = `select * from awt_engineermaster where  deleted = 0 and status = 1 and employee_code = 'LHI'`

    const sql = `SELECT id, Lhiuser as title, Usercode as engineer_id , 'LHI' as employee_code FROM lhi_user
UNION
SELECT id, title, engineer_id , employee_code FROM awt_engineermaster WHERE deleted = 0 AND status = 1 AND employee_code = 'LHI'`
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
          AND (c.email LIKE @searchparam OR c.mobileno LIKE @searchparam OR c.customer_fname LIKE @searchparam OR c.customer_id LIKE @searchparam )
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
    , ticket_id, classification, priority, callType, requested_by, requested_email, requested_mobile, msp, csp, sales_partner, sales_partner2, salutation, mwhatsapp, awhatsapp, class_city, mother_branch, item_code
  } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);


  const pool = await poolPromise;


  // duplicate check

  const duplicatecheck = `select * from complaint_ticket where customer_mobile = '${mobile}' and call_status = 'Open' and salutation ! = 'Dl'`;


  const dupresult = await pool.request().query(duplicatecheck);


  // if (dupresult.recordset.length == 0) {

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


  //Dynamic sms 


  try {
    const pool = await poolPromise;


    // Split customer_name into customer_fname and customer_lname


    const [customer_fname, ...customer_lnameArr] = customer_name.split(' ');
    const customer_lname = customer_lnameArr.join(' ');


    const getcustcount = `select top 1 id from awt_customer where customer_id is not null order by id desc`

    const getcustresult = await pool.request().query(getcustcount)

    const custcount = getcustresult.recordset[0].id;

    const newcustid = 'B' + custcount.toString().padStart(7, "0")






    if (ticket_id == '' && (cust_id == '' || cust_id == 'undefined')) {

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




    }



    // Insert into awt_uniqueproductmaster using insertedCustomerId as customer_id



    if ((cust_id == '' || cust_id == 'undefined') && model != "") {



      const productSQL = `INSERT INTO awt_uniqueproductmaster (
        CustomerID, ModelNumber, serial_no,  pincode ,address,state,city,district ,purchase_date, created_date, created_by,customer_classification, ModelName
       )
       VALUES (
        @customer_id, @model, @serial,  @pincode,@address,@state,@city,@area,@purchase_date,@formattedDate, @created_by,@customer_classification , @itemCode
       )`;



      await pool.request()
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
        .input('itemCode', item_code)
        .query(productSQL);

    }

    if ((cust_id == '' || cust_id == 'undefined')) {
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














    // this is for generating ticket no
    // const checkResult = await pool.request()
    //   .input('ticketType', sql.NVarChar, t_type)  // Define the parameter
    //   .query(`
    //   SELECT Top 1 ticket_no
    //   FROM complaint_ticket
    //   WHERE ticket_no LIKE @ticketType + 'H' + '%'
    //     AND ticket_date >= CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0) AS DATE)
    //     AND ticket_date < CAST(DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()) + 1, 0) AS DATE)
    //   ORDER BY ticket_no Desc;
    // `);


    const current_date = new Date().toISOString().split('T')[0]; // Formats date to YYYY-MM-DD

    console.log(current_date)
    const checkResult = await pool.request()
      .input('complaint_date', sql.NVarChar, complaint_date)  // Pass formatted date
      .query(`SELECT TOP 1 ticket_no
                FROM complaint_ticket
                WHERE ticket_date = @complaint_date
                ORDER BY RIGHT(ticket_no, 4) Desc;`);




    const count = checkResult.recordset[0] ? checkResult.recordset[0].ticket_no : 'H0000';

    const lastFourDigits = count.slice(-4)

    const newcount = Number(lastFourDigits) + 1

    const tdate = new Date(complaint_date);

    const formatDate = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}${tdate.getDate().toString().padStart(2, '0')}`;


    const ticket_no = `${t_type}H${formatDate}-${newcount.toString().padStart(4, "0")}`;



    let complaintSQL

    if (!ticket_id) {
      complaintSQL = `
        INSERT INTO complaint_ticket (
          ticket_no, ticket_date, customer_name, customer_mobile, customer_email, address,
          state, city, area, pincode, customer_id, ModelNumber, ticket_type, call_type,
          call_status, warranty_status, invoice_date, call_charges, mode_of_contact,
          contact_person,  created_date, created_by,  purchase_date, serial_no, child_service_partner, sevice_partner, specification ,customer_class,call_priority,requested_mobile,requested_email,requested_by,msp,csp,sales_partner,sales_partner2,call_remark,salutation,alt_mobile,mwhatsapp,awhatsapp,class_city,mother_branch,call_status_id ,totp ,item_code
        )
        VALUES (
          @ticket_no, @complaint_date, @customer_name, @mobile, @email, @address,
          @state, @city, @area, @pincode, @customer_id, @model, @ticket_type, @cust_type,
          'Open', @warranty_status, @invoice_date, @call_charge, @mode_of_contact,
          @contact_person,  @formattedDate, @created_by,  @purchase_date, @serial, @child_service_partner, @master_service_partner, @specification ,@classification , @priority ,@requested_mobile,@requested_email,@requested_by,@msp,@csp,@sales_partner,@sales_partner2,@call_remark,@salutation,@alt_mobile,@mwhatsapp,@awhatsapp,@class_city,@mother_branch,'1',@totp ,@item_code
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
          call_status_id = '1',
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
          msp = @msp,
          csp =  @csp,
          sales_partner = @sales_partner,
          sales_partner2 = @sales_partner2,
          salutation = @salutation,
          alt_mobile = @alt_mobile,
          mwhatsapp = @mwhatsapp,
          awhatsapp = @awhatsapp,
          class_city = @class_city,
          mother_branch = @mother_branch,
          totp = @totp,
          item_code = @item_code
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
      .input('customer_id', cust_id == '' || cust_id == 'undefined' ? newcustid : cust_id)
      .input('model', model)
      .input('ticket_type', ticket_type)
      .input('cust_type', cust_type)
      .input('warranty_status', sql.NVarChar, warrenty_status)
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
      .input('class_city', class_city)
      .input('mother_branch', mother_branch)
      .input('totp', otp)
      .input('item_code', item_code)
      .query(complaintSQL);


    // if (1 === 1) {

    //   const username = process.env.TATA_USER;
    //   const password = process.env.PASSWORD;
    //   const temp_id = '1207173530305447084'

    //   try {

    //     const msg = encodeURIComponent(
    //       `Dear Customer, Greetings from Liebherr! Your Ticket Number is ${ticket_no}. Please share OTP ${otp} with the engineer once the ticket is resolved.`
    //     );

    //     const tokenResponse = await axios.get(
    //       `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${mobile}&dr=false&msg=${msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=${temp_id}`
    //     );


    //   } catch (error) {
    //     console.error('Error hitting SMS API (token):', error.response?.data || error.message);
    //   }
    // }








    if (additional_remarks || specification) {
      // Combine both remarks
      const combinedRemarks = `
            ${additional_remarks ? `Additional Remark: ${additional_remarks}` : ''} 
            ${specification ? `Fault Description: ${specification}` : ''}
          `.trim(); // Trim to avoid unnecessary whitespace if one is empty

      // Insert query for combined remarks
      const remarksQuery = `
            INSERT INTO awt_complaintremark (
                ticket_no, remark, created_date, created_by
            )
            VALUES (
                @ticket_no, @combinedRemarks, @formattedDate, @created_by
            )`;

      // Execute the query
      await pool.request()
        .input('ticket_no', ticket_no) // Use existing ticket_no from earlier query
        .input('formattedDate', formattedDate) // Use current timestamp
        .input('created_by', created_by) // Use current user ID
        .input('combinedRemarks', combinedRemarks) // Combined remarks
        .query(remarksQuery);
    }


    //Fault Description *************




    // const mailOptions = {
    //   from: 'zeliant997@gmail.com',
    //   to: email,
    //   subject: 'Welcome to Our Platform!',
    //   html: `<a href='http://localhost:3000/nps/${email}/${ticket_no}/${cust_id == '' ? newcustid : cust_id}'>Click here to give us feedback</a>`,
    // };



    // await transporter.verify();
    // const info = await transporter.sendMail(mailOptions);




    return res.json({ message: 'Complaint added successfully!', ticket_no, cust_id });
  } catch (err) {
    console.error("Error inserting complaint:", err.stack);
    return res.status(500).json({ error: 'An error occurred while adding the complaint', details: err.message });
  }

  // } else {
  //   return res.json({ message: "Ticket is already created", ticket_no: 'Ticket is already created', cust_id: 'NA' })
  // }










});


app.post("/u_complaint", authenticateToken, async (req, res) => {
  let {
    customer_name, contact_person, email, mobile, address,
    state, city, area, pincode, mode_of_contact, cust_type,
    warrenty_status, invoice_date, call_charge, cust_id, model, alt_mobile, serial, purchase_date, created_by, child_service_partner, master_service_partner, specification, additional_remarks, ticket_no, classification, priority, requested_by, requested_email, requested_mobile, sales_partner2, salutation, mwhatsapp, awhatsapp, class_city, mother_branch, csp, msp
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
  ModelNumber = @model,
  call_type = @cust_type,
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
  msp = @msp,
  csp = @csp,
  alt_mobile = @alt_mobile,
  mwhatsapp = @mwhatsapp,
  awhatsapp = @awhatsapp,
  class_city = @class_city,
  mother_branch = @mother_branch
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
      .input('model', model)
      .input('cust_type', cust_type)
      .input("warranty_status", sql.NVarChar, warrenty_status)
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
      .input('msp', msp)
      .input('csp', csp)
      .input('alt_mobile', alt_mobile)
      .input('mwhatsapp', mwhatsapp)
      .input('awhatsapp', awhatsapp)
      .input('class_city', class_city)
      .input('mother_branch', mother_branch)
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
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
  } = JSON.parse(decryptedData);

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
    return res.status(200).json({
      message: "Customer master added successfully",
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json(err);
  }
});



// customer put

app.post("/putcustomer", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)


  const { id, customer_fname, customer_type, customer_classification, mobileno, alt_mobileno, dateofbirth, anniversary_date, email, salutation, customer_id, created_by } = JSON.parse(decryptedData);

  console.log(JSON.parse(decryptedData))


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
  const { customer_id, country_name, region_name, geostate_name, geocity_name, area_name, pincode_id, address, ccperson, ccnumber, address_type } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const checkCustomerSql = `
    SELECT customer_id FROM awt_customer
    WHERE customer_id = '${customer_id}' AND deleted = 0
  `;
    console.log(area_name, 'ty')
    const customerResult = await pool.request().query(checkCustomerSql);


    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = '${ccnumber}' AND ccperson = '${ccperson}'  AND customer_id = '${customer_id}' and  deleted = 0`;

    console.log(checkDuplicateSql)
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_customerlocation (customer_id ,country_id, region_id, geostate_id, geocity_id, district_id, pincode_id, address, ccperson, ccnumber, address_type,deleted)
                         VALUES ('${customer_id}','${country_name}', '${region_name}', '${geostate_name}', '${geocity_name}', '${area_name}', '${pincode_id}', '${address}', '${ccperson}', '${ccnumber}', '${address_type}',0)`;

      await pool.request().query(insertSql);

      return res.json({ message: "Customer Location added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while adding the customer location' });
  }
});



app.post("/updatecustomerlocation", authenticateToken, async (req, res) => {
  const { geostate_name, geocity_name, area_name, pincode_id, address, ccperson, ccnumber, address_id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;


    const insertSql = `update awt_customerlocation set  pincode_id = '${pincode_id}' , address = '${address}' , ccperson = '${ccperson}' , ccnumber = '${ccnumber}' , geostate_id = '${geostate_name}' , geocity_id = '${geocity_name}' , district_id = '${area_name}' where id = ${address_id}`

    await pool.request().query(insertSql);

    return res.json({ message: "Customer Location added successfully!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while adding the customer location' });
  }
});

// Update existing Customer Location with duplicate check
app.post("/putcustomerlocation", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const {
    country_name, region_name, geostate_name, geocity_name, area_name, pincode_id, address, ccperson, ccnumber, address_type, id
  } = JSON.parse(decryptedData);

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check for duplicates
    const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccperson = '${ccperson}' AND ccnumber = '${ccnumber}' AND id != '${id}' AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists!",
      });
    } else {
      const updateSql = `UPDATE awt_customerlocation SET country_id = '${country_name}', region_id = '${region_name}', geostate_id = '${geostate_name}', geocity_id = '${geocity_name}', district_id = '${area_name}', pincode_id = '${pincode_id}', address = '${address}', ccperson = '${ccperson}', ccnumber = '${ccnumber}', address_type = '${address_type}',deleted = 0 WHERE id = '${id}'`;

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { product, address, purchase_date, serial_no, CustomerID, CustomerName, SerialStatus, ItemNumber } = JSON.parse(decryptedData);


  console.log(ItemNumber, "ITEM")
  try {

    const pool = await poolPromise;
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster WHERE CustomerID = '${CustomerID}'AND address = '${address}'AND ModelNumber = '${product}'AND deleted = 0`;
    const duplicateResult = await pool.request().query(checkDuplicateSql);
    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with same customer Id and Location already exists!",
      });
    } else {
      const insertSql = `INSERT INTO awt_uniqueproductmaster (ModelNumber, address, purchase_date, serial_no,CustomerName,CustomerID,SerialStatus , ModelName)
                        VALUES ('${product}', '${address}', '${purchase_date}', '${serial_no}', '${CustomerName}', '${CustomerID}','${SerialStatus}' , '${ItemNumber}')`;
      await pool.request().query(insertSql);
      return res.json({ message: "Product added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

app.post("/putproductunique", authenticateToken, async (req, res) => {
  try {
    const { encryptedData } = req.body;
    const decryptedData = decryptData(encryptedData, secretKey);
    const { product, id, address, purchase_date, serial_no, CustomerID, SerialStatus } = JSON.parse(decryptedData);

    console.log("Received Data:", { product, id, address, purchase_date, serial_no, CustomerID, SerialStatus });

    // Validate ID
    const parsedId = Number(id);
    if (!parsedId || isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Get database connection
    const pool = await poolPromise;

    // 🔹 Check for Duplicates (Use Parameterized Query)
    const checkDuplicateSql = `SELECT * FROM awt_uniqueproductmaster 
                               WHERE serial_no = @serial_no 
                               AND id != @id 
                               AND deleted = 0 
                               AND CustomerID = @CustomerID`;  // Ensures duplicates only within the same customer
    const duplicateResult = await pool.request()
      .input('serial_no', sql.NVarChar, serial_no)
      .input('id', sql.Int, parsedId)
      .input('CustomerID', sql.NVarChar, CustomerID)
      .query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Product with the same Serial Number and Customer ID already exists!",
      });
    }

    // 🔹 Update the Product
    const updateSql = `UPDATE awt_uniqueproductmaster 
                       SET ModelNumber = @product, address = @address, 
                           purchase_date = @purchase_date, serial_no = @serial_no, 
                            CustomerID = @CustomerID,SerialStatus = @SerialStatus, deleted = 0  
                       WHERE id = @id`;

    await pool.request()
      .input('product', sql.NVarChar, product)
      .input('address', sql.NVarChar, address)
      .input('purchase_date', sql.NVarChar, purchase_date)
      .input('serial_no', sql.NVarChar, serial_no)
      .input('CustomerID', sql.NVarChar, CustomerID)
      .input('SerialStatus', sql.NVarChar, SerialStatus)
      .input('id', sql.Int, parsedId)
      .query(updateSql);

    return res.json({ message: "Product updated successfully!" });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "An error occurred while updating the product" });
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
      const sql = `SELECT * FROM awt_childfranchisemaster WHERE pfranchise_id = '${mfranchise_id}' AND deleted = 0`;

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
      engineer_id,
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
        ON r.cfranchise_id = c.licare_code
        WHERE r.deleted = 0 and employee_code is not null
      `;

    if (title) {
      sql += ` AND r.title LIKE '%${title}%'`;
    }
    if (engineer_id) {
      sql += ` AND r.engineer_id LIKE '%${engineer_id}%'`;
    }
    if (mobile_no) {
      sql += ` AND r.mobile_no LIKE '%${mobile_no}%'`;
    }
    if (email) {
      sql += ` AND r.email LIKE '%${email}%'`;
    }

    // Pagination logic
    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY r.id desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute the main SQL query
    const result = await pool.request().query(sql);

    // SQL query to get the total count
    let countSql = `
        SELECT COUNT(*) AS totalCount
        FROM awt_engineermaster r
        INNER JOIN awt_childfranchisemaster c 
        ON r.cfranchise_id = c.licare_code
        WHERE r.deleted = 0  and employee_code is not null
      `;
    if (title) {
      countSql += ` AND r.title LIKE '%${title}%'`;
    }
    if (engineer_id) {
      countSql += ` AND r.engineer_id LIKE '%${engineer_id}%'`;
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
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
    const { encryptedData } = req.body;
    const decryptedData = decryptData(encryptedData, secretKey)
    const { title, mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, employee_code, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address } = JSON.parse(decryptedData);

    try {
      // Use the poolPromise to get the connection pool
      const pool = await poolPromise;

      //this is for csp
      const getcount = `SELECT TOP 1 RIGHT(engineer_id, 4) AS last_four_digits FROM awt_engineermaster where employee_code = '${employee_code}'  ORDER BY RIGHT(engineer_id, 4) DESC`;

      const countResult = await pool.request().query(getcount);

      const latestQuotation = countResult.recordset[0]?.last_four_digits || 0;

      console.log(latestQuotation, "#$%")

      const newcount = Number(latestQuotation) + 1


      //this is for lhi
      const getlhicount = `SELECT TOP 1 RIGHT(engineer_id, 4) AS last_four_digits FROM awt_engineermaster where employee_code = '${employee_code}'  ORDER BY RIGHT(engineer_id, 4) DESC`;

      console.log(getlhicount)

      const countlhiResult = await pool.request().query(getlhicount);

      const latestlhiQuotation = countlhiResult.recordset[0]?.last_four_digits || 0;

      console.log(latestlhiQuotation, "#$%")

      const newlhicount = Number(latestlhiQuotation) + 1


      let engineercode;


      if (employee_code == 'LHI') {

        engineercode = 'LHI-TEC-' + newlhicount.toString().padStart(4, "0")


      } else {
        engineercode = 'SPT-TEC-' + newcount.toString().padStart(4, "0")

      }


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
          const insertSql = `INSERT INTO awt_engineermaster (title,mfranchise_id, cfranchise_id, mobile_no, email, password,engineer_id,personal_email,personal_mobile,dob,blood_group,academic_qualification,joining_date,passport_picture,resume,photo_proof,address_proof,permanent_address,current_address,employee_code)
                           VALUES ('${title}','${mfranchise_id}', '${cfranchise_id}', '${mobile_no}', '${email}', '${password}', '${engineercode}', '${personal_email}', '${personal_mobile}', '${dob}', '${blood_group}', '${academic_qualification}', '${joining_date}', '${passport_picture}', '${resume}', '${photo_proof}', '${address_proof}', '${permanent_address}', '${current_address}' , '${employee_code}')`;
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, mfranchise_id, cfranchise_id, password, email, mobile_no, personal_email, personal_mobile, dob, blood_group, academic_qualification, joining_date, passport_picture, resume, photo_proof, address_proof, permanent_address, current_address, id } = JSON.parse(decryptedData);

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
                         personal_email = '${personal_email}', personal_mobile = '${personal_mobile}', dob = '${dob ? dob : ''}',
                         blood_group = '${blood_group}', academic_qualification = '${academic_qualification}', joining_date = '${joining_date ? joining_date : ''}', passport_picture = '${passport_picture}',
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

app.post("/updateengineerstatus", authenticateToken, async (req, res) => {
  const { dataId, } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `SELECT * FROM awt_engineermaster WHERE id = @dataId`;

    // Execute the query to get the user
    const request = await pool.request()
      .input('dataId', dataId)
      .query(sql);

    // Check if records exist
    if (request.recordset.length > 0) {
      const status = request.recordset[0].status;
      console.log(request.recordset[0].status);
      let query;
      let seen;
      if (status == 1) {
        // If status is 1, deactivate and set activation date
        query = `UPDATE awt_engineermaster
                 SET status = 0
                 WHERE id = @dataId`;
        seen = 0;
      } else {
        // If status is not 1, deactivate and set deactivation date
        query = `UPDATE awt_engineermaster
                  SET status = 1
                  WHERE id = @dataId`;
        seen = 1;
      }

      // Execute the update query
      const update = await pool.request()
        .input('dataId', dataId)
        .query(query);

      // Send the response back with rows affected
      return res.json({ num_row_aff: update.rowsAffected[0], seen: seen });
    } else {
      // If no user found with the provided dataId
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: 'Error updating status' });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
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
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json(encryptedData);
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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
    sql += ` ORDER BY m.id desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;


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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
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
app.post("/deletechildfranchise", authenticateToken, async (req, res) => {
  const { id } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly inject `id` into the SQL query (no parameter binding)
    const sql = `UPDATE awt_childfranchisemaster SET deleted = 1 WHERE id = '${id}'`;

    // Execute the SQL query
    await pool.request().query(sql);

    return res.json({ message: "Child Franchise deleted successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating Child Franchise" });
  }
});
// app


app.post("/postchildfranchise", authenticateToken, async (req, res) => {
  const {
    address, area, bank_account_number, bank_address, bank_ifsc_code, bank_name,
    city, contact_person, contract_activation_date, contract_expiration_date,
    country_id, email, gst_number, last_working_date, licare_code, mobile_no,
    pan_number, partner_name, password, pfranchise_id, pincode_id, region_id,
    state, title, website, with_liebherr, created_by
  } = req.body;

  const pool = await poolPromise;

  try {

    // Use the poolPromise to get the connection pool

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
        .input('licare_code', sql.VarChar, licarecode)
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
        .input('with_liebherr', sql.DateTime, with_liebherr || null)
        .input('last_working_date', sql.DateTime, last_working_date || null)
        .input('contract_activation_date', sql.DateTime, contract_activation_date || null)
        .input('contract_expiration_date', sql.DateTime, contract_expiration_date || null)
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
             created_by = @created_by,
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


    const getfrinchisecount = `select Count(*) as count from awt_childfranchisemaster where pfranchise_id = '${pfranchise_id}'`

    const countResult = await pool.request().query(getfrinchisecount);

    const latestLicare = countResult.recordset[0].count || 0;

    const newcount = latestLicare + 1;

    const licarecode = `${pfranchise_id}-C${newcount.toString().padStart(4, "0")}`;


    console.log(licarecode, "$$$")



    // Insert the new child franchise if no duplicates or soft-deleted records found
    const insert = await pool.request()
      .input('title', sql.VarChar, title)
      .input('pfranchise_id', sql.Int, pfranchise_id)
      .input('licare_code', sql.VarChar, licarecode)
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
      .input('last_working_date', sql.DateTime, last_working_date || null)
      .input('contract_activation_date', sql.DateTime, contract_activation_date || null)
      .input('contract_expiration_date', sql.DateTime, contract_expiration_date || null)
      .input('with_liebherr', sql.DateTime, with_liebherr || null)
      .input('created_by', sql.VarChar, created_by)
      .query(`
        INSERT INTO awt_childfranchisemaster
        (title, pfranchise_id, licare_code, partner_name, contact_person, email, mobile_no, password, address,
         country_id, region_id, geostate_id, area_id, geocity_id, pincode_id, webste, gstno, panno, bankname,
         bankacc, bankifsc, bankaddress, withliebher, lastworkinddate, contractacti, contractexpir, created_by)
        VALUES
        (@title, @pfranchise_id, @licare_code, @partner_name, @contact_person, @email, @mobile_no, @password,
         @address, @country_id, @region_id, @state, @area, @city, @pincode_id, @website, @gst_number, @pan_number,
         @bank_name, @bank_account_number, @bank_ifsc_code, @bank_address,@with_liebherr , @last_working_date,
         @contract_activation_date, @contract_expiration_date, @created_by)
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
// End Child Franchise Master

// ProductType Start
// API to fetch all Product Types that are not soft-deleted
app.get("/getproducttype", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM product_type WHERE deleted = 0");
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching product types' });
  }
});
// Insert for Product Type
app.post("/postdataproducttype", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, product_type, created_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey);
  const { id, product_type, updated_by } = JSON.parse(decryptedData);

  try {
    const pool = await poolPromise;

    // Step 1: Check if a product type with the same name exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM product_type 
      WHERE product_type = @product_type AND deleted = 0 AND id != @id
    `;
    const checkDuplicateResult = await pool.request()
      .input("product_type", product_type)
      .input("id", id)
      .query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({ message: "Duplicate entry, ProductType already exists!" });
    }

    // Step 2: Check if a soft-deleted product type exists
    const checkSoftDeletedSql = `
      SELECT * FROM product_type 
      WHERE product_type = @product_type AND deleted = 1
    `;
    const checkSoftDeletedResult = await pool.request()
      .input("product_type", product_type)
      .query(checkSoftDeletedSql);

    if (checkSoftDeletedResult.recordset.length > 0) {
      // Restore the soft-deleted product type
      const restoreSoftDeletedSql = `
        UPDATE product_type 
        SET deleted = 0, updated_date = GETDATE(), updated_by = @updated_by 
        WHERE product_type = @product_type
      `;
      await pool.request()
        .input("product_type", product_type)
        .input("updated_by", updated_by)
        .query(restoreSoftDeletedSql);

      return res.json({ message: "Soft-deleted ProductType restored successfully!" });
    }

    // Step 3: Update the existing product type if no duplicate or soft-delete found
    const updateSql = `
      UPDATE product_type 
      SET product_type = @product_type, updated_by = @updated_by, updated_date = GETDATE() 
      WHERE id = @id
    `;
    await pool.request()
      .input("product_type", product_type)
      .input("updated_by", updated_by)
      .input("id", id)
      .query(updateSql);

    return res.json({ message: "ProductType updated successfully!" });

  } catch (err) {
    console.error("Error processing ProductType:", err);
    return res.status(500).json({ message: "Error processing ProductType" });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching product lines" });
  }
});
// Insert for product line
app.post("/postdataproductline", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, product_line, pline_code, created_by } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, product_line, pline_code, updated_by } = JSON.parse(decryptedData);

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching materials" });
  }
});
// Insert for material
app.post("/postdatamat", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, Material, created_by } = JSON.parse(decryptedData);
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, Material, updated_by } = JSON.parse(decryptedData);

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();


    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching manufacturer data" });
  }
});
// Insert for Mnufacturer
app.post("/postmanufacturer", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, Manufacturer, created_by } = JSON.parse(decryptedData);
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, Manufacturer, updated_by } = JSON.parse(decryptedData);

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
    const {
      call_type,
      class_city,
      ProductType,
      ProductLine,
      ProductClass,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    const pool = await poolPromise;

    // SQL query to fetch rate data where deleted is 0
    let sql = "SELECT r.* FROM rate_card as r WHERE deleted = 0";


    if (call_type) {
      sql += ` AND r.call_type LIKE '%${call_type}%'`;
    }

    if (class_city) {
      sql += ` AND r.class_city LIKE '%${class_city}%'`;
    }

    if (ProductType) {
      sql += ` AND r.ProductType LIKE '%${ProductType}%'`;
    }

    if (ProductLine) {
      sql += ` AND r.ProductLine LIKE '%${ProductLine}%'`;
    }
    if (ProductClass) {
      sql += ` AND r.ProductClass LIKE '%${ProductClass}%'`;
    }

    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY r.id desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    const result = await pool.request().query(sql);
    let countSql = `SELECT COUNT(*) as totalCount FROM rate_card where deleted = 0 `;
    if (call_type) countSql += ` AND call_type LIKE '%${call_type}%'`;
    if (class_city) countSql += ` AND class_city LIKE '%${class_city}%'`;
    if (ProductType) countSql += ` AND ProductType LIKE '%${ProductType}%'`;
    if (ProductLine) countSql += ` AND ProductLine LIKE '%${ProductLine}%'`;
    if (ProductClass) countSql += ` AND ProductClass LIKE '%${ProductClass}%'`;



    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
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
// service product code start
app.post("/getlhiassigncsp", authenticateToken, async (req, res) => {

  let { Usercode } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query to fetch service product data where deleted is 0
    const sql = `SELECT assigncsp FROM lhi_user WHERE Usercode = '${Usercode}'`;
    const result = await pool.request().query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching product data" });
  }
});

//update csp code

app.post("/updatecspcode", authenticateToken, async (req, res) => {
  let { licare_code, Usercode, checked } = req.body;

  try {
    const pool = await poolPromise;

    // Fetch existing assigncsp value
    const fetchSql = `SELECT assigncsp FROM lhi_user WHERE Usercode = '${Usercode}'`;
    const fetchResult = await pool.request().query(fetchSql);

    let existingCspCodes = fetchResult.recordset[0]?.assigncsp || ""; // Get existing data or empty string

    // Convert existing codes into an array
    let cspCodesArray = existingCspCodes ? existingCspCodes.split(",") : [];

    if (checked == 'true') {
      // Add new licare_code if not already present
      if (!cspCodesArray.includes(licare_code)) {
        cspCodesArray.push(licare_code);
      }
    } else {
      // Remove licare_code if exists
      cspCodesArray = cspCodesArray.filter(code => code !== licare_code);
    }

    // Convert array back to a comma-separated string
    const updatedCspCodes = cspCodesArray.join(",");

    // Update the database with the new value
    const updateSql = `UPDATE lhi_user SET assigncsp = '${updatedCspCodes}' WHERE Usercode = '${Usercode}'`;
    await pool.request().query(updateSql);

    return res.json({ message: "CSP code updated successfully", assigncsp: updatedCspCodes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while updating CSP codes" });
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
      // Convert data to JSON string and encrypt it
      const jsonData = JSON.stringify(result.recordset);
      const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

      return res.json({ encryptedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "An error occurred while fetching service_contract data" });
    }
  });

// Insert for Servicecontract
app.post("/postservicecontract", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { customerName, customerMobile, contractNumber, contractType, productName, serialNumber, startDate, endDate } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { id, customerName, customerMobile, contractNumber, contractType, productName, serialNumber, startDate, endDate, created_by } = JSON.parse(decryptedData);


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

app.post("/updateservicestatus", authenticateToken, async (req, res) => {
  const { dataId } = req.body;
  try {
    const pool = await poolPromise;
    const sql = `SELECT * FROM awt_servicecontract WHERE id = @dataId`;

    // Execute the query to get the user
    const request = await pool.request()
      .input('dataId', dataId)
      .query(sql);

    // Check if records exist
    if (request.recordset.length > 0) {
      const status = request.recordset[0].status;
      console.log(request.recordset[0].status);
      let query;
      let seen;
      if (status == 1) {
        // If status is 1, deactivate and set activation date
        query = `UPDATE awt_servicecontract
                 SET status = 0
                 WHERE id = @dataId`;
        seen = 0;
      } else {
        // If status is not 1, deactivate and set deactivation date
        query = `UPDATE awt_servicecontract
                  SET status = 1
                  WHERE id = @dataId`;
        seen = 1;
      }

      // Execute the update query
      const update = await pool.request()
        .input('dataId', dataId)
        .query(query);

      // Send the response back with rows affected
      return res.json({ num_row_aff: update.rowsAffected[0], seen: seen });
    } else {
      // If no user found with the provided dataId
      return res.status(404).json({ message: 'User not found' });
    }

  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: 'Error updating status' });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
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
    const sql = "SELECT lh.* , rm.title as role_title FROM lhi_user as lh left join role_master as rm on lh.Role = rm.id WHERE lh.deleted = 0 order by lh.id desc";
    const result = await pool.request().query(sql);
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching LHI data" });
  }
});
// Insert for Lhiuser
app.post("/postlhidata", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { Lhiuser,
    mobile_no,
    UserCode,
    email,
    remarks,
    status,
    Role,
    Reporting_to,
    Designation,
    employee_type

  } = JSON.parse(decryptedData);



  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists and is not soft-deleted
    let sql = `SELECT * FROM lhi_user WHERE  email = '${email}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Email already exists!" });
    } else {
      // Step 2: Check if the same Lhiuser exists but is soft-deleted
      sql = `SELECT * FROM lhi_user WHERE email = '${email}' AND deleted = 1`;
      const softDeletedData = await pool.request().query(sql);

      if (softDeletedData.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        sql = `UPDATE lhi_user SET deleted = 0 WHERE email = '${email}'`;
        await pool.request().query(sql);

        return res.json({ message: "Soft-deleted data restored successfully!" });
      } else {



        const getcount = `SELECT  max (right(REPLACE(REPLACE(REPLACE(usercode, CHAR(9), ''), CHAR(10), ''), CHAR(13), ''),4) )as  count  FROM lhi_user WHERE UserCode LIKE 'LHI-${employee_type}%' `;

        const getcountresult = await pool.request().query(getcount);

        console.log(getcountresult)

        const newcount = Number(getcountresult.recordset[0]?.count || 0) + 1;

        console.log(newcount)

        // Format the newcount as LH0001
        const licarecode = `LHI-${employee_type}-${newcount.toString().padStart(4, '0')}`;





        // Step 3: Insert new entry if no duplicates found
        sql = `INSERT INTO lhi_user (Lhiuser,remarks,Usercode,mobile_no,email,status,Role,Reporting_to,Designation) VALUES ('${Lhiuser}','${remarks}','${licarecode}','${mobile_no}','${email}','${status}','${Role}','${Reporting_to}','${Designation}')`
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const {
    Lhiuser, id, updated_by, mobile_no, Usercode, status, email, remarks, Role, Designation, Reporting_to,
  } = JSON.parse(decryptedData);





  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
      SELECT * FROM lhi_user
      WHERE email = '${email}'
      AND id != '${id}'
      AND deleted = 0
    `;
    const duplicateResult = await pool.request().query(checkDuplicateSql);

    if (duplicateResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, Email already exists!" });
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
          status = ${status},
          email = '${email}',
          remarks = '${remarks}',
          Role = '${Role}',
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching call status data" });
  }
});
// Insert for Callstatus
app.post("/postcalldata", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { Callstatus } = JSON.parse(decryptedData);

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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { Callstatus, id } = JSON.parse(decryptedData);
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
  const { ticket_no, engineerdata, call_status, sub_call_status, updated_by, group_code, site_defect, defect_type, engineername, activity_code } = req.body;


  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  let engineer_id;

  engineer_id = engineerdata.join(','); // Join the engineer IDs into a comma-separated string

  let engineer_name;

  engineer_name = engineername.join(',');


  const concatremark = [
    engineer_name ? `Engineer Name: ${engineer_name}` : ''
  ].filter(Boolean).join(' , ');





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
      SET engineer_id = '${engineer_id}', updated_by = '${updated_by}', updated_date = '${formattedDate}' ,assigned_to = '${engineer_name}'  WHERE ticket_no = '${ticket_no}'`;

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

    const productdetail = `select * from awt_uniqueproductmaster where CustomerID = '${customerId}' and serial_no = '${serial_no}'`
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
      .input("customer_id", sql.NVarChar, cust_id)
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
    return res.status(500).json({ error: "An error occurred while adding the ticket.", "Error": err });
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

    // Query to fetch the user by dataId
    const sql = `SELECT * FROM lhi_user WHERE id = @dataId`;
    const request = await pool.request()
      .input('dataId', dataId)
      .query(sql);

    // Check if records exist
    if (request.recordset.length > 0) {
      const status = request.recordset[0].status;
      console.log("Current status:", status);

      let query;
      let seen;

      if (status == 1) {
        // If status is 1, deactivate and set deactivation date
        query = `UPDATE lhi_user
                 SET status = 0, deactivation_date = GETDATE(), activation_date = NULL
                 WHERE id = @dataId`;
        seen = 0;
      } else {
        // If status is not 1, activate and set activation date
        query = `UPDATE lhi_user
                 SET status = 1, activation_date = GETDATE(), deactivation_date = NULL
                 WHERE id = @dataId`;
        seen = 1;
      }

      // Execute the update query
      const update = await pool.request()
        .input('dataId', dataId)
        .query(query);

      // Send the response back with rows affected
      return res.json({ num_row_aff: update.rowsAffected[0], seen: seen });
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
      licare_code,
      mode_of_contact,
      customer_class,
      Priority,
      upcoming = 'current',
      ticket_type,
      role
    } = req.query;

    const offset = (page - 1) * pageSize;

    const currentDate = new Date().toISOString().split('T')[0]

    const getcsp = `select * from lhi_user where Usercode = '${licare_code}'`

    const getcspresilt = await pool.request().query(getcsp)

    const assigncsp = getcspresilt.recordset[0].assigncsp







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

    if (role == '10') {
      sql += ` AND call_status IN ('Spares', 'Closed')`;
      countSql += ` AND call_status IN ('Spares', 'Closed')`;
    }

    if (assigncsp !== 'ALL') {
      // Convert to an array and wrap each value in single quotes
      const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");

      // Directly inject the formatted values into the SQL query
      sql += ` AND c.csp IN (${formattedCspList})`;
      countSql += ` AND c.csp IN (${formattedCspList})`;
    }



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

    if (ticket_type) {
      sql += `AND c.ticket_type LIKE @ticket_type`;
      countSql += `AND c.ticket_type LIKE @ticket_type`;
      params.push({ name: "ticket_type", value: `%${ticket_type}%` });
    }

    if (status) {
      sql += ` AND c.call_status = @status`;
      countSql += ` AND c.call_status = @status`;
      params.push({ name: "status", value: status });
    } else {
      // Check if any filter is applied
      if (!customerName && !customerEmail && !serialNo && !productCode && !customerMobile &&
        !ticketno && !customerID && !csp && !msp && !mode_of_contact && !customer_class && !ticket_type) {
        sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
        countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      }
    }

    if (status == undefined) {
      sql += ``;
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
        c.created_date DESC
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


app.get("/getcomplaintexcel", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fromDate, toDate, licare_code } = req.query;  // Only fromDate, toDate, and licare_code are expected.

    let sql;

    const getcsp = `select * from lhi_user where Usercode = '${licare_code}'`

    const getcspresilt = await pool.request().query(getcsp)

    const assigncsp = getcspresilt.recordset[0].assigncsp


    console.log(assigncsp, "#%")



    // Check if both fromDate and toDate are provided
    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "Both 'fromDate' and 'toDate' are required."
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];  // Current date to be used for filter if needed.

    // SQL query to fetch complaint tickets with fromDate and toDate filter only.
    // sql = `
    //   SELECT c.*, DATEDIFF(DAY, c.ticket_date, GETDATE()) AS ageingdays
    //   FROM complaint_ticket AS c
    //   WHERE c.deleted = 0
    //   AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate AND @toDate
    // `;
    sql = `
    SELECT 
    c.*, 
    acr.remark as final_remark, 
    DATEDIFF(DAY, c.ticket_date, GETDATE()) AS ageingdays
FROM complaint_ticket AS c
LEFT JOIN (
    SELECT acr.ticket_no, acr.remark, acr.created_date
    FROM awt_complaintremark acr
    JOIN (
        SELECT ticket_no, MAX(id) AS max_id
        FROM awt_complaintremark
        WHERE created_date LIKE '%2025%' AND updated_by IS NULL
        GROUP BY ticket_no
    ) latest ON acr.id = latest.max_id
) acr ON c.ticket_no = acr.ticket_no
WHERE c.deleted = 0
AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate  AND @toDate
    `;

    // Define the parameters for the query.
    let params = [
      { name: "fromDate", value: fromDate },
      { name: "toDate", value: toDate }
    ];


    if (assigncsp !== 'ALL') {
      // Convert to an array and wrap each value in single quotes
      const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");

      // Directly inject the formatted values into the SQL query
      sql += ` AND c.csp IN (${formattedCspList}) `;
    }

    sql += `order by RIGHT(c.ticket_no , 4) asc`

    console.log(sql)
    // Execute the SQL query
    const request = pool.request();
    params.forEach((param) => request.input(param.name, param.value));
    const result = await request.query(sql);



    // If no records are found, return an appropriate message
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "No records found for the given date range."
      });
    }

    // Return the data as JSON to the frontend
    return res.json({
      data: result.recordset
    });

  } catch (err) {
    console.error("Error fetching complaint data for Excel export:", err.message);
    return res.status(500).json({
      message: "An error occurred while fetching complaint data for Excel export.",
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
      if (!customerName && !customerEmail && !serialNo && !productCode && !customerMobile &&
        !ticketno && !customerID && !csp && !msp && !mode_of_contact && !customer_class) {
        sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
        countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      }
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
app.get("/getcspticketexcel", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fromDate, toDate, licare_code } = req.query;  // Only fromDate, toDate, and licare_code are expected.

    let sql;




    // Check if both fromDate and toDate are provided
    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "Both 'fromDate' and 'toDate' are required."
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];  // Current date to be used for filter if needed.

    // SQL query to fetch complaint tickets with fromDate and toDate filter only.
    sql = `
       SELECT c.*,
        DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        WHERE c.deleted = 0 AND c.csp = '${licare_code}'
      AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate AND @toDate
    `;

    // Define the parameters for the query.
    let params = [
      { name: "fromDate", value: fromDate },
      { name: "toDate", value: toDate }
    ];




    sql += `order by RIGHT(ticket_no , 4) asc`

    console.log(sql)
    // Execute the SQL query
    const request = pool.request();
    params.forEach((param) => request.input(param.name, param.value));
    const result = await request.query(sql);



    // If no records are found, return an appropriate message
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "No records found for the given date range."
      });
    }

    // Return the data as JSON to the frontend
    return res.json({
      data: result.recordset
    });

  } catch (err) {
    console.error("Error fetching complaint data for Excel export:", err.message);
    return res.status(500).json({
      message: "An error occurred while fetching complaint data for Excel export.",
      err: err.message
    });
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
      csp,
      msp,
      mode_of_contact,
      customer_class,
    } = req.query;

    const offset = (page - 1) * pageSize;

    let sql = `
        SELECT c.*, 
               DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        WHERE c.deleted = 0 AND c.msp = '${licare_code}'
    `;
    let countSql = `
        SELECT COUNT(*) as totalCount
        FROM complaint_ticket AS c
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
      if (!customerName && !customerEmail && !serialNo && !productCode && !customerMobile &&
        !ticketno && !customerID && !csp && !msp && !mode_of_contact && !customer_class) {
        sql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
        countSql += ` AND c.call_status != 'Closed' AND c.call_status != 'Cancelled'`;
      }
    }


    if (status == undefined) {
      sql += ``;
    }

    // Add pagination
    sql += `
      ORDER BY c.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;



    console.log(sql, "@RD")

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

app.get("/getmspticketexcel", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const { fromDate, toDate, licare_code } = req.query;  // Only fromDate, toDate, and licare_code are expected.

    let sql;




    // Check if both fromDate and toDate are provided
    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "Both 'fromDate' and 'toDate' are required."
      });
    }

    const currentDate = new Date().toISOString().split('T')[0];  // Current date to be used for filter if needed.

    // SQL query to fetch complaint tickets with fromDate and toDate filter only.
    sql = `
      SELECT c.*, e.title as assigned_name,
               DATEDIFF(day, (c.ticket_date), GETDATE()) AS ageingdays
        FROM complaint_ticket AS c
        LEFT JOIN awt_engineermaster AS e ON c.engineer_id = e.engineer_id
        WHERE c.deleted = 0 AND c.msp = '${licare_code}'
      AND CAST(c.ticket_date AS DATE) BETWEEN @fromDate AND @toDate
    `;

    // Define the parameters for the query.
    let params = [
      { name: "fromDate", value: fromDate },
      { name: "toDate", value: toDate }
    ];




    sql += `order by RIGHT(ticket_no , 4) asc`

    console.log(sql)
    // Execute the SQL query
    const request = pool.request();
    params.forEach((param) => request.input(param.name, param.value));
    const result = await request.query(sql);



    // If no records are found, return an appropriate message
    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "No records found for the given date range."
      });
    }

    // Return the data as JSON to the frontend
    return res.json({
      data: result.recordset
    });

  } catch (err) {
    console.error("Error fetching complaint data for Excel export:", err.message);
    return res.status(500).json({
      message: "An error occurred while fetching complaint data for Excel export.",
      err: err.message
    });
  }
});

// end Complaint list


//Register Page Complaint Duplicate Start

app.get("/getmultiplelocation/:pincode/:classification/:ticket_type", authenticateToken, async (req, res) => {

  const { pincode, classification, ticket_type } = req.params;

  try {

    const pool = await poolPromise;

    const sql = `SELECT cn.title as country, p.region_name as region, p.geostate_name as state, p.area_name as district, p.geocity_name as city,  o.msp_code as msp, f.title as mspname,  o.csp_code as csp, fm.title as cspname,  p.pincode , class_city , o.mother_branch
    FROM awt_pincode as p
    LEFT JOIN awt_region as r on p.region_id = r.id
    LEFT JOIN awt_country as cn on p.country_id = cn.id
    LEFT JOIN awt_geostate as s on p.geostate_id = s.id
    LEFT JOIN awt_district as d on p.area_id = d.id
    LEFT JOIN awt_geocity as c on p.geocity_id = c.id
    LEFT JOIN pincode_allocation as o on p.pincode = o.pincode
  LEFT JOIN awt_franchisemaster as f on f.licarecode =  o.msp_code
  LEFT JOIN awt_childfranchisemaster as fm on fm.licare_code =  o.csp_code
  where p.pincode = ${pincode} and o.customer_classification = '${classification}' and o.call_type = '${ticket_type}' and f.title != '' and fm.title != '' order by o.id desc`

    const result = await pool.request().query(sql);

    return res.json(result.recordset);

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});

app.get("/getmultiplepincode/:pincode", authenticateToken, async (req, res) => {

  const { pincode } = req.params;

  try {

    const pool = await poolPromise;

    const sql = ` Select * from awt_pincode  where pincode = ${pincode}`

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


    const sql = `select lhi.serial_no , lhi.DESCRIPTION as ModelNumber , ACCOUNT as customer_id , ALLOCATIONSTATUS as allocation , CUSTOMERCLASSIFICATION as customerClassification ,spm.SalesPartner ,spm.SalesAM , asl.ItemNumber from LHI_Licare_data as lhi LEFT JOIN SalesPartnerMaster AS spm  ON lhi.DealerCode = spm.BPcode left join awt_serial_list as asl on asl.serial_no = lhi.serial_no where lhi.serial_no = @serial`

    const result = await pool.request()
      .input('serial', serial)
      .query(sql);



    const fallbackSql = `SELECT ac.salutation , ac.customer_fname ,ac.customer_lname , ac.customer_type , ac.customer_classification , ac.mobileno , ac.alt_mobileno,ac.email ,allocation = 'Allocated',
au.CustomerID as customer_id , au.ModelNumber , au.address , au.region , au.state ,au.district , au.city , au.pincode ,au.purchase_date,au.SalesDealer as SalesPartner,au.serial_no , au.SubDealer as SalesAM ,au.ModelName as ItemNumber ,au.customer_classification as customerClassification , au.SerialStatus
FROM awt_uniqueproductmaster as au
left join awt_customer as ac on ac.customer_id = au.CustomerID
WHERE au.serial_no = @serial and au.SerialStatus = 'Active' order by au.id asc `;

    const fallbackResult = await pool.request()
      .input('serial', serial)
      .query(fallbackSql);



    const lastfallbacksql = `select serial_no ,ModelNumber,customer_classification as customerClassification,purchase_date ,ModelName  from awt_uniqueproductmaster where serial_no = @serial`


    const lastfallbackResult = await pool.request()
      .input('serial', serial)
      .query(lastfallbacksql);




    if (fallbackResult.recordset.length !== 0) {

      return res.json(fallbackResult.recordset);

    } else if (lastfallbackResult.recordset.length !== 0) {

      return res.json(lastfallbackResult.recordset);
    }
    else {
      return res.json(result.recordset);

    }






  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});
app.get("/getcheckserial/:serial", authenticateToken, async (req, res) => {
  const { serial } = req.params;

  try {

    const pool = await poolPromise;


    const sql = `select lhi.serial_no , lhi.DESCRIPTION as ModelNumber , ACCOUNT as customer_id , ALLOCATIONSTATUS as allocation , CUSTOMERCLASSIFICATION as customerClassification ,spm.SalesPartner ,spm.SalesAM , asl.ItemNumber from LHI_Licare_data as lhi LEFT JOIN SalesPartnerMaster AS spm  ON lhi.DealerCode = spm.BPcode left join awt_serial_list as asl on asl.serial_no = lhi.serial_no where lhi.serial_no = @serial`

    const result = await pool.request()
      .input('serial', serial)
      .query(sql);



    const fallbackSql = `SELECT ac.salutation , ac.customer_fname ,ac.customer_lname , ac.customer_type , ac.customer_classification , ac.mobileno , ac.alt_mobileno,ac.email ,allocation = 'Allocated',
au.CustomerID as customer_id , au.ModelNumber , au.address , au.region , au.state ,au.district , au.city , au.pincode ,au.purchase_date,au.SalesDealer as SalesPartner,au.serial_no , au.SubDealer as SalesAM ,au.ModelName as ItemNumber ,au.customer_classification as customerClassification , au.SerialStatus
FROM awt_uniqueproductmaster as au left join awt_customer as ac on ac.customer_id = au.CustomerID
WHERE au.serial_no = @serial and au.SerialStatus = 'Active' order by au.id desc`;

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





app.get("/getmobserial/:serial", authenticateToken, async (req, res) => {
  const { serial } = req.params;

  try {

    const pool = await poolPromise;

    const sql = `select lhi.serial_no , lhi.DESCRIPTION as ModelNumber , ACCOUNT as customer_id , ALLOCATIONSTATUS as allocation , CUSTOMERCLASSIFICATION as customerClassification ,spm.SalesPartner ,spm.SalesAM , asl.ItemNumber from LHI_Licare_data as lhi LEFT JOIN SalesPartnerMaster AS spm  ON lhi.DealerCode = spm.BPcode left join awt_serial_list as asl on asl.serial_no = lhi.serial_no where lhi.serial_no = @serial`;


    const fallbackSql = `SELECT allocation = 'Allocated', ac.customer_classification ,
    au.CustomerID as customer_id , au.ModelNumber ,au.serial_no,au.ModelName 
    FROM awt_uniqueproductmaster as au
    left join awt_customer as ac on ac.customer_id = au.CustomerID
    WHERE au.serial_no = @serial order by au.id desc`;




    const result = await pool.request()
      .input('serial', serial)
      .query(sql);


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
      const sql = "select * from call_status where deleted = 0";

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



app.get("/getsubcallstatus1", authenticateToken, async (req, res) => {
  try {
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query without parameter binding
    const sql = `
         SELECT r.*,
            c.Callstatus as Callstatus_title
      FROM sub_call_status r
      JOIN call_status c ON r.Callstatus_Id = c.id
      WHERE r.deleted = 0
      `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return only the recordset from the result
    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching subcallstatus:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching subcallstatus" });
  }
});


app.post("/putsubcallstatus", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { SubCallstatus, id, Callstatus_Id } = JSON.parse(decryptedData);
  try {


    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same title exists for another record (other than the current one) and is not soft-deleted
    const checkDuplicateSql = `
        SELECT *
        FROM sub_call_status
        WHERE SubCallstatus = '${SubCallstatus}'AND Callstatus_Id = '${Callstatus_Id}' AND id != ${id} AND deleted = 0
      `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If a duplicate exists (other than the current record)
      return res.status(409).json({ message: "Duplicate entry, subcallstatus already exists!" });
    } else {
      // Step 2: Update the record if no duplicates are found
      const updateSql = `
          UPDATE sub_call_status
          SET SubCallstatus = '${SubCallstatus}', Callstatus_Id = ${Callstatus_Id}
          WHERE id = ${id}
        `;
      await pool.request().query(updateSql);
      return res.json({ message: "subcat updated successfully!" });
    }
  } catch (err) {
    console.error("Error updating subcategory:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating subcallstatus" });
  }
});

app.post("/postsubcallstatus", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { SubCallstatus, Callstatus_Id } = JSON.parse(decryptedData);
  try {


    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Step 1: Check if the same SubCallstatus exists and is not soft-deleted
    const checkDuplicateSql = `
      SELECT *
      FROM sub_call_status
      WHERE SubCallstatus = '${SubCallstatus}' AND Callstatus_Id = '${Callstatus_Id}' AND deleted = 0
    `;
    const checkDuplicateResult = await pool.request().query(checkDuplicateSql);

    if (checkDuplicateResult.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, subcat already exists!" });
    } else {
      // Step 2: Check if the same SubCallstatus exists but is soft-deleted
      const checkSoftDeletedSql = `
        SELECT *
        FROM sub_call_status
        WHERE SubCallstatus = '${SubCallstatus}' AND deleted = 1
      `;
      const checkSoftDeletedResult = await pool.request().query(checkSoftDeletedSql);

      if (checkSoftDeletedResult.recordset.length > 0) {
        // If soft-deleted data exists, restore the entry
        const restoreSoftDeletedSql = `
          UPDATE sub_call_status
          SET deleted = 0
          WHERE SubCallstatus = '${SubCallstatus}'
        `;
        await pool.request().query(restoreSoftDeletedSql);
        return res.json({ message: "Soft-deleted subcat restored successfully!" });
      } else {
        // Step 3: Insert new entry if no duplicates found
        const insertSql = `
          INSERT INTO sub_call_status (SubCallstatus, Callstatus_Id)
          VALUES ('${SubCallstatus}', ${Callstatus_Id})
        `;
        await pool.request().query(insertSql);
        return res.json({ message: "subcat added successfully!" });
      }
    }
  } catch (err) {
    console.error("Error processing subcallstatus:", err); // Log error for debugging
    return res.status(500).json({ message: "Error processing subcallstatus" });
  }
});

app.get("/requestsubcall/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;


    const sql = `
      SELECT *
      FROM sub_call_status
      WHERE id = ${id} AND deleted = 0
    `;

    // Execute the query and get the results
    const result = await pool.request().query(sql);

    // Return the first record from the recordset if it exists, else return an empty object
    return res.json(result.recordset[0] || {});
  } catch (err) {
    console.error("Error fetching subcallstatus by ID:", err); // Log error for debugging
    return res.status(500).json({ message: "Error fetching subcallstatus" });
  }
});

app.post("/deletesubcall", authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;

    // Access the connection pool using poolPromise
    const pool = await poolPromise;


    const sql = `
      UPDATE sub_call_status
      SET deleted = 1
      WHERE id = ${id}
    `;

    // Execute the query
    const result = await pool.request().query(sql);

    return res.json(result);
  } catch (err) {
    console.error("Error updating subcallstatus:", err); // Log error for debugging
    return res.status(500).json({ message: "Error updating subcallstatus" });
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

app.post("/getuniqueengineer", authenticateToken,
  async (req, res) => {

    const { ticket_no } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `select * from awt_uniqueengineer where ticket_no = '${ticket_no}' and deleted = 0`;

      const result = await pool.request().query(sql);

      return res.json(result.recordset);
    } catch (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error occurred", details: err.message });
    }
  });

app.post("/getremoveengineer", authenticateToken,
  async (req, res) => {

    const { id } = req.body;

    const date = new Date()

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `update awt_uniqueengineer set deleted = 1 ,updated_date = GETDATE() where id = '${id}'`;

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

app.get("/getSpareParts/:item_code", authenticateToken, async (req, res) => {
  const { item_code } = req.params;



  try {
    const pool = await poolPromise;
    // Parameterized query
    const sql = `
      SELECT sp.id, 
       sp.ModelNumber, 
       sp.title as article_code,
       sp.ProductCode as spareId, 
       sp.ItemDescription as article_description, 
       spt.MRPQuotation as price
FROM Spare_parts as sp 
LEFT JOIN priceGroup as spt ON sp.PriceGroup = spt.PriceGroup
WHERE sp.deleted = 0 and ProductCode = @item_code
    `;

    const result = await pool.request()
      .input("item_code", item_code) // Specify the data type for the parameter
      .query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});
// app.get("/getSpareParts/:model", authenticateToken, async (req, res) => {
//   const { model } = req.params;



//   try {
//     const pool = await poolPromise;
//     // Parameterized query
//     const sql = `
//       SELECT sp.id, 
//        sp.ModelNumber, 
//        sp.title as article_code,
//        sp.ProductCode as spareId, 
//        sp.ItemDescription as article_description, 
//        spt.MRPQuotation as price
// FROM Spare_parts as sp 
// LEFT JOIN priceGroup as spt ON sp.PriceGroup = spt.PriceGroup
// WHERE sp.deleted = 0
//   AND TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(sp.ModelNumber, '     ', ' '), '    ', ' '), '   ', ' '), '  ', ' '), '  ', ' ')) = @model
//     `;

//     const result = await pool.request()
//       .input("model", model) // Specify the data type for the parameter
//       .query(sql);

//     return res.json(result.recordset);
//   } catch (err) {
//     console.error("Database error:", err);
//     return res.status(500).json({ error: "Database error occurred", details: err.message });
//   }
// });



app.post("/getDefectCodewisetype", authenticateToken,
  async (req, res) => {

    const { defect_code } = req.body;

    try {
      const pool = await poolPromise;
      // Modified SQL query using parameterized query
      const sql = `SELECT * FROM awt_typeofdefect  where groupdefect_code = ${defect_code} and deleted = 0`;

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
      const sql = `SELECT * FROM awt_site_defect  where defectgroupcode = ${defect_code} and deleted = 0`;

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
      CustomerName,
      ModelNumber,
      price,
      quotationNumber,
      licare_code,
      fromDate,
      toDate,
      customer_id,
      customer_class,
      mobile_no,
      alt_mobileno,
      email,
      state,
      customer_type,
      ticket_type,
      call_status,
      sub_call_status,
      warranty_status,
      serial_no,
      sevice_partner,
      child_service_partner,
      mother_branch,
      status,
      page = 1,
      pageSize = 10,
    } = req.query;

    const pool = await poolPromise;

    // Fetch assigncsp
    const getcspresilt = await pool.request().query(`SELECT * FROM lhi_user WHERE Usercode = '${licare_code}'`);
    const assigncsp = getcspresilt.recordset[0] && getcspresilt.recordset[0].assigncsp;

    // Initialize SQL and Count Queries
    let sql = `
      SELECT q.*, 
        c.customer_class, c.ticket_type, c.call_status, c.sub_call_status, c.warranty_status, 
        c.serial_no, c.sevice_partner, c.child_service_partner, c.mother_branch, 
        cs.mobileno, cs.alt_mobileno, cs.email, cs.customer_type , (select em.title from awt_engineermaster as em where q.assignedEngineer = em.engineer_id) as engineer_name ,
		(select top 1 cl.address from awt_customerlocation as cl where cl.customer_id = q.customer_id) as customer_address
      FROM awt_quotation AS q
      LEFT JOIN complaint_ticket AS c ON c.ticket_no = q.ticketId
      LEFT JOIN awt_customer AS cs ON cs.customer_id = q.customer_id
      WHERE q.deleted=0`;

    let countSql = `
      SELECT COUNT(*) as totalCount
      FROM awt_quotation AS q
      LEFT JOIN complaint_ticket AS c ON c.ticket_no = q.ticketId
      LEFT JOIN awt_customer AS cs ON cs.customer_id = q.customer_id
      WHERE 1=1`;

    // Apply assigncsp filter
    if (assigncsp !== 'ALL') {
      const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");
      sql += ` AND q.csp_code IN (${formattedCspList})`;
      countSql += ` AND q.csp_code IN (${formattedCspList})`;
    }

    // Apply all filters
    if (fromDate && toDate) {
      sql += ` AND q.ticketdate  BETWEEN '${fromDate}' AND '${toDate}'`;
      countSql += ` AND q.ticketdate  BETWEEN '${fromDate}' AND '${toDate}'`;
    }
    if (ticketId) {
      sql += ` AND q.ticketId LIKE '%${ticketId}%'`;
      countSql += ` AND q.ticketId LIKE '%${ticketId}%'`;
    }
    if (CustomerName) {
      sql += ` AND q.CustomerName LIKE '%${CustomerName}%'`;
      countSql += ` AND q.CustomerName LIKE '%${CustomerName}%'`;
    }
    if (ModelNumber) {
      sql += ` AND q.ModelNumber LIKE '%${ModelNumber}%'`;
      countSql += ` AND q.ModelNumber LIKE '%${ModelNumber}%'`;
    }
    if (price) {
      sql += ` AND q.price LIKE '%${price}%'`;
      countSql += ` AND q.price LIKE '%${price}%'`;
    }
    if (quotationNumber) {
      sql += ` AND q.quotationNumber LIKE '%${quotationNumber}%'`;
      countSql += ` AND q.quotationNumber LIKE '%${quotationNumber}%'`;
    }
    if (customer_id) {
      sql += ` AND q.customer_id LIKE '%${customer_id}%'`;
      countSql += ` AND q.customer_id LIKE '%${customer_id}%'`;
    }
    if (customer_class) {
      sql += ` AND c.customer_class LIKE '%${customer_class}%'`;
      countSql += ` AND c.customer_class LIKE '%${customer_class}%'`;
    }
    if (ticket_type) {
      sql += ` AND c.ticket_type LIKE '%${ticket_type}%'`;
      countSql += ` AND c.ticket_type LIKE '%${ticket_type}%'`;
    }
    if (call_status) {
      sql += ` AND c.call_status LIKE '%${call_status}%'`;
      countSql += ` AND c.call_status LIKE '%${call_status}%'`;
    }
    if (sub_call_status) {
      sql += ` AND c.sub_call_status LIKE '%${sub_call_status}%'`;
      countSql += ` AND c.sub_call_status LIKE '%${sub_call_status}%'`;
    }
    if (warranty_status) {
      sql += ` AND c.warranty_status LIKE '%${warranty_status}%'`;
      countSql += ` AND c.warranty_status LIKE '%${warranty_status}%'`;
    }
    if (serial_no) {
      sql += ` AND c.serial_no LIKE '%${serial_no}%'`;
      countSql += ` AND c.serial_no LIKE '%${serial_no}%'`;
    }
    if (sevice_partner) {
      sql += ` AND c.sevice_partner LIKE '%${sevice_partner}%'`;
      countSql += ` AND c.sevice_partner LIKE '%${sevice_partner}%'`;
    }
    if (child_service_partner) {
      sql += ` AND c.child_service_partner LIKE '%${child_service_partner}%'`;
      countSql += ` AND c.child_service_partner LIKE '%${child_service_partner}%'`;
    }
    if (mother_branch) {
      sql += ` AND c.mother_branch LIKE '%${mother_branch}%'`;
      countSql += ` AND c.mother_branch LIKE '%${mother_branch}%'`;
    }
    if (mobile_no) {
      sql += ` AND cs.mobileno LIKE '%${mobile_no}%'`;
      countSql += ` AND cs.mobileno LIKE '%${mobile_no}%'`;
    }
    if (alt_mobileno) {
      sql += ` AND cs.alt_mobileno LIKE '%${alt_mobileno}%'`;
      countSql += ` AND cs.alt_mobileno LIKE '%${alt_mobileno}%'`;
    }
    if (email) {
      sql += ` AND cs.email LIKE '%${email}%'`;
      countSql += ` AND cs.email LIKE '%${email}%'`;
    }
    if (state) {
      sql += ` AND c.state LIKE '%${state}%'`;
      countSql += ` AND c.state LIKE '%${state}%'`;
    }
    if (customer_type) {
      sql += ` AND cs.customer_type LIKE '%${customer_type}%'`;
      countSql += ` AND cs.customer_type LIKE '%${customer_type}%'`;
    }
    if (status) {
      sql += ` AND q.status LIKE '%${status}%'`;
      countSql += ` AND q.status LIKE '%${status}%'`;
    }

    // Pagination
    const offset = (page - 1) * pageSize;
    sql += ` ORDER BY q.quotationNumber DESC OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute queries
    const result = await pool.request().query(sql);
    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;

    // Encrypt result
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
      totalCount,
      page,
      pageSize,
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


app.get("/getquotationcsplist", authenticateToken, async (req, res) => {
  try {
    const {
      ticket_no,
      spareId,
      ModelNumber,
      title,
      quantity,
      price,
      quotationNumber,
      assignedEngineer,
      CustomerName,
      licare_code,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    let sql = `SELECT q.* FROM awt_quotation as q  WHERE 1=1 and q.csp_code = '${licare_code}' `;

    if (ticket_no) {
      sql += ` AND q.ticketId LIKE '%${ticket_no}%'`;
    }

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
    sql += `ORDER BY q.quotationNumber desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

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
    if (ticket_no) countSql += ` AND ticketId LIKE '%${ticket_no}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
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
    let { finaldata } = req.body;

    finaldata = JSON.parse(finaldata)


    const pool = await poolPromise;
    const newdata = finaldata.data;
    const ticket_no = finaldata.ticket_no;

    // Destructure values from `newdata`
    const { article_code, article_description, price, spareId, quantity } = newdata;

    const poolRequest = pool.request();

    // Check if the spare part already exists
    const checkDuplicateQuery = `
      SELECT 1
      FROM awt_uniquespare
      WHERE ticketId = @ticket_no AND article_code = @article_code_d
    `;

    const duplicateResult = await poolRequest
      .input('ticket_no', sql.VarChar, ticket_no)
      .input('article_code_d', sql.VarChar, article_code)
      .query(checkDuplicateQuery);

    if (duplicateResult.recordset.length > 0) {
      // Record exists, perform an update
      const updateSpareQuery = `
        UPDATE awt_uniquespare
        SET article_code = @article_code,
            article_description = @article_description,
            price = @price,
            quantity = @quantity,
            deleted = @deleted
        WHERE ticketId = @ticket_no AND article_code = @article_code_d
      `;

      await poolRequest
        .input('article_code', sql.VarChar, article_code)
        .input('article_description', sql.VarChar, article_description)
        .input('price', sql.VarChar, price)
        .input('quantity', sql.Int, quantity)
        .input('deleted', sql.Int, 0)
        .query(updateSpareQuery);

      res.status(200).send({ message: 'Spare part updated successfully!' });
    } else {
      // Record does not exist, perform an insert
      const insertSpareQuery = `
        INSERT INTO awt_uniquespare (ticketId, spareId, article_code, article_description, price, quantity)
        VALUES (@ticket_no, @spareId, @article_code, @article_description, @price, @quantity)
      `;

      await poolRequest
        .input('article_code', sql.VarChar, article_code)
        .input('article_description', sql.VarChar, article_description)
        .input('price', sql.VarChar, price)
        .input('quantity', sql.Int, quantity)
        .input('spareId', sql.VarChar, spareId)
        .query(insertSpareQuery);

      res.status(200).send({ message: 'Spare part added successfully!' });
    }
  } catch (error) {
    console.error('Error inserting or updating spare part:', error);
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
  const csp_code = finaldata.csp_code;



  let engineer_id;

  engineer_id = Engineer.join(',');


  const newdata = finaldata.data;



  try {

    // Get the latest quotation number
    const getcount = `SELECT TOP 1 id FROM awt_quotation ORDER BY id DESC`;
    const countResult = await pool.request().query(getcount);

    const latestQuotation = countResult.recordset[0]?.id || 0;

    const newcount = latestQuotation + 1

    const quotationcode = 'Q' + newcount.toString().padStart(4, "0")




    const query = `
    INSERT INTO awt_quotation
    (ticketId, ticketdate, quotationNumber, CustomerName, state, city, assignedEngineer, status, customer_id, ModelNumber,csp_code, created_date, created_by)
    VALUES
    (@ticket_no, @date, @quotationNumber, @CustomerName, @state, @city, @assignedEngineer, @status, @customer_id, @ModelNumber,@csp_code,  @created_date, @created_by)
  `;

    const result = await pool.request()
      .input('ticket_no', sql.NVarChar, ticket_no)
      .input('date', sql.NVarChar, date.toISOString()) // Format date properly
      .input('quotationNumber', sql.NVarChar, quotationcode)
      .input('CustomerName', sql.NVarChar, Customername) // Replace with actual value
      .input('state', sql.NVarChar, state) // Replace with actual value
      .input('city', sql.NVarChar, city) // Replace with actual value
      .input('csp_code', sql.NVarChar, csp_code) // Replace with actual value
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

    // Insert error into `error_log` table
    const errorLogQuery = `
      INSERT INTO error_log (api_name, error_desc, created_date)
      VALUES (@api_name, @error_desc, @created_date)
    `;

    try {
      await pool.request()
        .input('api_name', sql.NVarChar, '/add_quotation')
        .input('error_desc', sql.NVarChar, error.message)
        .input('created_date', sql.NVarChar, new Date().toISOString())
        .query(errorLogQuery);
    } catch (logError) {
      console.error("Error logging to error_log:", logError);
    }

    res.status(500).json({ message: "Error inserting data", error: error.message });
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
    const query = `select aq.* , ct.address,ct.customer_mobile,ct.customer_email , ct.assigned_to , ct.serial_no from  awt_quotation as aq left join complaint_ticket as ct on ct.ticket_no = aq.ticketId WHERE aq.id = @quote_id`;



    const result = await pool.request()
      .input('quote_id', sql.Int, quotaion_id) // Parameterize spare_id
      .query(query);
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();



    return res.json({ encryptedData });
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
    const sql = `select * from awt_engineermaster where status != 1 AND deleted = 0 AND employee_code = 'SRV' AND approved_by is null`;

    // Execute the query
    const result = await pool.request().query(sql);


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

app.post("/finalapproveenginner", authenticateToken, async (req, res) => {

  const { eng_id, approve_by } = req.body;



  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    const sql = `update awt_engineermaster set status = 1 , approved_by = '${approve_by}' where id = '${eng_id}' `;

    // Execute the query
    const result = await pool.request().query(sql);

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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
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

    // Check if the entry already exists
    const checkSql = `
      SELECT COUNT(*) AS count
      FROM awt_service_contact_form
      WHERE customer_id = @customerId AND ticket_no = @ticketNo
    `;

    const checkRequest = pool.request()
      .input('customerId', customerId)
      .input('ticketNo', ticketNo);

    const result = await checkRequest.query(checkSql);

    if (result.recordset[0].count > 0) {
      return res.status(400).json({ message: "Response already submitted" });
    }

    // Insert new entry
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

app.get("/awt_service_contact/check", authenticateToken, async (req, res) => {
  const { customerId, ticketNo } = req.query;

  try {
    const pool = await poolPromise;

    const checkSql = `
      SELECT COUNT(*) AS count
      FROM awt_service_contact_form
      WHERE customer_id = @customerId AND ticket_no = @ticketNo
    `;

    const request = pool.request()
      .input('customerId', customerId)
      .input('ticketNo', ticketNo);

    const result = await request.query(checkSql);

    res.send({ exists: result.recordset[0].count > 0 });
  } catch (err) {
    console.log("Error /awt_service_contact/check", err);
    res.status(500).send({ error: "Error occurred", details: err.message });
  }
});


app.post("/query", authenticateToken, async (req, res) => {
  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  try {
    let { encryptedQuery } = req.body; // Extract query and parameters from the body


    // Decrypt the encrypted query
    const bytes = CryptoJS.AES.decrypt(encryptedQuery, secretKey);
    const decryptedQuery = bytes.toString(CryptoJS.enc.Utf8);



    if (!decryptedQuery) {
      return res.status(400).json({ error: 'Bad Request: Failed to decrypt query' });
    }

    const pool = await poolPromise;
    const request = pool.request();


    const result = await request.query(decryptedQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in /query", error);
    return res.json(error)
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return only the recordset from the result
    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching categories:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// put role data

app.post("/putrole", authenticateToken, async (req, res) => {
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, id, description } = JSON.parse(decryptedData);
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
  const { encryptedData } = req.body;
  const decryptedData = decryptData(encryptedData, secretKey)
  const { title, description } = JSON.parse(decryptedData);

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

    // Fetch pages already assigned to this role
    const existingPagesQuery = `
      SELECT pageid FROM pagerole WHERE roleid = @role_id
    `;
    const existingPagesResult = await pool.request()
      .input("role_id", sql.Int, role_id)
      .query(existingPagesQuery);

    const existingPageIds = new Set(existingPagesResult.recordset.map(row => row.pageid));

    // Fetch all active pages from page_master
    const fetchPageIdsQuery = `SELECT id AS pageid FROM page_master WHERE deleted = 0`;
    const allPagesResult = await pool.request().query(fetchPageIdsQuery);
    const allPageIds = allPagesResult.recordset.map(row => row.pageid);

    // Identify missing pages
    const missingPages = allPageIds.filter(pageid => !existingPageIds.has(pageid));

    // Insert only missing pages
    if (missingPages.length > 0) {
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const request = transaction.request();
        for (const page_id of missingPages) {
          await request.query(`
            INSERT INTO pagerole (roleid, pageid, accessid) 
            VALUES (${role_id}, ${page_id}, 1)
          `);
        }

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        console.error("Transaction error:", err);
        return res.status(500).json({ error: "Failed to insert missing pages", details: err });
      }
    }

    // Fetch updated list
    const getDataQuery = `
      SELECT * 
      FROM pagerole AS pg 
      LEFT JOIN page_master AS pm ON pg.pageid = pm.id 
      WHERE pg.roleid = @role_id 
      ORDER BY pm.pagename ASC
    `;
    const updatedData = await pool.request()
      .input("role_id", sql.Int, role_id)
      .query(getDataQuery);

    return res.json(updatedData.recordset);
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


app.post('/getpageroledata', authenticateToken, async (req, res) => {
  const {
    role,
    masterpageid, ticketpageid, quotationpageid, enquirypageid, reportpageid,
    locationpageid, pincodepageid, productpageid, customerpageid, bussinesspageid,
    franchpageid, callstatuspageid, lhiuserpageid, servicepageid, faultpageid,
    ratepageid, sparearray, ticketreportid, claimreportid, feedbackreportid, annexureid, shipmentpageid, engineermasterpageid
  } = req.body;



  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    masterpage: parseIds(masterpageid),
    ticketpage: parseIds(ticketpageid),
    quotationpage: parseIds(quotationpageid),
    enquirypage: parseIds(enquirypageid),
    reportpage: parseIds(reportpageid),
    locationpage: parseIds(locationpageid),
    pincodepage: parseIds(pincodepageid),
    productpage: parseIds(productpageid),
    customerpage: parseIds(customerpageid),
    bussinesspage: parseIds(bussinesspageid),
    franchpage: parseIds(franchpageid),
    callstatuspage: parseIds(callstatuspageid),
    lhiuserpage: parseIds(lhiuserpageid),
    servicepage: parseIds(servicepageid),
    faultpage: parseIds(faultpageid),
    ratepage: parseIds(ratepageid),
    sparearray: parseIds(sparearray),
    ticketreport: parseIds(ticketreportid),
    claimreport: parseIds(claimreportid),
    feedbackreport: parseIds(feedbackreportid),
    annexure: parseIds(annexureid),
    shipmentpage: parseIds(shipmentpageid),
    engineermasterpage: parseIds(engineermasterpageid)
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getlocationroledata', authenticateToken, async (req, res) => {
  const { role, countrypage, regionpage, geostatepage, districtpage, geocitypage, pincodepage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    countrypage: parseIds(countrypage),
    regionpage: parseIds(regionpage),
    geostatepage: parseIds(geostatepage),
    districtpage: parseIds(districtpage),
    geocitypage: parseIds(geocitypage),
    pincodepage: parseIds(pincodepage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getallocationroledata', authenticateToken, async (req, res) => {
  const { role, allocationpage, shipmentfgpage, shipmentpartpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    allocationpage: parseIds(allocationpage),
    shipmentfgpage: parseIds(shipmentfgpage),
    shipmentpartpage: parseIds(shipmentpartpage),

  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});
app.post('/getengineerroledata', authenticateToken, async (req, res) => {
  const { role, engineerpage, engineerlistpage, engineerapprovepage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    engineerpage: parseIds(engineerpage),
    engineerlistpage: parseIds(engineerlistpage),
    engineerapprovepage: parseIds(engineerapprovepage),

  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});
app.post('/getshhipmentroledata', authenticateToken, async (req, res) => {
  const { role, shipmentfgpage, shipmentpartpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    shipmentfgpage: parseIds(shipmentfgpage),
    shipmentpartpage: parseIds(shipmentpartpage),

  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getproductspareroledata', authenticateToken, async (req, res) => {
  const { role, productsparepage, stockpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    stockpage: parseIds(stockpage),
    productsparepage: parseIds(productsparepage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});
app.post('/getcustomerroledata', authenticateToken, async (req, res) => {
  const { role, customerpage, customerlistpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    customerlistpage: parseIds(customerlistpage),
    customerpage: parseIds(customerpage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getbussinessroledata', authenticateToken, async (req, res) => {
  const { role, bussinesspage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    bussinesspage: parseIds(bussinesspage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getfranchiseroledata', authenticateToken, async (req, res) => {
  const { role, masterfpage, childfpage, childlistpage, engineerpage, engineerlistpage, engineerapprovepage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    masterfpage: parseIds(masterfpage),
    childfpage: parseIds(childfpage),
    childlistpage: parseIds(childlistpage),
    engineerpage: parseIds(engineerpage),
    engineerlistpage: parseIds(engineerlistpage),
    engineerapprovepage: parseIds(engineerapprovepage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getcallstatusroledata', authenticateToken, async (req, res) => {
  const { role, callstatuspage, subcallstatuspage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    callstatuspage: parseIds(callstatuspage),
    subcallstatuspage: parseIds(subcallstatuspage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getlhiuserroledata', authenticateToken, async (req, res) => {
  const { role, lhiuserpage, rolepage, roleassignpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    lhiuserpage: parseIds(lhiuserpage),
    rolepage: parseIds(rolepage),
    roleassignpage: parseIds(roleassignpage)
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getserviceroledata', authenticateToken, async (req, res) => {
  const { role, servicecontractpage, servicelistpage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    servicecontractpage: parseIds(servicecontractpage),
    servicelistpage: parseIds(servicelistpage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

app.post('/getproductroledata', authenticateToken, async (req, res) => {
  const { role, categorypage, subcatpage, producttypepage, productlinepage, materialpage, manufacturerpage, productspage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    categorypage: parseIds(categorypage),
    subcatpage: parseIds(subcatpage),
    producttypepage: parseIds(producttypepage),
    productlinepage: parseIds(productlinepage),
    materialpage: parseIds(materialpage),
    manufacturerpage: parseIds(manufacturerpage),
    productspage: parseIds(productspage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});
app.post('/getfaultroledata', authenticateToken, async (req, res) => {
  const { role, defectgrouppage, typedefectpage, sitedefectpage, activitypage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    defectgrouppage: parseIds(defectgrouppage),
    typedefectpage: parseIds(typedefectpage),
    sitedefectpage: parseIds(sitedefectpage),
    activitypage: parseIds(activitypage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});
app.post('/getratecardroledata', authenticateToken, async (req, res) => {
  const { role, ratecardpage, masterpage, postsalepage } = req.body;

  // Function to convert comma-separated strings into arrays
  const parseIds = (ids) => (typeof ids === "string" && ids.trim() !== "" ? ids.split(",").map(Number) : []);

  // Convert all page IDs from strings to arrays
  const pageTypes = {
    ratecardpage: parseIds(ratecardpage),
    masterpage: parseIds(masterpage),
    postsalepage: parseIds(postsalepage),
  };

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("roleid", sql.Int, role);

    let queryParts = [];
    let index = 0;

    for (const [pageType, pageIds] of Object.entries(pageTypes)) {
      if (pageIds.length > 0) {
        let pageParams = pageIds.map((_, i) => `@pageid${index + i}`).join(",");
        queryParts.push(`
          SELECT '${pageType}' AS pageType, COUNT(*) AS count
          FROM pagerole
          WHERE roleid = @roleid AND pageid IN (${pageParams}) AND accessid > 1
        `);
        pageIds.forEach((id, i) => request.input(`pageid${index + i}`, sql.Int, id));
        index += pageIds.length;
      }
    }

    if (queryParts.length === 0) {
      return res.json(Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])));
    }

    const query = queryParts.join(" UNION ALL ");
    const result = await request.query(query);

    // Convert results to a key-value format
    const response = Object.fromEntries(Object.keys(pageTypes).map(key => [key, 0])); // Default all pages to 0

    result.recordset.forEach(row => {
      response[row.pageType] = row.count > 0 ? 1 : 0;
    });

    return res.json(response);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});



app.post('/assign_role', authenticateToken, async (req, res) => {

  let { accessid, id, pageid, roleid } = req.body;
  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;


    // Prepare values for bulk insert
    const updatesql = `update pagerole set accessid = '${accessid}' ,pageid = '${pageid}',roleid = '${roleid}' where id = ${id}`;

    console.log(updatesql, "#$%^&")

    await pool.request().query(updatesql)

    return res.json({
      message: "Roles assigned successfully",
    });


  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});



// app.post('/assign_role', authenticateToken, async (req, res) => {

//   let rolePages = req.body;




//   // Validate the input
//   if (!Array.isArray(rolePages) || rolePages.length === 0) {
//     return res.status(400).json({ error: "Invalid input: 'rolePages' should be a non-empty array." });
//   }

//   const role_id = rolePages[0]?.roleid;

//   if (!role_id) {
//     return res.status(400).json({ error: "Invalid input: 'roleid' is required." });
//   }

//   try {
//     // Connect to the MSSQL database
//     const pool = await poolPromise;

//     // Delete existing roles for the given role_id
//     const deleteSql = "DELETE FROM pagerole WHERE roleid = @roleid";
//     await pool.request()
//       .input("roleid", sql.Int, role_id)
//       .query(deleteSql);

//     // Prepare values for bulk insert
//     const insertSql = "INSERT INTO pagerole (roleid, pageid, accessid) VALUES (@roleid, @pageid, @accessid)";
//     const transaction = new sql.Transaction(pool);

//     try {
//       await transaction.begin();

//       for (const rolePage of rolePages) {
//         await transaction.request()
//           .input("roleid", sql.Int, rolePage.roleid)
//           .input("pageid", sql.Int, rolePage.pageid)
//           .input("accessid", sql.Int, rolePage.accessid)
//           .query(insertSql);
//       }

//       await transaction.commit();

//       return res.json({
//         message: "Roles assigned successfully",
//         affectedRows: rolePages.length,
//       });

//     } catch (err) {
//       await transaction.rollback();
//       console.error("Transaction error:", err);
//       return res.status(500).json({ error: "Failed to insert roles", details: err });
//     }

//   } catch (err) {
//     console.error("Database error:", err);
//     return res.status(500).json({ error: "Database query failed", details: err });
//   }
// });

// complete dump of ticket data 

app.post("/getcomplainticketdump", authenticateToken, async (req, res) => {

  const { startDate, endDate, licare_code } = req.body;
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const getcsp = `select * from lhi_user where Usercode = '${licare_code}'`


    const getcspresilt = await pool.request().query(getcsp)

    const assigncsp = getcspresilt.recordset[0].assigncsp

    let sql;


    // sql = `Select id,ticket_no, ticket_date,customer_id,customer_name,customer_mobile,alt_mobile,customer_email,ModelNumber,serial_no, address, region, state, city, area, pincode, mother_branch,sevice_partner,child_service_partner, msp, csp, sales_partner, assigned_to, engineer_code, engineer_id, ticket_type, call_type , sub_call_status, call_status, warranty_status, purchase_date, mode_of_contact, customer_class, call_priority, closed_date,group_code,defect_type,site_defect,activity_code,  created_date, created_by,deleted From complaint_ticket where deleted = 0  AND ticket_date >= '${startDate}' AND ticket_date <= '${endDate}' `


    sql = `SELECT 
    ct.id,
    ct.ticket_no,
    ct.ticket_date,
    ct.customer_id,
    ct.customer_name,
    ct.customer_mobile,
    ct.alt_mobile,
    ct.customer_email,
    ct.ModelNumber,
    ct.serial_no,
    ct.address,
    ct.region,
    ct.state,
    ct.city,
    ct.area,
    ct.pincode,
    ct.mother_branch,
    ct.sevice_partner,
    ct.child_service_partner,
    ct.msp,
    ct.csp,
    ct.sales_partner,
    ct.assigned_to,
    ct.engineer_code,
    ct.engineer_id,
    ct.ticket_type,
    ct.call_type,
    ct.sub_call_status,
    ct.call_status,
    ct.warranty_status,
    ct.purchase_date,
    ct.mode_of_contact,
    ct.customer_class,
    ct.call_priority,
    ct.closed_date,
    ct.group_code,
    ct.defect_type,
    ct.site_defect,
    ct.activity_code,
    ct.created_date,
    ct.created_by,
    ct.deleted,
    acr.remark AS FinalRemark
FROM complaint_ticket ct
LEFT JOIN (
    SELECT acr1.ticket_no, acr1.remark, acr1.created_date
    FROM awt_complaintremark acr1
    JOIN (
        SELECT ticket_no, MAX(id) AS max_id
        FROM awt_complaintremark
        WHERE created_date LIKE '%2025%' AND updated_by IS NULL
        GROUP BY ticket_no
    ) latest ON acr1.id = latest.max_id
) acr ON ct.ticket_no = acr.ticket_no
WHERE ct.deleted = 0 
  AND ct.ticket_date >= '${startDate}' 
  AND ct.ticket_date <= '${endDate}' `



    if (assigncsp !== 'ALL') {
      // Convert to an array and wrap each value in single quotes
      const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");

      // Directly inject the formatted values into the SQL query
      sql += ` AND ct.csp IN (${formattedCspList})`;
    }

    sql += ` ORDER BY RIGHT(ct.ticket_no , 4) ASC`;





    const result = await pool.request().query(sql);
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
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    // Return the result as JSON
    return res.json({ encryptedData });
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


app.post('/getcallrecorddetails', authenticateToken, async (req, res) => {
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



// fetch enquiry details 

app.get("/getenquiry", authenticateToken, async (req, res) => {
  try {
    const {
      enquiry_no,
      customer_name,
      mobile,
      customer_type,
      enquiry_type,
      priority,
      modelnumber,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    // Access the connection pool using poolPromise
    const pool = await poolPromise;

    // Direct SQL query
    let sql = `
      SELECT p.* FROM awt_enquirymaster as p WHERE deleted = 0 `;
    if (enquiry_no) {
      sql += ` AND p.enquiry_no LIKE '%${enquiry_no}%'`;
    }

    if (customer_name) {
      sql += ` AND p.customer_name LIKE '%${customer_name}%'`;
    }

    if (mobile) {
      sql += ` AND p.mobile LIKE '%${mobile}%'`;
    }

    if (customer_type) {
      sql += ` AND p.customer_type LIKE '%${customer_type}%'`;
    }

    if (enquiry_type) {
      sql += ` AND p.enquiry_type LIKE '%${enquiry_type}%'`;
    }

    if (priority) {
      sql += ` AND p.priority LIKE '%${priority}%'`;
    }
    if (modelnumber) {
      sql += ` AND p.modelnumber LIKE '%${modelnumber}%'`;
    }


    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY p.enquiry_no  OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;


    // Execute the query
    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM awt_enquirymaster where 1=1 `;
    if (enquiry_no) countSql += ` AND enquiry_no LIKE '%${enquiry_no}%'`;
    if (customer_name) countSql += ` AND customer_name LIKE '%${customer_name}%'`;

    if (mobile) countSql += ` AND mobile LIKE '%${mobile}%'`;
    if (customer_type) countSql += ` AND customer_type LIKE '%${customer_type}%'`;
    if (enquiry_type) countSql += ` AND enquiry_type LIKE '%${enquiry_type}%'`;
    if (priority) countSql += ` AND priority LIKE '%${priority}%'`;
    if (modelnumber) countSql += ` AND modelnumber LIKE '%${modelnumber}%'`;

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


app.post("/searchenquiry", authenticateToken, async (req, res) => {
  const {
    search
  } = req.body;

  try {
    const pool = await poolPromise;

    const sql = `
    SELECT * 
    FROM awt_enquirymaster 
    WHERE 
      (customer_name LIKE '%' + @search + '%' 
      OR mobile LIKE '%' + @search + '%' 
      OR email LIKE '%' + @search + '%') 
      AND deleted = 0
  `;

    const result = await pool.request()
      .input("search", search)
      .query(sql);

    const customerdetails = result.recordset[0]

    const previousrecords = result.recordset


    res.status(200).json({ customerdetails, previousrecords });
  } catch (err) {
    console.error("Error updating enquiry:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post("/addenquiryremark", authenticateToken, async (req, res) => {
  const { remark, leadconvert, enquiry_no, created_by } = req.body;

  const date = new Date()

  try {
    const pool = await poolPromise;

    const updatestatus = `update awt_enquirymaster set leadstatus = '${leadconvert}' where enquiry_no = '${enquiry_no}'`

    await pool.request().query(updatestatus)

    // SQL query with placeholders
    const sql = `INSERT INTO enquiry_remark (remark, leadconvert ,enquiry_no ,created_date , created_by) VALUES (@remark, @leadconvert,@enquiry_no , @created_date , @created_by)`;

    // Execute the query with parameters
    const result = await pool
      .request()
      .input("remark", remark) // Assuming 'remark' is a string
      .input("leadconvert", leadconvert) // Assuming 'leadconvert' is a string
      .input("enquiry_no", enquiry_no) // Assuming 'leadconvert' is a string
      .input("created_by", created_by) // Assuming 'leadconvert' is a string
      .input("created_date", date) // Assuming 'leadconvert' is a string
      .query(sql);

    res.status(200).json({ message: "Remark Added", result });
  } catch (err) {
    console.error("Error adding enquiry remark:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


app.post("/getenquiryremark", authenticateToken, async (req, res) => {
  const { enquiry_no } = req.body;

  try {
    const pool = await poolPromise;

    // SQL query with placeholders
    const sql = `select er.* , ul.title from enquiry_remark as er left join userdetails as ul on ul.usercode = er.created_by where er.enquiry_no = '${enquiry_no}'`;

    // Execute the query with parameters
    const result = await pool.request().query(sql);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error adding enquiry remark:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


// put enquiry data

app.post("/putenquiry", authenticateToken, async (req, res) => {
  const {
    uid, // The unique identifier for the enquiry to be updated
    source,
    enquiry_date,
    salutation,
    customer_name,
    email,
    mobile,
    alt_mobile,
    request_mobile,
    customer_type,
    enquiry_type,
    address,
    pincode,
    state,
    district,
    city,
    interested,
    modelnumber,
    priority,
    notes,
    awhatsapp,
    mwhatsapp,
    updated_by,

  } = req.body;

  try {
    const pool = await poolPromise;

    const sql = `
      UPDATE awt_enquirymaster
      SET 
        source = @source,
        enquiry_date = @enquiry_date,
        salutation = @salutation,
        customer_name = @customer_name,
        email = @email,
        mobile = @mobile,
        alt_mobile = @alt_mobile,
        request_mobile = @request_mobile,
        customer_type = @customer_type,
        enquiry_type = @enquiry_type,
        address = @address,
        pincode = @pincode,
        state = @state,
        district = @district,
        city = @city,
        interested = @interested,
        modelnumber = @modelnumber,
        priority = @priority,
        notes = @notes,
        awhatsapp = @awhatsapp,
        mwhatsapp = @mwhatsapp,
        updated_by = @updated_by,
        updated_date = GETDATE() 
      WHERE id = @id
    `;

    const result = await pool.request()
      .input("id", uid)
      .input("source", source)
      .input("enquiry_date", enquiry_date)
      .input("salutation", salutation)
      .input("customer_name", customer_name)
      .input("email", email)
      .input("mobile", mobile)
      .input("alt_mobile", alt_mobile)
      .input("request_mobile", request_mobile)
      .input("customer_type", customer_type)
      .input("enquiry_type", enquiry_type)
      .input("address", address)
      .input("pincode", pincode)
      .input("state", state)
      .input("district", district)
      .input("city", city)
      .input("interested", interested)
      .input("modelnumber", modelnumber)
      .input("priority", priority)
      .input("notes", notes)
      .input("awhatsapp", awhatsapp)
      .input("mwhatsapp", mwhatsapp)
      .input("updated_by", updated_by)
      .query(sql);

    res.status(200).json({ message: "Enquiry updated successfully!", result });
  } catch (err) {
    console.error("Error updating enquiry:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});


// post role data 
app.post("/postenquiry", authenticateToken, async (req, res) => {
  try {
    let {
      source,
      enquiry_date,
      salutation,
      customer_name,
      email,
      mobile,
      alt_mobile,
      request_mobile,
      customer_type,
      enquiry_type,
      address,
      pincode,
      state,
      district,
      city,
      interested,
      modelnumber,
      priority,
      notes,
      created_by,
      mwhatsapp,
      awhatsapp
    } = req.body;


    const pool = await poolPromise;


    const created_date = new Date()

    //Enquiry Id Creation 

    const createenquiryid = `select Count(*) as count  from awt_enquirymaster`;

    const getcount = await pool.request().query(createenquiryid)

    const newcount = getcount.recordset[0].count + 1;

    const formatDate = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`;

    const Enquiry_no = `EH${formatDate}-${newcount.toString().padStart(4, "0")}`;



    // Access the connection pool

    // SQL Query to insert data into the enquiry table
    const sql = `
      INSERT INTO awt_enquirymaster (
        source, enquiry_no,enquiry_date, salutation, customer_name, email, mobile, alt_mobile, request_mobile, customer_type, enquiry_type, address, pincode, state, district, city, interested, modelnumber, priority, notes , awhatsapp, mwhatsapp,leadstatus,created_by,created_date
      )
      VALUES (
        @source,@enquiry_no, @enquiry_date, @salutation, @customer_name, @email, @mobile, @alt_mobile, @request_mobile, @customer_type, @enquiry_type, @address, @pincode, @state, @district, @city, @interested, @modelnumber, @priority, @notes ,@awhatsapp, @mwhatsapp,@leadstatus,@created_by,@created_date
      );
    `;

    // Use prepared statements to avoid SQL injection
    const result = await pool.request()
      .input("source", source)
      .input("enquiry_no", Enquiry_no)
      .input("enquiry_date", enquiry_date)
      .input("salutation", salutation)
      .input("customer_name", customer_name)
      .input("email", email || null) // Handle optional fields
      .input("mobile", mobile)
      .input("alt_mobile", alt_mobile || null)
      .input("request_mobile", request_mobile || null)
      .input("customer_type", customer_type)
      .input("enquiry_type", enquiry_type)
      .input("address", address)
      .input("pincode", pincode)
      .input("state", state || null)
      .input("district", district || null)
      .input("city", city || null)
      .input("interested", interested)
      .input("modelnumber", modelnumber || null)
      .input("priority", priority)
      .input("notes", notes)
      .input("awhatsapp", awhatsapp)
      .input("mwhatsapp", mwhatsapp)
      .input("leadstatus", 'No')
      .input("created_by", created_by)
      .input("created_date", created_date)
      .query(sql);

    return res.status(201).json({ message: "Enquiry added successfully", data: result.recordset });

  } catch (err) {
    console.error("Error adding enquiry:", err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
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
    SELECT TOP 20 licare_code as id, title
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

app.post("/getsearcheng", authenticateToken, async (req, res) => {
  const { param } = req.body;

  if (!param) {
    return res.status(400).json({ message: "Invalid parameter" });
  }

  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
    SELECT TOP 20 engineer_id as id, title
    FROM awt_engineermaster
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
    SELECT TOP 20 id, item_description ,item_code
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
  const { invoice_number, invoice_date, csp_no, csp_name, created_by, remark } = req.body;

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
    const sql = `INSERT INTO awt_grnmaster (grn_no, invoice_no, invoice_date, csp_name, csp_code,remark, created_date, created_by) 
                 VALUES (@grn_no, @invoice_no, @invoice_date, @csp_name, @csp_code, @remark, @created_date, @created_by)`;

    const result = await pool.request()
      .input('grn_no', grn_no)
      .input('invoice_no', invoice_number)
      .input('invoice_date', invoice_date)
      .input('csp_name', csp_name)
      .input('csp_code', csp_no)  // Assuming you want to insert csp_no as csp_code
      .input('remark', remark)  // Assuming you want to insert csp_no as csp_code
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
  const { issue_date, lhi_code, lhi_name, remark, created_by, isEng } = req.body;

  try {
    const pool = await poolPromise;


    // Query to get the count of rows in awt_grnmaster
    const creategrnno = `SELECT COUNT(*) AS count FROM awt_spareoutward`;
    const checkResult = await pool.request().query(creategrnno);

    // Generate the GRN number based on the count
    const issueCount = checkResult.recordset[0].count || 0;
    const issue_no = `Issue-${issueCount + 1}`; // Example: GRN-1, GRN-2, etc.


    // Insert the data into awt_grnmaster
    const sql = `INSERT INTO awt_spareoutward (issue_no, issue_date, lhi_name, lhi_code,remark,issue_to,created_date, created_by) 
                 VALUES (@issue_no, @issue_date, @lhi_name, @lhi_code,@remark,@issue_to,@created_date, @created_by)`;

    const result = await pool.request()
      .input('issue_no', issue_no)
      .input('issue_date', issue_date)
      .input('lhi_name', lhi_name)
      .input('lhi_code', lhi_code)  // Assuming you want to insert csp_no as csp_code
      .input('issue_to', isEng)  // Assuming you want to insert csp_no as csp_code
      .input('remark', remark)  // Assuming you want to insert csp_no as csp_code
      .input('created_date', new Date())  // Use the current date for created_date
      .input('created_by', created_by)
      .query(sql);

    // If the insert was successful, send the result
    return res.json({ message: "Issue created successfully", issue_no: issue_no, issue_to: isEng, lhi_code: lhi_code, data: result.recordset });

  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

app.post('/updategrnspares', authenticateToken, async (req, res) => {
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


app.post('/updateissuespares', authenticateToken, async (req, res) => {
  const spareData = req.body; // Expecting an array of spare objects

  if (!Array.isArray(spareData)) {
    return res.status(400).json({ error: 'Invalid payload format. Expected an array.' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Start a transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    for (const item of spareData) {
      if (!item.issue_no || !item.article_code || !item.quantity || !item.licare_code) {
        return res.status(400).json({ error: 'Missing required fields in spare data.' });
      }

      const request = new sql.Request(transaction);

      // Update quantity in `awt_cspissuespare`
      const updateIssueQuery = `
        UPDATE  awt_cspissuespare
        SET quantity = @quantity 
        WHERE issue_no = @issue_no AND spare_no = @spare_no
      `;

      request.input('issue_no', sql.VarChar, item.issue_no);
      request.input('spare_no', sql.VarChar, item.article_code);
      request.input('quantity', sql.Int, item.quantity);
      await request.query(updateIssueQuery);


      // Update or insert into `engineer_stock` if issued to an engineer
      if (item.issue_to === 'eng') {
        const engStockRequest = new sql.Request(transaction);

        // Check if stock exists
        const getEngStockQuery = `
      SELECT stock_quantity
      FROM engineer_stock
      WHERE product_code = @product_code and eng_code = @eng_code
    `;


        engStockRequest.input('product_code', sql.VarChar, item.article_code);
        engStockRequest.input('productname', sql.VarChar, item.article_title);
        engStockRequest.input('eng_code', sql.VarChar, item.lhi_code);
        const stockEngResult = await engStockRequest.query(getEngStockQuery);

        if (stockEngResult.recordset.length > 0) {
          const existingStock = stockEngResult.recordset[0];
          const updatedQty = Number(existingStock.stock_quantity) + Number(item.quantity);
          const createdDate = new Date().toISOString();
          const updateEngStockQuery = `
        UPDATE engineer_stock
        SET stock_quantity = @updated_qty , updated_by = @updated_by , updated_date = @updated_date 
        WHERE product_code = @product_code and eng_code = @eng_code
      `;
          engStockRequest.input('updated_qty', sql.Int, updatedQty);
          engStockRequest.input('updated_by', sql.VarChar, item.licare_code);
          engStockRequest.input('updated_date', sql.DateTime, createdDate);
          await engStockRequest.query(updateEngStockQuery);
        } else {
          const createdDate = new Date().toISOString();
          const insertEngStockQuery = `
        INSERT INTO engineer_stock (eng_code,product_code, productname,stock_quantity, created_by, created_date)
        VALUES (@eng_code,@product_code,@productname, @stock_qty, @created_by, @created_date)
      `;
          engStockRequest
            .input('stock_qty', sql.Int, item.quantity)
            .input('created_by', sql.VarChar, item.licare_code)
            .input('created_date', sql.DateTime, createdDate);
          await engStockRequest.query(insertEngStockQuery);
        }
      }


      if (item.issue_to === 'csp') {
        const cspStockRequest = new sql.Request(transaction);

        // Check if stock exists
        const getEngStockQuery = `
      SELECT stock_quantity
      FROM csp_stock
      WHERE product_code = @product_code and csp_code = @csp_code
    `;


        cspStockRequest.input('product_code', sql.VarChar, item.article_code);
        cspStockRequest.input('productname', sql.VarChar, item.article_title);
        cspStockRequest.input('csp_code', sql.VarChar, item.lhi_code);
        const stockEngResult = await cspStockRequest.query(getEngStockQuery);

        if (stockEngResult.recordset.length > 0) {
          const existingStock = stockEngResult.recordset[0];
          const updatedQty = Number(existingStock.stock_quantity) + Number(item.quantity);
          const createdDate = new Date().toISOString();
          const updateEngStockQuery = `
        UPDATE csp_stock
        SET stock_quantity = @updated_qty , updated_by = @updated_by , updated_date = @updated_date 
        WHERE product_code = @product_code and csp_code = @csp_code
      `;
          cspStockRequest.input('updated_qty', sql.Int, updatedQty);
          cspStockRequest.input('updated_by', sql.VarChar, item.licare_code);
          cspStockRequest.input('updated_date', sql.DateTime, createdDate);
          await cspStockRequest.query(updateEngStockQuery);
        } else {
          const createdDate = new Date().toISOString();
          const insertEngStockQuery = `
        INSERT INTO csp_stock (csp_code,product_code, productname,stock_quantity, created_by, created_date)
        VALUES (@csp_code,@product_code,@productname, @stock_qty, @created_by, @created_date)
      `;
          cspStockRequest
            .input('stock_qty', sql.Int, item.quantity)
            .input('created_by', sql.VarChar, item.licare_code)
            .input('created_date', sql.DateTime, createdDate);
          await cspStockRequest.query(insertEngStockQuery);
        }
      }






      // Get previous stock
      const getStockQuery = `
        SELECT stock_quantity 
        FROM csp_stock 
        WHERE product_code = @spare_no AND csp_code = @licare_code
      `;
      request.input('licare_code', sql.VarChar, item.licare_code);
      const stockResult = await request.query(getStockQuery);



      if (stockResult.recordset.length > 0) {




        const spare = stockResult.recordset[0];
        const final_qty = Number(spare.stock_quantity) - Number(item.quantity);

        // Update stock in `csp_stock`
        const updateStockQuery = `
          UPDATE csp_stock 
          SET stock_quantity = @final_quantity 
          WHERE product_code = @spare_no AND csp_code = @licare_code
        `;
        request.input('final_quantity', sql.Int, final_qty);
        await request.query(updateStockQuery);
      }


    }

    // Commit transaction
    await transaction.commit();

    res.status(200).json({
      message: 'Data updated successfully',
      affectedRows: spareData.length,
    });
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    sql.close();
  }
});




app.post("/getselctedspare", authenticateToken, async (req, res) => {
  const { article_id } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
   SELECT sp.id, sp.ModelNumber, sp.title as article_code ,sp.ProductCode as spareId, sp.ItemDescription as article_description , spt.Price_group as price FROM Spare_parts as sp left join Spare_partprice as spt on sp.title = spt.Item  WHERE sp.deleted = 0 and  id = '${article_id}' 
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


app.post('/addgrnspares', authenticateToken, async (req, res) => {
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


    // Use a transaction for bulk inserts
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const bulkQuery = `
      INSERT INTO awt_cspgrnspare (grn_no, spare_no, spare_title, quantity, created_by, created_date)
      VALUES (@grn_no, @article_code, @article_title, @spare_qty, @created_by, @created_date)
    `;
    const Stockadd = `
      INSERT INTO csp_stock (csp_code,product_code, productname, stock_quantity, created_by, created_date)
      VALUES (@csp_code ,@product_code, @productname, @stock_quantity, @created_by, @created_date)
    `;

    const duplicateCheckQuery = `
      SELECT COUNT(*) as count
      FROM awt_cspgrnspare
      WHERE spare_no = @article_code_d AND grn_no = @grn_no_d
    `;
    const duplicatespareQuery = `
      SELECT COUNT(*) as count
      FROM awt_cspgrnspare
      WHERE spare_no = @article_code_d 
    `;

    let affectedRows = 0; // To count how many rows are actually inserted

    for (const item of spareData) {
      // Create a new request instance for each iteration to avoid reusing parameters
      const bulkRequest = new sql.Request(transaction);
      const bulkInstock = new sql.Request(transaction);

      // Check if the spare_id already exists in the table
      const duplicateCheck = await bulkRequest
        .input('article_code_d', sql.VarChar, item.article_code) // Renamed parameter
        .input('grn_no_d', sql.VarChar, item.grn_no) // Correct parameter names
        .query(duplicateCheckQuery);

      const duplicatespareCheck = await bulkInstock
        .input('article_code_d', sql.VarChar, item.article_code) // Renamed parameter
        .query(duplicatespareQuery);

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


      if (duplicatespareCheck.recordset[0].count === 0) {
        // If not a duplicate, insert the new record with correct parameters
        await bulkInstock
          .input('product_code', sql.VarChar, item.article_code) // Correct parameter names
          .input('productname', sql.VarChar, item.article_title) // 
          .input('csp_code', sql.VarChar, created_by) // Correct parameter names
          .input('stock_quantity', sql.Int, item.spare_qty)
          .input('created_by', sql.VarChar, item.created_by)
          .input('created_date', sql.DateTime, item.created_date)
          .query(Stockadd);





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
app.post('/addissuespares', authenticateToken, async (req, res) => {
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

  const { Issue_No, csp_code } = req.body;


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

app.post('/getissuedetails', authenticateToken, async (req, res) => {
  const { issue_no } = req.body;


  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `select * from awt_spareoutward where issue_no = '${issue_no}'`;

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
  const { grn_no, licare_code } = req.body;

  if (!grn_no) {
    return res.status(400).json({ message: "GRN number is required" });
  }

  try {
    const pool = await poolPromise;

    // Fetch spare data for the given GRN number
    const getgrnspareQuery = `SELECT spare_no, actual_received FROM awt_cspgrnspare WHERE grn_no = @grn_no`;
    const grnSpares = await pool.request()
      .input('grn_no', sql.VarChar, grn_no)
      .query(getgrnspareQuery);

    const spareresult = grnSpares.recordset;

    for (const item of spareresult) {
      // Fetch current stock for the spare
      const getPreviousStockQuery = `
        SELECT product_code, stock_quantity 
        FROM csp_stock 
        WHERE product_code = @spare_no and created_by = @licare_code
      `;
      const previousStockResult = await pool.request()
        .input('spare_no', sql.VarChar, item.spare_no)
        .input('licare_code', sql.VarChar, licare_code)
        .query(getPreviousStockQuery);

      if (previousStockResult.recordset.length > 0) {
        const { product_code, stock_quantity } = previousStockResult.recordset[0];
        const finalQty = Number(stock_quantity) + Number(item.actual_received);

        // Update the stock quantity
        const updateStockQuery = `
          UPDATE csp_stock
          SET stock_quantity = @finalQty
          WHERE product_code = @product_code and created_by = @licare_code
        `;
        await pool.request()
          .input('finalQty', sql.Int, finalQty)
          .input('product_code', sql.VarChar, product_code)
          .input('licare_code', sql.VarChar, licare_code)
          .query(updateStockQuery);
      }
    }

    // Update GRN master status
    const updateGrnMasterQuery = `
      UPDATE awt_grnmaster
      SET status = 1
      WHERE grn_no = @grn_no
    `;
    await pool.request()
      .input('grn_no', sql.VarChar, grn_no)
      .query(updateGrnMasterQuery);

    return res.json("Status Updated");
  } catch (err) {
    console.error("Error updating GRN status:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
});



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

app.post('/deletespareoutward', authenticateToken, async (req, res) => {

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

app.get("/getstock/:licare_code", authenticateToken, async (req, res) => {
  const { licare_code } = req.params
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM csp_stock WHERE deleted = 0 and csp_code = '${licare_code}'`);
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
app.get("/getengstock/:licare_code", authenticateToken, async (req, res) => {
  const { licare_code } = req.params
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM engineer_stock WHERE deleted = 0 and eng_code = '${licare_code}'`);
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.post("/getsearchengineer", authenticateToken, async (req, res) => {
  const { param } = req.body;

  if (!param) {
    return res.status(400).json({ message: "Invalid parameter" });
  }

  try {
    const pool = await poolPromise;

    // Parameterized query with a limit
    const sql = `
    SELECT TOP 20 engineer_id as id, title
    FROM awt_engineermaster
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

app.post("/getmodelno", authenticateToken, async (req, res) => {
  const { param } = req.body;

  console.log(param);
  if (!param) {
    return res.status(400).json({ message: "Invalid parameter" });
  }

  try {
    const pool = await poolPromise;

    const sql = `SELECT top 20 * FROM product_master WHERE item_description LIKE @param`;

    const result = await pool.request()
      .input("param", `%${param}%`)
      .query(sql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    console.log(result)

    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

app.get("/getsparelisting", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      item_code,
      ProductCode = "",
      ItemDescription = "",
      title = "",
      page = 1,
      pageSize = 10,

    } = req.query;

    // Debug log

    let sql = `
       SELECT s.* FROM Spare_parts as s WHERE s.ProductCode = ${item_code} AND s.deleted = 0
    `;

    // if (ProductCode) {
    //   sql += ` AND s.ProductCode LIKE '%${ProductCode}%'`;

    // }

    if (title) {
      sql += ` AND s.title LIKE '%${title}%'`;
    }

    if (ItemDescription) {
      sql += ` AND s.ItemDescription LIKE '%${ItemDescription}%'`;
    }

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY s.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // return res.json({sql:sql})
    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM Spare_parts WHERE ProductCode = ${item_code} AND deleted = 0`;
    if (ProductCode) countSql += ` AND ProductCode LIKE '%${ProductCode}%'`;
    if (ItemDescription) countSql += ` AND ItemDescription LIKE '%${ItemDescription}%'`;
    if (title) countSql += ` AND title LIKE '%${title}%'`;

    // return res.json({countSql:countSql})

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});



app.get("/getspareexcel", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const {
      page = 1,
      pageSize = 10,

    } = req.query;

    // Debug log

    let sql = `
       SELECT s.* FROM Spare_parts as s WHERE s.deleted = 0
    `;

    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY s.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // return res.json({sql:sql})
    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM Spare_parts WHERE deleted = 0`;

    // return res.json({countSql:countSql})

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while fetching the complaint list" });
  }
});








app.get("/getshipmentfg", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 50, // Default to 10 items per page if not provided
    } = req.query;

    let sql = `Select s.* from Shipment_Fg as s WHERE s.deleted = 0`
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY s.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM Shipment_Fg WHERE deleted = 0`;
    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;


    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});
app.get("/getshipmentparts", authenticateToken, async (req, res) => {
  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const {
      page = 1, // Default to page 1 if not provided
      pageSize = 50, // Default to 10 items per page if not provided
    } = req.query;

    let sql = `Select s.* from Shipment_Parts as s WHERE s.deleted = 0`
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;

    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY s.id OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    const result = await pool.request().query(sql);

    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM Shipment_Parts WHERE deleted = 0`;
    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.get("/getbussinesspartner", authenticateToken, async (req, res) => {
  try {
    const {
      Bp_code,
      partner_name,
      email,
      mobile_no,
      title,
      contact_person,
      address,
      webste,
      gstno,
      panno,
      bankname,
      bankacc,
      bankifsc,
      bankaddress,
      Licare_Ac_Id,
      licare_code,
      Vendor_Name,
      withliebher,
      lastworkingdate,
      contractactive,
      contractexpire,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const getcsp = `select * from lhi_user where Usercode = '${licare_code}'`


    const getcspresilt = await pool.request().query(getcsp)

    const assigncsp = getcspresilt.recordset[0] && getcspresilt.recordset[0].assigncsp

    // Directly use the query (no parameter binding)
    let sql = `SELECT q.* FROM bussiness_partner as q WHERE 1=1`;


    if (assigncsp !== 'ALL') {
      // Convert to an array and wrap each value in single quotes
      const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");

      // Directly inject the formatted values into the SQL query
      sql += ` AND q.csp_code IN (${formattedCspList})`;
    }


    if (Bp_code) {
      sql += ` AND q.Bp_code LIKE '%${Bp_code}%'`;
    }

    if (partner_name) {
      sql += ` AND q.partner_name LIKE '%${partner_name}%'`;
    }

    if (email) {
      sql += ` AND q.email LIKE '%${email}%'`;
    }

    if (mobile_no) {
      sql += ` AND q.mobile_no LIKE '%${mobile_no}%'`;
    }
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY q.Bp_code desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute the query
    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM bussiness_partner where deleted = 0 `;
    if (Bp_code) countSql += ` AND Bp_code LIKE '%${Bp_code}%'`;
    if (partner_name) countSql += ` AND partner_name LIKE '%${partner_name}%'`;
    if (email) countSql += ` AND email LIKE '%${email}%'`;
    if (mobile_no) countSql += ` AND mobile_no LIKE '%${mobile_no}%'`;



    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });


  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.get("/fetchfrommobile/:mobile", authenticateToken, async (req, res) => {
  try {

    let { mobile } = req.params;
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT TOP 1 ac.* , acl.address ,acl.pincode_id FROM awt_customer as ac left join awt_customerlocation as acl on ac.customer_id = acl.customer_id WHERE ac.deleted = 0 and ac.mobileno = '${mobile}'`);

    // Convert result to string and encrypt it


    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// get masterWarrenty Data 
app.get("/getmasterwarrenty", authenticateToken, async (req, res) => {
  try {
    const {
      Service_Type,
      item_code,
      Product_Type,
      Product_Line,
      Product_Class,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    const pool = await poolPromise;

    // SQL query to fetch rate data where deleted is 0
    let sql = "SELECT m.* FROM Master_warrenty as m  WHERE deleted = 0";

    if (Service_Type) {
      sql += ` AND m.Service_Type LIKE '%${Service_Type}%'`;
    }

    if (item_code) {
      sql += ` AND m.item_code LIKE '%${item_code}%'`;
    }

    if (Product_Type) {
      sql += ` AND m.Product_Type LIKE '%${Product_Type}%'`;
    }

    if (Product_Line) {
      sql += ` AND m.Product_Line LIKE '%${Product_Line}%'`;
    }
    if (Product_Class) {
      sql += ` AND m.Product_Class LIKE '%${Product_Class}%'`;
    }

    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY m.id desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    const result = await pool.request().query(sql);
    let countSql = `SELECT COUNT(*) as totalCount FROM Master_warrenty where deleted = 0 `;
    if (Service_Type) countSql += ` AND Service_Type LIKE '%${Service_Type}%'`;
    if (item_code) countSql += ` AND item_code LIKE '%${item_code}%'`;
    if (Product_Type) countSql += ` AND Product_Type LIKE '%${Product_Type}%'`;
    if (Product_Line) countSql += ` AND Product_Line LIKE '%${Product_Line}%'`;
    if (Product_Class) countSql += ` AND Product_Class LIKE '%${Product_Class}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// Get PostSaleWarrenty Data
app.get("/getpostsalewarrenty", authenticateToken, async (req, res) => {
  try {
    const {
      ServiceType,
      item_code,
      Producttype,
      ProductLine,
      ProductClass,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    const pool = await poolPromise;

    // SQL query to fetch rate data where deleted is 0
    let sql = "SELECT p.* FROM post_sale_warrenty as p  WHERE deleted = 0";

    if (ServiceType) {
      sql += ` AND p.ServiceType LIKE '%${ServiceType}%'`;
    }

    if (item_code) {
      sql += ` AND p.item_code LIKE '%${item_code}%'`;
    }

    if (Producttype) {
      sql += ` AND p.Producttype LIKE '%${Producttype}%'`;
    }

    if (ProductLine) {
      sql += ` AND p.ProductLine LIKE '%${ProductLine}%'`;
    }
    if (ProductClass) {
      sql += ` AND p.ProductClass LIKE '%${ProductClass}%'`;
    }

    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY p.id desc OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    const result = await pool.request().query(sql);
    let countSql = `SELECT COUNT(*) as totalCount FROM post_sale_warrenty where deleted = 0 `;
    if (ServiceType) countSql += ` AND ServiceType LIKE '%${ServiceType}%'`;
    if (item_code) countSql += ` AND item_code LIKE '%${item_code}%'`;
    if (Producttype) countSql += ` AND Producttype LIKE '%${Producttype}%'`;
    if (ProductLine) countSql += ` AND ProductLine LIKE '%${ProductLine}%'`;
    if (ProductClass) countSql += ` AND ProductClass LIKE '%${ProductClass}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

// Get Msp users \
app.post('/getmspusers', authenticateToken, async (req, res) => {
  const { licare_code } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on `pageid` and `roleid`
    const query = `select * from awt_franchisemaster where licare_code = @licare_code`;

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




app.post('/updatewarrentystate', authenticateToken, async (req, res) => {
  const { warrenty, ticket_no } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on the `id`
    const query = `update complaint_ticket set warranty_status = '${warrenty}' where id = '${ticket_no}'`;

    const updateResult = await pool.request().query(query);

    if (updateResult.rowsAffected[0] > 0) {
      const getdata = `select warranty_status from complaint_ticket where id = '${ticket_no}'`

      const getresult = await pool.request().query(getdata);
      return res.json(getresult.recordset);
    } else {
      return res.json([])
    }



    // Return the fetched data
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});


app.post("/approvequotation", authenticateToken, async (req, res) => {
  const { Qno, data } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Begin transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Update quotation status
    const updateQuotationQuery = `
      UPDATE awt_quotation
      SET status = 'Approved'
      WHERE quotationNumber = @Qno`;

    await pool.request().input("Qno", sql.VarChar, Qno).query(updateQuotationQuery);

    // Update each spare item using for...in
    for (const index in data) {
      const item = data[index];
      const query = `
        UPDATE awt_uniquespare
        SET price = @Price, quantity = @Quantity
        WHERE id = @Id`;

      const request = new sql.Request(transaction);
      await request
        .input("Price", sql.VarChar, item.price)
        .input("Quantity", sql.VarChar, item.quantity)
        .input("Id", sql.Int, item.id)
        .query(query);
    }

    // Commit transaction
    await transaction.commit();
    res.status(200).json({ message: "Quotation approved successfully" });
  } catch (error) {
    // Rollback transaction on error
    res.status(500).json({ message: "Error updating quotation", error });
  }
});


app.post('/getcspformticket', authenticateToken, async (req, res) => {
  const { ticket_no } = req.body;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on the `id`
    const sql = `select acf.id ,acf.licare_code , acf.title as partner_name , acf.address , acf.mobile_no , acf.email from complaint_ticket as ct left join awt_childfranchisemaster as acf on acf.licare_code = ct.csp  where ct.ticket_no = '${ticket_no}' `;

    const result = await pool.request().query(sql);
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();

    return res.json({ encryptedData })


    // Return the fetched data
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});


app.get('/getdatafrompincode/:pincode', authenticateToken, async (req, res) => {
  const { pincode } = req.params;

  try {
    // Connect to the MSSQL database
    const pool = await poolPromise;

    // Query to fetch data based on the `id`
    const query = `select id , geocity_name as city , geostate_name as state ,region_name as region , area_name as district, pincode from awt_pincode  where pincode = '${pincode}'`;

    const Result = await pool.request().query(query);

    return res.json(Result.recordset)


    // Return the fetched data
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database query failed", details: err });
  }
});

// fetch pincode allocation Data 
app.get("/getpincodelist", authenticateToken, async (req, res) => {
  try {
    const {
      pincode,
      country,
      region,
      state,
      city,
      msp_name,
      csp_name,
      customer_classification,
      call_type,
      page = 1, // Default to page 1 if not provided
      pageSize = 10, // Default to 10 items per page if not provided
    } = req.query;
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Directly use the query (no parameter binding)
    let sql = `SELECT p.* FROM pincode_allocation as p WHERE 1=1`;

    if (pincode) {
      sql += ` AND p.pincode LIKE '%${pincode}%'`;
    }

    if (country) {
      sql += ` AND p.country LIKE '%${country}%'`;
    }

    if (region) {
      sql += ` AND p.region LIKE '%${region}%'`;
    }

    if (state) {
      sql += ` AND p.state LIKE '%${state}%'`;
    }

    if (city) {
      sql += ` AND p.city LIKE '%${city}%'`;
    }

    if (msp_name) {
      sql += ` AND p.msp_name LIKE '%${msp_name}%'`;
    }
    if (csp_name) {
      sql += ` AND p.csp_name LIKE '%${csp_name}%'`;
    }
    if (customer_classification) {
      sql += ` AND p.customer_classification LIKE '%${customer_classification}%'`;
    }
    if (call_type) {
      sql += ` AND p.call_type LIKE '%${call_type}%'`;
    }
    // Pagination logic: Calculate offset based on the page number
    const offset = (page - 1) * pageSize;
    // Add pagination to the SQL query (OFFSET and FETCH NEXT)
    sql += ` ORDER BY p.pincode  OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

    // Execute the query
    const result = await pool.request().query(sql);
    // Get the total count of records for pagination
    let countSql = `SELECT COUNT(*) as totalCount FROM pincode_allocation where 1=1 `;
    if (pincode) countSql += ` AND pincode LIKE '%${pincode}%'`;
    if (country) countSql += ` AND country LIKE '%${country}%'`;

    if (region) countSql += ` AND region LIKE '%${region}%'`;
    if (state) countSql += ` AND state LIKE '%${state}%'`;
    if (city) countSql += ` AND city LIKE '%${city}%'`;
    if (csp_name) countSql += ` AND csp_name LIKE '%${csp_name}%'`;
    if (msp_name) countSql += ` AND msp_name LIKE '%${msp_name}%'`;
    if (customer_classification) countSql += ` AND customer_classification LIKE '%${customer_classification}%'`;
    if (call_type) countSql += ` AND call_type LIKE '%${call_type}%'`;

    const countResult = await pool.request().query(countSql);
    const totalCount = countResult.recordset[0].totalCount;
    // Convert data to JSON string and encrypt it
    const jsonData = JSON.stringify(result.recordset);
    const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString();
    return res.json({
      encryptedData,
      totalCount: totalCount,
      page,
      pageSize,
    });


  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});


//MobApp  Start



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
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Token expires in 1 hour

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


    console.log(`SELECT t.*, c.alt_mobileno FROM ( SELECT * FROM complaint_ticket WHERE engineer_id LIKE '%${en_id}%' ) AS t LEFT JOIN awt_customer AS c ON t.customer_id = c.customer_id CROSS APPLY STRING_SPLIT(t.engineer_id, ',') AS split_values WHERE split_values.value = '${en_id}' ORDER BY t.id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;`);


    const result = await pool.request()
      .query(`SELECT t.*, c.alt_mobileno FROM ( SELECT * FROM complaint_ticket WHERE engineer_id LIKE '%${en_id}%' ) AS t LEFT JOIN awt_customer AS c ON t.customer_id = c.customer_id CROSS APPLY STRING_SPLIT(t.engineer_id, ',') AS split_values WHERE split_values.value = '${en_id}' ORDER BY t.id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;`);




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
  let { actioncode, service_charges, call_remark, call_status, call_type, causecode, other_charge, symptomcode, activitycode, com_id, warranty_status, spare_detail, ticket_no, user_id, serial_no, Model, sub_call_status, allocation, serial_data, picking_damages, product_damages, missing_part, leg_adjustment, water_connection, abnormal_noise, ventilation_top, ventilation_bottom, ventilation_back, voltage_supply, earthing, gas_charges, transpotation, purchase_date, otp, check_remark, customer_mobile, item_code } = req.body;




  const username = process.env.TATA_USER;
  const password = process.env.PASSWORD;


  const data_serial = JSON.parse(serial_data);

  let temp_id;
  let temp_msg;





  if (call_status == 'Approval') {
    temp_id = '1207173530799359858';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for quotation and will be processed once approved. For any query, please contact 7038100400`
  }
  if (call_status == 'Approval-Int') {
    temp_id = '1207173530799359858';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for quotation and will be processed once approved. For any query, please contact 7038100400`
  }
  else if (call_status == 'Spares') {
    temp_id = '1207173530641222930';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been raised for a spare request and will be processed shortly. For any query, please contact 7038100400`
  }
  else if (call_status == 'Completed') {
    temp_id = '1207173530028299875';
    temp_msg = `Dear Liebherr Customer, Ticket Number ${ticket_no} has been successfully completed. For future assistance, please contact 7038100400`
  }


  // const msg = encodeURIComponent(temp_msg);

  // const apiUrl = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${customer_mobile}&dr=false&msg=${msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=${temp_id}`;

  // const response = await axios.get(apiUrl, { httpsAgent }); 


  if (call_status == 'Completed') {
    sub_call_status = 'Partially'
  }
  else if (call_status == 'Spares') {
    sub_call_status = 'Spare Required'
  }
  else if (call_status == 'Approval') {
    sub_call_status = 'Customer Approval / Quotation'
  }
  else if (call_status == 'Approval-Int') {
    sub_call_status = 'Internal Approval'
    call_status = 'Approval'
  }


  const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


  const newdate = new Date();
  const closed_date = newdate.toISOString();


  const finalremark = [
    call_remark && call_remark !== 'undefined' ? `Remark: ${call_remark}` : '',
    check_remark && check_remark !== 'undefined' ? `Checklist Remark: ${check_remark}` : '',
    call_type && call_type !== 'undefined' ? `Call Type: ${call_type}` : '',
    `Warranty Status: ${warranty_status ? warranty_status : "NA"}`,
    call_status && call_status !== 'undefined' ? `Call Status: ${call_status}` : '',
    service_charges && service_charges !== 'undefined' ? `Price: ${service_charges}` : '',
    other_charge && other_charge !== 'undefined' ? `Other Charges: ${other_charge}` : '',
    serial_no && serial_no !== 'undefined' ? `Serial No: ${serial_no}` : '',
    Model && Model !== 'undefined' ? `Model Number: ${Model}` : '',
    purchase_date && purchase_date !== 'undefined' ? `purchase Date: ${purchase_date}` : '',
    call_status == 'Completed' ? `Feild Complete Date: ${closed_date}` : '',
  ].filter(Boolean).join(', ');




  const spareDoc = req.files['spare_doc'] ? req.files['spare_doc'][0].filename : null;
  const spareDocTwo = req.files['spare_doc_two'] ? req.files['spare_doc_two'][0].filename : null;
  const spareDocThree = req.files['spare_doc_three'] ? req.files['spare_doc_three'][0].filename : null;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('actioncode', sql.VarChar, actioncode != 'undefined' ? actioncode : '')
      .input('symptomcode', sql.VarChar, symptomcode != 'undefined' ? symptomcode : '')
      .input('causecode', sql.VarChar, causecode != 'undefined' ? causecode : '')
      .input('activitycode', sql.VarChar, activitycode != 'undefined' ? activitycode : '')
      .input('service_charges', sql.VarChar, service_charges != 'undefined' ? service_charges : null)
      .input('call_status', sql.VarChar, call_status != 'undefined' ? call_status : '')
      .input('sub_call_status', sql.VarChar, sub_call_status != 'undefined' ? sub_call_status : '')
      .input('other_charge', sql.VarChar, other_charge != 'undefined' ? other_charge : null)
      .input('warranty_status', sql.VarChar, warranty_status != 'undefined' ? warranty_status : null)
      .input('com_id', sql.VarChar, com_id != 'undefined' ? com_id : null)
      .input('spare_doc_path', sql.VarChar, spareDoc)
      .input('spare_detail', sql.VarChar, spare_detail != 'undefined' ? spare_detail : null)
      .input('serial_no', sql.VarChar, serial_no != 'undefined' ? serial_no : null)
      .input('ModelNumber', sql.VarChar, Model != 'undefined' ? Model : '')
      .input('purchase_date', sql.VarChar, purchase_date != 'undefined' ? purchase_date : '')
      .input('picking_damages', sql.VarChar, picking_damages)
      .input('product_damages', sql.VarChar, product_damages)
      .input('missing_part', sql.VarChar, missing_part)
      .input('leg_adjustment', sql.VarChar, leg_adjustment)
      .input('water_connection', sql.VarChar, water_connection)
      .input('abnormal_noise', sql.VarChar, abnormal_noise)
      .input('ventilation_top', sql.VarChar, ventilation_top)
      .input('ventilation_bottom', sql.VarChar, ventilation_bottom)
      .input('ventilation_back', sql.VarChar, ventilation_back)
      .input('voltage_supply', sql.VarChar, voltage_supply)
      .input('earthing', sql.VarChar, earthing)
      .input('gas_charges', sql.VarChar, gas_charges)
      .input('transpotation', sql.VarChar, transpotation)
      .input('item_code', item_code)
      .input('otp', sql.Int, Number(otp))
      .query('UPDATE complaint_ticket SET warranty_status = @warranty_status, group_code = @symptomcode, defect_type = @causecode, site_defect = @actioncode,activity_code = @activitycode,service_charges = @service_charges, call_status = @call_status,sub_call_status = @sub_call_status, other_charges = @other_charge, spare_doc_path = @spare_doc_path, spare_detail = @spare_detail , ModelNumber = @ModelNumber , serial_no = @serial_no ,picking_damages = @picking_damages,product_damages = @product_damages,missing_part = @missing_part,leg_adjustment = @leg_adjustment,water_connection = @water_connection, abnormal_noise = @abnormal_noise,ventilation_top = @ventilation_top,ventilation_bottom = @ventilation_bottom,ventilation_back = @ventilation_back,voltage_supply = @voltage_supply , earthing = @earthing ,gascheck = @gas_charges , transportcheck = @transpotation ,purchase_date = @purchase_date  , state_id = @otp , item_code = @item_code WHERE id = @com_id');

    // Check if any rows were updated

    const date = new Date()

    if (call_status == 'Completed') {

      const updatecloseddate = `update complaint_ticket set closed_date = '${closed_date}' where ticket_no ='${ticket_no}'`;

      await pool.request().query(updatecloseddate);
    }






    if (allocation == 'Available') {
      const {
        customer_id,
        customer_name,
        address,
        region,
        state,
        city,
        area,
        pincode,
        customer_class,
        purchase_date,
      } = data_serial;





      const insertQuery = `INSERT INTO awt_uniqueproductmaster (CustomerID, CustomerName, ModelNumber, serial_no, address, region, state, district, city, pincode, created_by, created_date, customer_classification , SerialStatus , purchase_date ,ModelName) VALUES (@CustomerID, @CustomerName, @ModelNumber, @SerialNo, @Address, @Region, @State, @District, @City, @Pincode, @CreatedBy, GETDATE(), @CustomerClassification , 'Active' , @PurchaseDate , @item_code);`;

      const result = await pool.request()
        .input('CustomerID', sql.VarChar, customer_id)
        .input('CustomerName', sql.VarChar, customer_name)
        .input('ModelNumber', sql.VarChar, Model)
        .input('SerialNo', sql.Int, serial_no)
        .input('Address', sql.VarChar, address)
        .input('Region', sql.VarChar, region)
        .input('State', sql.VarChar, state)
        .input('District', sql.VarChar, area) // Assuming area is district
        .input('City', sql.VarChar, city)
        .input('Pincode', sql.VarChar, pincode)
        .input('PurchaseDate', sql.VarChar, purchase_date)
        .input('CreatedBy', sql.VarChar, user_id) // Example for created_by
        .input('CustomerClassification', sql.VarChar, customer_class)
        .input('item_code', item_code)
        .query(insertQuery)


    }

    if (result.rowsAffected[0] > 0) {


      const concheck = `Checklist Remark: ${check_remark}`


      const updatecheckremark = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by,updated_by,created_date)
      VALUES (@ticket_no_c, @remark_c, @created_by_c,@updated_by_c ,@created_date_c);
  `;

      await pool.request()
        .input('ticket_no_c', sql.VarChar, ticket_no)
        .input('remark_c', sql.VarChar, concheck)
        .input('created_by_c', sql.VarChar, user_id)
        .input('updated_by_c', sql.VarChar, 'Check')
        .input('created_date_c', sql.DateTime, date)
        .query(updatecheckremark);



      const updateremarkQuery = `
      INSERT INTO awt_complaintremark (ticket_no, remark, created_by,updated_by , created_date)
      VALUES (@ticket_no, @remark, @created_by,@updated_by, @created_date);
      SELECT SCOPE_IDENTITY() AS remark_id;
  `;

      const result = await pool.request()
        .input('ticket_no', sql.VarChar, ticket_no)
        .input('remark', sql.VarChar, finalremark)
        .input('created_by', sql.VarChar, user_id)
        .input('updated_by', sql.VarChar, 'Eng')
        .input('created_date', sql.DateTime, date)
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


app.get("/getSpareParts_app/:item_code", authenticateToken, async (req, res) => {

  const { item_code } = req.params;

  try {
    const pool = await poolPromise;
    const sql = `
        SELECT sp.id, 
       sp.ModelNumber, 
       sp.title as article_code,
       sp.ProductCode as spareId, 
       sp.ItemDescription as article_description, 
       spt.MRPQuotation as price
FROM Spare_parts as sp 
LEFT JOIN priceGroup as spt ON sp.PriceGroup = spt.PriceGroup
WHERE sp.deleted = 0 and ProductCode = @item_code
        `;

    const result = await pool.request()
      .input("item_code", item_code) // Specify the data type for the parameter
      .query(sql);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred", details: err.message });
  }
});


app.post("/addspareapp", authenticateToken, async (req, res) => {
  const { ItemDescription, title, product_code, ticket_no, spare_qty, price } = req.body;

  try {
    const pool = await poolPromise;

    // Check if a record with the same ticketId already exists
    const checkDuplicateQuery = `SELECT * FROM awt_uniquespare WHERE ticketId = '${ticket_no}' AND article_code = '${title}'`;
    const duplicateResult = await pool.request().query(checkDuplicateQuery);

    if (duplicateResult.recordset.length > 0) {
      // If the record exists, update the spare_qty
      const updateSpareQuery = `
        UPDATE awt_uniquespare
        SET spareId = '${product_code}', article_code = '${title}', 
            article_description = '${ItemDescription}', quantity = '${spare_qty}' , deleted = 0
        WHERE ticketId = '${ticket_no}' and article_code = '${title}'`;
      await pool.request().query(updateSpareQuery);
      return res.json({ message: 'Quantity updated for existing ticket' });
    } else {
      // If the record does not exist, insert a new record
      const addSpareQuery = `
        INSERT INTO awt_uniquespare (ticketId, spareId, article_code, article_description, quantity , price)
        VALUES ('${ticket_no}', '${product_code}', '${title}', '${ItemDescription}','${spare_qty}' , '${price}')`;
      await pool.request().query(addSpareQuery);
      return res.json({ message: 'New spare added successfully' });
    }
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

// Mobapp End

app.post("/getcspdetails", authenticateToken, async (req, res) => {

  let { licare_code } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `select * from awt_childfranchisemaster where licare_code = '${licare_code}' and deleted = 0`;

    const result = await pool.request().query(sql);



    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

app.post("/updatevisitcount", authenticateToken, async (req, res) => {

  let { count, ticket_no } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `update complaint_ticket set visit_count = '${count}' where ticket_no = '${ticket_no}'`;

    const result = await pool.request().query(sql);



    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});


// app.post("/getServiceCharges", authenticateToken, async (req, res) => {

//   let { ModelNumber } = req.body;

//   try {
//     // Use the poolPromise to get the connection pool
//     const pool = await poolPromise;

//     const sql = `SELECT top 1 p.item_code, m.warrenty_year, m.compressor_warrenty, m.warrenty_amount FROM product_master as p 
// LEFT JOIN Master_warrenty as m on m.product_line = p.productLine
// where p.item_description = '${ModelNumber}'`;

//     const result = await pool.request().query(sql);


//     return res.json(result.recordset);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json(err);
//   }
// });

app.post("/getServiceCharges", authenticateToken, async (req, res) => {

  let { ModelNumber, warrenty_status } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const sql = `select top 1 id, productType ,  productLine , productClass from product_master where item_description = '${ModelNumber}'`;

    const result = await pool.request().query(sql);


    if (result.recordset.length > 0) {

      const productType = result.recordset[0].productType
      const productclass = result.recordset[0].productClass
      const productLine = result.recordset[0].productLine


      const getprice = `select * from post_sale_warrenty where ProductClass = '${productclass}' and ProductLine = '${productLine}' and Producttype = '${productType}' and ServiceType = '${warrenty_status}'`;

      console.log(getprice)


      const getresult = await pool.request().query(getprice);

      return res.json(getresult.recordset);
    } else {
      return res.json('No price available')
    }


  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

app.post("/adduniqueengineer", authenticateToken, async (req, res) => {
  const { title, engineer_id, employee_code, created_by, complaintid } = req.body;

  const created_date = new Date();

  try {
    const pool = await poolPromise;

    // Use a MERGE query for upsert logic
    const sql = `
      MERGE awt_uniqueengineer AS target
      USING (SELECT @ticket_no AS ticket_no, @engineer_id AS engineer_id) AS source
      ON (target.ticket_no = source.ticket_no AND target.engineer_id = source.engineer_id)
      WHEN MATCHED THEN 
        UPDATE SET title = @title, employee_code = @employee_code, created_date = @created_date, created_by = @created_by ,deleted = '0'
      WHEN NOT MATCHED THEN
        INSERT (ticket_no, title, engineer_id, employee_code, created_date, created_by)
        VALUES (@ticket_no, @title, @engineer_id, @employee_code, @created_date, @created_by);
    `;

    const result = await pool
      .request()
      .input("ticket_no", complaintid)
      .input("title", title)
      .input("engineer_id", engineer_id)
      .input("employee_code", employee_code)
      .input("created_date", created_date)
      .input("created_by", created_by)
      .query(sql);

    // Return a success response
    return res.json({ message: "Operation completed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/getengineerremark", authenticateToken, async (req, res) => {

  let { ticket_no } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    const Remark = `select top 1 *  from awt_complaintremark where ticket_no = '${ticket_no}' and updated_by = 'Eng' order by id desc`;

    const CheckRemark = `select top 1 * from awt_complaintremark where ticket_no = '${ticket_no}' and updated_by = 'Check' order by id desc`;

    const result = await pool.request().query(Remark);
    const result2 = await pool.request().query(CheckRemark);


    return res.json({ remark: result.recordset[0], checkremark: result2.recordset[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});





app.get("/getsmsapi", async (req, res) => {
  const ticket_no = 'SH234';
  const otp = '1234';
  const mobile = '9326476448';

  const username = process.env.TATA_USER;
  const password = process.env.PASSWORD;

  const encrypt = (data) => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  };

  // Encrypt each part
  // const encryptedEmail = encrypt(customer_email);
  // const encryptedTicket = encrypt(ticket_no);
  // const encryptedCustomerId = encrypt(customer_id);




  //     // Build the URL-safe message
  //     const encryptedPath = `${encodeURIComponent(encryptedEmail)}/${encodeURIComponent(encryptedTicket)}/${encodeURIComponent(encryptedCustomerId)}`;

  const npilink = 'https://test-licare.liebherr.com';

  const npsmsg = `Dear Customer, Your feedback helps us grow. Please rate us in survey: https://licare.liebherr.com/feedbackid/id=?BH0425-0028. Thanks for choosing Liebherr.`;


  const nps_msg = encodeURIComponent(npsmsg);


  const npsapiUrl = `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${mobile}&dr=false&msg=${nps_msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=1207173855461934489`;

  console.log(npsapiUrl)
  await axios.get(npsapiUrl, { httpsAgent });




  try {
    const response = await axios.get(npsapiUrl, { httpsAgent });
    if (response.data) {
      return res.json({ message: "Success", data: response.data });
    }
  } catch (error) {
    console.error('Error hitting SMS API:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to send SMS', error: error.message });
  }
});

// FETCH ANNEXTURE DATA 

app.post("/getannexturedata", authenticateToken, async (req, res) => {
  const { startDate, endDate, msp } = req.body;

  try {
    const pool = await poolPromise;

    let sql = `SELECT id, ticket_no, created_date, ticket_type, customer_id, customer_name, state, 
                      pincode,call_status,mother_branch, msp, sevice_partner, csp, child_service_partner,customer_class,
                      ModelNumber, serial_no, invoice_date, warranty_status,closed_date,sales_partner, assigned_to, 
                      class_city,visit_count,gas_charges,transport_charge,service_charges
               FROM complaint_ticket 
               WHERE deleted = 0 
               AND ticket_date >= @startDate 
               AND ticket_date <= @endDate`;

    if (msp) {
      sql += " AND msp = @msp"; // Add MSP filter if selected
    }

    const request = pool.request();
    request.input("startDate", startDate);
    request.input("endDate", endDate);
    if (msp) request.input("msp", msp);

    const result = await request.query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/transferproduct", authenticateToken, async (req, res) => {
  const { serial_no, customer_id, Modelno, product_id, newaddress, ItemNumber } = req.body;

  try {
    const pool = await poolPromise;

    // First, update SerialStatus to 'Inactive'
    const updateResult = await pool.request()
      .input("product_id", product_id)
      .query(`UPDATE awt_uniqueproductmaster SET SerialStatus = 'Inactive' WHERE id = @product_id`);


    const getaddress = `select act.* , ac.customer_fname , ac.customer_classification from awt_customerlocation as act left join awt_customer as ac on ac.customer_id = act.customer_id where act.id = '${newaddress}'`

    const getaddressresult = await pool.request().query(getaddress)

    if (getaddressresult.recordset.length > 0) {

      let { address, region_id, geostate_id, geocity_id, district_id, pincode_id, customer_fname, customer_classification } = getaddressresult.recordset[0];


      const insertquery = `insert into awt_uniqueproductmaster(CustomerID , CustomerName ,ModelNumber , serial_no ,address , region , state ,district , city , pincode , SerialStatus ,customer_classification , ModelName) values (@customer_id,@customer_fname,@Modelno,@serial_no,@address,@region_id,@geostate_id,@district_id,@geocity_id,@pincode_id,@status,@customer_classification , @item_code)`

      const insertproduct = await pool.request()
        .input('customer_id', customer_id)
        .input('customer_fname', customer_fname)
        .input('Modelno', Modelno)
        .input('serial_no', serial_no)
        .input('address', address)
        .input('region_id', region_id)
        .input('geostate_id', geostate_id)
        .input('district_id', district_id)
        .input('geocity_id', geocity_id)
        .input('pincode_id', pincode_id)
        .input('status', 'Active')
        .input('customer_classification', customer_classification)
        .input('item_code', ItemNumber)
        .query(insertquery)


      return res.json(insertproduct)
    }

    return res.status(200).json({ message: "Product status updated successfully", result: updateResult.recordset });

  } catch (err) {
    console.error("Error during transfer:", err);
    return res.status(500).json({ error: "An error occurred while updating product status" });
  }
});



// get msp for annexture data

// app.post("/getmsplist", authenticateToken, async (req, res) => {
//   try {
//     const { licare_code } = req.body;
//     const pool = await poolPromise;

//     const getcsp = `SELECT * FROM lhi_user WHERE Usercode = @licare_code`;
//     const getcspResult = await pool.request()
//       .input("licare_code", sql.VarChar, licare_code)
//       .query(getcsp);

//     if (getcspResult.recordset.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const assigncsp = getcspResult.recordset[0].assigncsp;
//     let sqlQuery = `
//       SELECT DISTINCT ct.msp, mf.title 
//       FROM complaint_ticket ct
//       JOIN awt_franchisemaster mf ON ct.msp = mf.licarecode
//       WHERE ct.msp IS NOT NULL
//     `;

//     if (assigncsp != "ALL") {
//       // Securely format CSP list
//       const formattedCspList = assigncsp.split(",").map(csp => `'${csp.trim()}'`).join(",");
//       sqlQuery += ` AND mf.licarecode IN (${formattedCspList})`;
//     }

//     sqlQuery += ` ORDER BY mf.title`;

//     console.log(sqlQuery)

//     const result = await pool.request().query(  sqlQuery);
//     return res.json(result.recordset);
//   } catch (err) {
//     console.error("Database Error:", err);
//     return res.status(500).json({ error: "Failed to fetch MSPs", details: err.message });
//   }
// });

// Fetch MSP list from awt_franchisemaster
app.post("/getmsplist", authenticateToken, async (req, res) => {


  try {
    const pool = await poolPromise;
    const sql = `
      SELECT DISTINCT ct.msp, mf.title 
      FROM complaint_ticket ct
      JOIN awt_franchisemaster mf ON ct.msp = mf.licarecode
      WHERE ct.msp IS NOT NULL
      ORDER BY mf.title`;

    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Failed to fetch MSPs", details: err.message });
  }
});

app.post("/getannexturereport", authenticateToken, async (req, res) => {
  const { startDate, endDate, msp } = req.body;

  try {
    const pool = await poolPromise;

    let sql = `
      SELECT ct.id, ct.ticket_no, ct.created_date, ct.ticket_type, ct.customer_id, ct.customer_name, ct.state, 
             ct.pincode, ct.call_status, ct.mother_branch, ct.msp, ct.sevice_partner, ct.csp, 
             ct.child_service_partner, ct.customer_class, ct.ModelNumber, ct.serial_no, ct.invoice_date, 
             ct.warranty_status, ct.closed_date, ct.sales_partner, ct.assigned_to, ct.class_city, 
             ct.visit_count, ct.gas_charges, ct.transport_charge, ct.service_charges,
             aus.ticketId, aus.quantity, aus.article_description,aus.price, 
             pm.PriceGroup,
            (COALESCE(TRY_CAST(aus.price AS INT), 0) * COALESCE(TRY_CAST(aus.quantity AS INT), 0)) AS total_cost
      FROM complaint_ticket ct    
      LEFT JOIN awt_uniquespare aus ON ct.ticket_no = aus.ticketId
      LEFT JOIN Spare_parts pm ON ct.ModelNumber = pm.ModelNumber
      WHERE ct.deleted = 0 
      AND ct.ticket_date >= @startDate 
      AND ct.ticket_date <= @endDate`;

    if (msp) {
      sql += " AND ct.msp = @msp"; // Add MSP filter if selected
    }

    const request = pool.request();
    request.input("startDate", startDate);
    request.input("endDate", endDate);
    if (msp) request.input("msp", msp);

    const result = await request.query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "An error occurred while fetching data", details: err.message });
  }
});


app.post("/updateserialno", authenticateToken, async (req, res) => {

  let { serial,
    ticket_no,
    modelnumber,
    customer_id,
    customer_name,
    address,
    region,
    state,
    city,
    area,
    pincode,
    customer_class,
    purchase_date,
    created_by,
    item_code } = req.body;

  try {
    const pool = await poolPromise;
    const sql = `update complaint_ticket set serial_no = '${serial}' , ModelNumber = '${modelnumber}' , item_code = '${item_code}'   where ticket_no = '${ticket_no}'`;

    const result = await pool.request().query(sql);



    const insertQuery = `INSERT INTO awt_uniqueproductmaster (CustomerID, CustomerName, ModelNumber, serial_no, address, region, state, district, city, pincode, created_by, created_date, customer_classification,SerialStatus,purchase_date,ModelName) VALUES (@CustomerID, @CustomerName, @ModelNumber, @SerialNo, @Address, @Region, @State, @District, @City, @Pincode, @CreatedBy, GETDATE(), @CustomerClassification , 'Active' , @PurchaseDate ,@item_code);`;

    await pool.request()
      .input('CustomerID', customer_id)
      .input('CustomerName', customer_name)
      .input('ModelNumber', modelnumber)
      .input('SerialNo', serial)
      .input('Address', address)
      .input('Region', region)
      .input('State', state)
      .input('District', area) // Assuming area is district
      .input('City', city)
      .input('Pincode', pincode)
      .input('CreatedBy', created_by)
      .input('CustomerClassification', customer_class)
      .input('PurchaseDate', purchase_date)
      .input('item_code', item_code)
      .query(insertQuery)


    return res.json(result.recordset);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Failed to fetch MSPs", details: err.message });
  }
});


app.post("/updatepurchasedate", authenticateToken, async (req, res) => {

  let { ticket_no, warrenty_status, purchase_date } = req.body;

  try {
    const pool = await poolPromise;
    const sql = `update complaint_ticket set purchase_date = '${purchase_date}' , warranty_status = '${warrenty_status}'   where ticket_no = '${ticket_no}'`;

    const result = await pool.request().query(sql);
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Failed to fetch MSPs", details: err.message });
  }
});

app.post("/resend_otp", authenticateToken, async (req, res) => {

  let { ticket_no, customer_mobile } = req.body;

  console.log(req.body)


  const otp = Math.floor(1000 + Math.random() * 9000);

  try {
    const pool = await poolPromise;
    const sql = `update complaint_ticket set totp = '${otp}'  where ticket_no = '${ticket_no}'`;
    const result = await pool.request().query(sql);


    if (1 == 1) {

      const username = process.env.TATA_USER;
      const password = process.env.PASSWORD;
      const temp_id = '1207173530305447084'

      try {

        const msg = encodeURIComponent(
          `Dear Customer, Greetings from Liebherr! Your Ticket Number is ${ticket_no}. Please share OTP ${otp} with the engineer once the ticket is resolved.`
        );

        const res = await axios.get(
          `https://smsgw.tatatel.co.in:9095/campaignService/campaigns/qs?recipient=${customer_mobile}&dr=false&msg=${msg}&user=${username}&pswd=${password}&sender=LICARE&PE_ID=1201159257274643113&Template_ID=${temp_id}`
        );


        console.log(res)




      } catch (error) {
        console.error('Error hitting SMS API (token):', error.response?.data || error.message);
      }

    }
    return res.json(result.recordset);
  } catch (err) {
    console.error("Database Error:", err);
    return res.status(500).json({ error: "Failed to fetch MSPs", details: err.message });
  }
});

//For data migration

app.post('/uploadtickets', authenticateToken, async (req, res) => {
  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);



  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {

      console.log(excelData)
      try {
        await pool.request()
          .input('ticket_no', sql.VarChar, item.ticket_no)
          .input('ticket_date', sql.DateTime, item.ticket_date || null)
          .input('customer_id', sql.VarChar, item.customer_id)
          .input('salutation', sql.VarChar, item.salutation)
          .input('customer_name', sql.VarChar, item.customer_name)
          .input('alt_mobile', sql.VarChar, item.alt_mobile)
          .input('customer_mobile', sql.VarChar, item.customer_mobile)
          .input('customer_email', sql.VarChar, item.customer_email)
          .input('ModelNumber', sql.VarChar, item.ModelNumber)
          .input('serial_no', Number(item.serial_no))
          .input('address', sql.VarChar, item.address)
          .input('region', sql.VarChar, item.region)
          .input('state', sql.VarChar, item.state)
          .input('city', sql.VarChar, item.city)
          .input('area', sql.VarChar, item.area)
          .input('pincode', sql.VarChar, item.pincode)
          .input('child_service_partner', sql.VarChar, item.child_service_partner)
          .input('sevice_partner', sql.VarChar, item.sevice_partner)
          .input('msp', sql.VarChar, item.msp)
          .input('csp', sql.VarChar, item.csp)
          .input('sales_partner', sql.VarChar, item.sales_partner)
          .input('assigned_to', sql.VarChar, item.assigned_to)
          .input('old_engineer', sql.VarChar, item.old_engineer)
          .input('engineer_code', sql.VarChar, item.engineer_code)
          .input('engineer_id', sql.VarChar, item.engineer_id)
          .input('ticket_type', sql.VarChar, item.ticket_type)
          .input('call_type', sql.VarChar, item.call_type)
          .input('sub_call_status', sql.VarChar, item.sub_call_status)
          .input('call_status', sql.VarChar, item.call_status)
          .input('symptom_code', sql.VarChar, item.symptom_code)
          .input('cause_code', sql.VarChar, item.cause_code)
          .input('action_code', sql.VarChar, item.action_code)
          .input('service_charges', sql.VarChar, item.service_charges)
          .input('other_charges', sql.VarChar, item.other_charges)
          .input('warranty_status', sql.VarChar, item.warranty_status)
          .input('invoice_date', sql.DateTime, item.invoice_date || null)
          .input('call_charges', sql.VarChar, item.call_charges)
          .input('mode_of_contact', sql.VarChar, item.mode_of_contact)
          .input('created_date', sql.DateTime, item.created_date || null)
          .input('created_by', sql.VarChar, item.created_by)
          .input('deleted', Number(item.deleted) || 0)
          .input('updated_by', sql.VarChar, item.updated_by)
          .input('updated_date', sql.VarChar, item.updated_date || null)
          .input('contact_person', sql.VarChar, item.contact_person)
          .input('purchase_date', sql.VarChar, item.purchase_date || null)
          .input('specification', sql.VarChar, item.specification)
          .input('ageing', Number(item.ageing))
          .input('area_id', Number(item.area_id))
          .input('state_id', Number(item.state_id))
          .input('city_id', Number(item.city_id))
          .input('pincode_id', Number(item.pincode_id))
          .input('closed_date', sql.DateTime, item.closed_date || null)
          .input('customer_class', sql.VarChar, item.customer_class)
          .input('call_priority', sql.VarChar, item.call_priority)
          .input('spare_doc_path', sql.VarChar, item.spare_doc_path)
          .input('call_remark', sql.Text, item.call_remark)
          .input('spare_detail', sql.VarChar, item.spare_detail)
          .input('group_code', sql.VarChar, item.group_code)
          .input('defect_type', sql.VarChar, item.defect_type)
          .input('site_defect', sql.VarChar, item.site_defect)
          .input('activity_code', sql.VarChar, item.activity_code)
          .input('spare_part_id', sql.VarChar, item.spare_part_id)
          .input('totp', sql.VarChar, item.totp)
          .input('requested_by', sql.VarChar, item.requested_by)
          .input('requested_email', sql.VarChar, item.requested_email)
          .input('requested_mobile', sql.VarChar, item.requested_mobile)
          .input('sales_partner2', sql.VarChar, item.sales_partner2)
          .input('mwhatsapp', Number(item.mwhatsapp))
          .input('awhatsapp', Number(item.awhatsapp))
          .query(`
          INSERT INTO complaint_ticket  (
            ticket_no, ticket_date, customer_id, salutation, customer_name, alt_mobile, customer_mobile, customer_email, ModelNumber, serial_no, 
            address, region, state, city, area, pincode,sevice_partner,child_service_partner, msp, csp, sales_partner, assigned_to,  
            engineer_code, engineer_id, ticket_type, call_type, sub_call_status, call_status, symptom_code, cause_code, action_code, service_charges, 
            other_charges, warranty_status, invoice_date, call_charges, mode_of_contact, created_date, created_by, deleted, updated_by, updated_date, 
            contact_person, purchase_date, specification, ageing, area_id, state_id, city_id, pincode_id, closed_date, customer_class, call_priority, 
            spare_doc_path, call_remark, spare_detail, group_code, defect_type, site_defect, activity_code, spare_part_id, totp, requested_by, 
            requested_email, requested_mobile, sales_partner2, mwhatsapp, awhatsapp
          ) 
          VALUES (
            @ticket_no, @ticket_date, @customer_id, @salutation, @customer_name, @alt_mobile, @customer_mobile, @customer_email, @ModelNumber, @serial_no, 
            @address, @region, @state, @city, @area, @pincode, @sevice_partner,@child_service_partner, @msp, @csp, @sales_partner, @assigned_to, 
             @engineer_code, @engineer_id, @ticket_type, @call_type, @sub_call_status, @call_status, @symptom_code, @cause_code, @action_code, 
            @service_charges, @other_charges, @warranty_status, @invoice_date, @call_charges, @mode_of_contact, @created_date, @created_by, @deleted, 
            @updated_by, @updated_date, @contact_person, @purchase_date, @specification, @ageing, @area_id, @state_id, @city_id, @pincode_id, @closed_date, 
            @customer_class, @call_priority, @spare_doc_path, @call_remark, @spare_detail, @group_code, @defect_type, @site_defect, @activity_code, 
            @spare_part_id, @totp, @requested_by, @requested_email, @requested_mobile, @sales_partner2, @mwhatsapp, @awhatsapp
          )
        `);


      } catch {
        console.log("err")
      }

    }



    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadmobile', authenticateToken, async (req, res) => {
  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);

  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {
      try {
        await pool.request()
          .input('ticket_no', sql.VarChar, item.ticket_no)
          .input('alt_mobile', sql.VarChar, item.alt_mobile)
          .input('customer_mobile', sql.VarChar, item.customer_mobile)
          .input('sevice_partner', sql.VarChar, item.sevice_partner)
          .query(`UPDATE complaint_ticket SET customer_mobile = @customer_mobile ,alt_mobile = @alt_mobile , sevice_partner = @sevice_partner WHERE ticket_no = @ticket_no`);
      } catch (error) {
        console.error("Error updating record:", error);
      }
    }

    return res.json({ message: 'Data updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while updating data' });
  }
});


app.post('/uploadremarks', authenticateToken, async (req, res) => {
  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);



  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {

      try {
        await pool.request()
          .input('ticket_no', sql.VarChar, item.ticket_no)
          .input('remark', sql.VarChar, item.remark)
          .input('created_date', sql.DateTime, item.created_date)
          .input('deleted', 0)
          .query(`
            INSERT INTO awt_complaintremark (
              ticket_no, remark, created_date, deleted
            ) 
            VALUES (
              @ticket_no, @remark, @created_date, @deleted
            )
          `);

      } catch (err) {
        console.log("err")
      }
    }

    return res.json({ message: 'Data insertion process completed. Check upload_log.txt for details.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadcustomer', authenticateToken, async (req, res) => {

  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);



  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {

      try {
        await pool.request()
          .input('customer_id', sql.VarChar, item.customer_id)
          .input('salutation', sql.VarChar, item.salutation)
          .input('customer_name', sql.VarChar, item.customer_name)
          .input('customer_type', sql.VarChar, item.customer_type)
          .input('customer_classification', sql.VarChar, item.customer_classification)
          .input('mobile_no', sql.VarChar, item.mobile_no)
          .input('m_whatsapp', sql.VarChar, item.m_whatsapp)
          .input('alternate_mobile', sql.VarChar, item.alternate_mobile)
          .input('a_whatsapp', sql.VarChar, item.a_whatsapp)
          .input('email', sql.VarChar, item.email)
          .input('date_of_birth', item.date_of_birth)
          .input('anniversary_date', item.anniversary_date)
          .query(`
            INSERT INTO awt_customer (
              customer_id, salutation, customer_fname, customer_type ,customer_classification,mobileno,m_whatsapp,alt_mobileno,a_whatsapp,email,dateofbirth,anniversary_date 
            ) 
            VALUES (
              @customer_id, @salutation, @customer_name, @customer_type ,@customer_classification,@mobile_no,@m_whatsapp,@alternate_mobile,@a_whatsapp,@email,@date_of_birth,@anniversary_date
            )
          `);


      } catch (err) {
        console.log(err)
      }
    }

    return res.json({ message: 'Data insertion process completed. Check customer_log.txt for details.' });

  } catch (err) {
    console.error(err);

    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadaddress', authenticateToken, async (req, res) => {

  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);



  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {

      try {
        await pool.request()
          .input('customer_id', sql.VarChar, item.customer_id)
          .input('address', sql.VarChar, item.address)
          .input('pincode_id', sql.VarChar, item.pincode_id)
          .input('geocity_id', sql.VarChar, item.geocity_id)
          .input('geostate_id', sql.VarChar, item.geostate_id)
          .input('district_id', sql.VarChar, item.district_id)
          .query(`
            INSERT INTO awt_customerlocation (
              customer_id, address, pincode_id, geocity_id ,geostate_id,district_id
            ) 
            VALUES (
              @customer_id, @address, @pincode_id, @geocity_id ,@geostate_id,@district_id
            )
          `);


      } catch (err) {
        console.log(err)
      }
    }

    return res.json({ message: 'Data insertion process completed. Check customer_log.txt for details.' });

  } catch (err) {
    console.error(err);

    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});


app.post('/uploadproduct', authenticateToken, async (req, res) => {

  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);



  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 6000000;

    for (const item of excelData) {

      try {
        await pool.request()
          .input('CustomerID', sql.VarChar, item.CustomerID)
          .input('CustomerName', sql.VarChar, item.CustomerName)
          .input('ModelNumber', sql.VarChar, item.ModelNumber)
          .input('serial_no', sql.VarChar, item.serial_no)
          .input('address', sql.VarChar, item.address)
          .input('pincode', sql.VarChar, item.pincode)
          .input('created_date', sql.VarChar, item.created_date)
          .input('purchase_date', sql.VarChar, item.purchase_date)
          .input('warrenty_sdate', sql.VarChar, item.warrenty_sdate)
          .input('warrenty_edate', sql.VarChar, item.warrenty_edate)
          .input('InvoiceDate', sql.VarChar, item.InvoiceDate)
          .input('InvoiceNumber', sql.VarChar, item.InvoiceNumber)
          .input('ModelName', sql.VarChar, item.ModelName)
          .input('Short_model_no', sql.VarChar, item.Short_model_no)
          .input('SerialStatus', sql.VarChar, item.SerialStatus)
          .input('Notes', sql.VarChar, item.Notes)
          .input('BranchName', sql.VarChar, item.BranchName)
          .input('CustomerAccountStatus', sql.VarChar, item.CustomerAccountStatus)
          .input('SalesDealer', sql.VarChar, item.SalesDealer)
          .input('SubDealer', sql.VarChar, item.SubDealer)
          .input('customer_classification', sql.VarChar, item.customer_classification)
          .query(`
            INSERT INTO awt_uniqueproductmaster (
              CustomerID, CustomerName, ModelNumber, serial_no ,address,pincode,created_date,purchase_date,warranty_sdate,warranty_edate,InvoiceDate,InvoiceNumber,ModelName,Short_model_no,SerialStatus,Notes,BranchName,CustomerAccountStatus,SalesDealer,SubDealer,customer_classification
            ) 
            VALUES (
              @CustomerID,@CustomerName,@ModelNumber,@serial_no ,@address,@pincode,@created_date,@purchase_date,@warrenty_sdate,@warrenty_edate,@InvoiceDate,@InvoiceNumber,@ModelName,@Short_model_no,@SerialStatus,@Notes,@BranchName,@CustomerAccountStatus,@SalesDealer,@SubDealer,@customer_classification
            )
          `);


      } catch (err) {
        console.log(err)
      }
    }


    return res.json({ message: 'Data insertion process completed. Check customerproduct_log.txt for details.' });

  } catch (err) {
    console.error(err);

    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});




const convertExcelDate = (excelDate) => {
  // Excel uses 1900-01-01 as the base date, so we create that as a JavaScript Date object
  const excelBaseDate = new Date(1900, 0, 1); // January 1, 1900
  // Excel date system has a bug where it treats 1900 as a leap year, so we adjust for that
  const adjustedExcelDate = excelDate - 2; // Adjust for the leap year bug in Excel

  // Convert the serial date to milliseconds and add it to the base date
  const date = new Date(excelBaseDate.getTime() + adjustedExcelDate * 24 * 60 * 60 * 1000);

  // Format the date as YYYY-MM-DD
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};


app.post('/uplaodratecardexcel', authenticateToken, async (req, res) => {
  let { excelData, created_by = "1" } = req.body;




  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;

    for (const item of excelData) {

      console.log(excelData)

      const result = await pool.request()
        .input('call_type', sql.VarChar, item.call_type)
        .input('sub_call_type', sql.VarChar, item.sub_call_type)
        .input('warranty_type', sql.VarChar, item.warranty_type)
        .input('item_code', sql.Int, item.item_code)
        .input('class_city', sql.VarChar, item.class_city)
        .input('engineer_level', sql.VarChar, item.engineer_level)
        .input('ProductType', sql.VarChar, item.ProductType)
        .input('ProductLine', sql.VarChar, item.ProductLine)
        .input('ProductClass', sql.VarChar, item.ProductClass)
        .input('Within24Hours', sql.Int, item["Within 24 Hours"])
        .input('Within48Hours', sql.Int, item["Within 48 Hours"])
        .input('Within96Hours', sql.Int, item["Within 96 Hours"])
        .input('MoreThan96Hours', sql.Int, item["> 96 Hours"])
        .input('gas_charging', sql.Int, item.gas_charging)
        .input('transportation', sql.Int, item.transportation)
        .input('csp_code', sql.VarChar, "A12334")
        .input('created_by', sql.VarChar, created_by)
        .input('created_date', sql.DateTime, new Date())
        .query(`
            INSERT INTO rate_card 
            (csp_code,call_type, sub_call_type, warranty_type, item_code, class_city, engineer_level, ProductType, ProductLine, ProductClass, Within_24_Hours, Within_48_Hours, Within_96_Hours, MoreThan96_Hours, gas_charging, transportation, created_by , created_date) 
            VALUES (
              @csp_code, 
              @call_type, 
              @sub_call_type, 
              @warranty_type, 
              @item_code, 
              @class_city, 
              @engineer_level, 
              @ProductType, 
              @ProductLine, 
              @ProductClass, 
              @Within24Hours, 
              @Within48Hours, 
              @Within96Hours, 
              @MoreThan96Hours, 
              @gas_charging, 
              @transportation,
              @created_by,
              @created_date

            )
          `);

      console.log(result, "$%%^^")
    }

    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadmasterwarrantyexcel', authenticateToken, async (req, res) => {
  let { excelData, created_by = "1" } = req.body;



  try {
    const pool = await poolPromise;

    // Set request timeout to handle large datasets
    pool.config.options.requestTimeout = 600000;



    // Loop through the rows and insert them
    for (const item of excelData) {

      console.log(item, "$$$");

      await pool.request()
        .input('item_code', sql.Int, item.item_code)
        .input('ProductType', sql.VarChar, item.ProductType)
        .input('ProductLine', sql.VarChar, item.ProductLine)
        .input('ProductClass', sql.VarChar, item.ProductClass)
        .input('ServiceType', sql.VarChar, item.ServiceType)
        .input('warranty_year', sql.Int, item.warranty_year)
        .input('compressor_warranty', sql.Int, item.compressor_warranty)
        .input('warranty_amount', sql.Int, item.warranty_amount)
        .input('is_scheme', sql.VarChar, item.is_scheme)
        .input('scheme_name', sql.VarChar, item.scheme_name)
        .input('scheme_startdate', sql.DateTime, item.scheme_startdate ? convertExcelDate(item.scheme_startdate) : null)
        .input('scheme_enddate', sql.DateTime, item.scheme_enddate ? convertExcelDate(item.scheme_enddate) : null)
        .input('csp_code', sql.VarChar, "NULL")
        .input('created_by', sql.VarChar, created_by)
        .input('created_date', sql.DateTime, new Date())
        .query(`
            INSERT INTO Master_warrenty 
            (csp_code,item_code, Product_Type, Product_Line, Product_Class, Service_Type, warrenty_year, compressor_warrenty, warrenty_amount, is_scheme, scheme_name, scheme_startdate, scheme_enddate , created_date, created_by) 
            VALUES 
            (@csp_code,@item_code, @ProductType, @ProductLine, @ProductClass, @ServiceType, @warranty_year, @compressor_warranty, @warranty_amount, @is_scheme, @scheme_name, @scheme_startdate, @scheme_enddate ,@created_date , @created_by)
          `);
    }

    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadpostwarrentyexcel', authenticateToken, async (req, res) => {
  let { excelData, created_by = "1" } = req.body;



  try {
    const pool = await poolPromise;

    // Set request timeout to handle large datasets
    pool.config.options.requestTimeout = 600000;

    // Loop through the rows and insert them into the database
    for (const item of excelData) {
      await pool.request()
        .input('item_code', sql.Int, item.item_code)
        .input('serial_no', sql.VarChar, item.serial_no)
        .input('customer_name', sql.VarChar, item.customer_name)
        .input('customer_email', sql.VarChar, item.customer_email)
        .input('customer_mobile', sql.VarChar, item.customer_mobile)
        .input('ProductType', sql.VarChar, item.ProductType)
        .input('ProductLine', sql.VarChar, item.ProductLine)
        .input('ProductClass', sql.VarChar, item.ProductClass)
        .input('ServiceType', sql.VarChar, item.ServiceType)
        .input('warranty_year', item.warranty_year ? item.warranty_year : null)
        .input('compressor_warranty', sql.Int, item.compressor_warranty)
        .input('warranty_amount', sql.Int, item.warranty_amount)
        .input('is_scheme', sql.VarChar, item.is_scheme)
        .input('scheme_name', sql.VarChar, item.scheme_name)
        .input('scheme_startdate', sql.DateTime, item.scheme_startdate ? convertExcelDate(item.scheme_startdate) : null)
        .input('scheme_enddate', sql.DateTime, item.scheme_enddate ? convertExcelDate(item.scheme_enddate) : null)
        .input('created_by', sql.VarChar, created_by)
        .input('created_date', sql.DateTime, new Date())
        .query(`
            INSERT INTO post_sale_warrenty
            (item_code, serial_no, customer_name, customer_email, customer_mobile, ProductType, ProductLine, 
            ProductClass, ServiceType, warranty_year, compressor_warranty, warranty_amount, 
            is_scheme, scheme_name, scheme_startdate, scheme_enddate, created_by ,created_date)
            VALUES
            (@item_code, @serial_no, @customer_name, @customer_email, @customer_mobile, @ProductType, @ProductLine, 
            @ProductClass, @ServiceType, @warranty_year, @compressor_warranty, @warranty_amount, 
            @is_scheme, @scheme_name, @scheme_startdate, @scheme_enddate, @created_by , @created_date)
          `);
    }

    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadpinexcel', authenticateToken, async (req, res) => {


  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);


  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;



    for (const item of excelData) {
      console.log(excelData)
      const result = await pool.request()
        .input('pincode', sql.Int, item.pin_code)
        .input('country', sql.VarChar, item.country)
        .input('region', sql.VarChar, item.region)
        .input('state', sql.VarChar, item.state)
        .input('city', sql.VarChar, item.city)
        .input('mother_branch', sql.VarChar, item.mother_branch)
        .input('resident_branch', sql.VarChar, item.resident_branch)
        .input('area_manager', sql.VarChar, item.area_manager)
        .input('local_manager', sql.VarChar, item.local_manager)
        .input('customer_classification', sql.VarChar, item.customer_classification)
        .input('class_city', sql.VarChar, item.class_of_city)
        .input('csp_name', sql.VarChar, item.child_service_partner_name)
        .input('msp_name', sql.VarChar, item.master_service_partner_name)
        .input('call_type', sql.VarChar, item.call_type)
        .input('msp_code', sql.Int, item.master_service_partner_code)
        .input('csp_code', item.child_service_partner_code)
        .input('producttype', item.producttype)
        .input('productline', item.productline)
        .query(`INSERT INTO pincode_allocation 
              (pincode, country, region, state, city, mother_branch, resident_branch, area_manager, local_manager, customer_classification, class_city, csp_name, msp_name, call_type, msp_code, csp_code,ProductType,ProductLine) 
              VALUES (
                @pincode, 
                @country, 
                @region, 
                @state, 
                @city, 
                @mother_branch, 
                @resident_branch, 
                @area_manager, 
                @local_manager, 
                @customer_classification, 
                @class_city, 
                @csp_name, 
                @msp_name, 
                @call_type,
                @msp_code,
                @csp_code,
                @producttype,
                @productline
              )

          `);
    }


    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});






app.post('/uploadspareexcel', async (req, res) => {
  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);

  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;

    // Truncate Spare_parts table before inserting new records
    // await pool.request().query("TRUNCATE TABLE Spare_parts");

    for (const item of excelData) {
      // Insert new record in Spare_parts table
      await pool.request()
        .input('ProductCode', sql.VarChar, item.ProductCode)
        .input('ModelNumber', sql.VarChar, item.ModelNumber)
        .input('title', sql.VarChar, item.title)
        .input('ItemDescription', sql.VarChar, item.ItemDescription)
        .input('Manufactured', sql.VarChar, item.Manufactured)
        .input('BOMQty', sql.VarChar, item.BOMQty)
        .input('PriceGroup', sql.VarChar, item.PriceGroup)
        .input('Status', sql.VarChar, item.Status)
        .input('ProductType', sql.VarChar, item.ProductType)
        .input('Model', sql.VarChar, item.Model)
        .input('Index1', sql.VarChar, item.Index1)
        .input('PartNature', sql.VarChar, item.PartNature)
        .input('Warranty', sql.VarChar, item.Warranty)
        .input('HSN', sql.VarChar, item.HSN)
        .input('Packed', sql.VarChar, item.Packed)
        .input('Returnable', sql.VarChar, item.Returnable)
        .input('ProductLine', sql.VarChar, item.ProductLine)
        .input('ProductClass', sql.VarChar, item.ProductClass)
        .input('Serialized', sql.VarChar, item.Serialized)
        .query(`
          INSERT INTO Spare_parts 
            (ProductCode, ModelNumber, title, ItemDescription, Manufactured, BOMQty, PriceGroup, Status, ProductType, Model, Index1, PartNature, Warranty, HSN, Packed, Returnable, ProductClass, ProductLine, Serialized) 
          VALUES (
            @ProductCode, 
            @ModelNumber, 
            @title, 
            @ItemDescription, 
            @Manufactured, 
            @BOMQty, 
            @PriceGroup, 
            @Status, 
            @ProductType, 
            @Model, 
            @Index1, 
            @PartNature, 
            @Warranty, 
            @HSN,
            @Packed,
            @Returnable,
            @ProductClass,
            @ProductLine,
            @Serialized
          )
        `);
    }

    return res.status(200).json({ message: 'Data processed successfully' });

  } catch (err) {
    console.error("Error inserting data:", err);
    return res.status(500).json({ error: 'An error occurred while processing data' });
  }
});

