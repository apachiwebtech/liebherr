const express = require('express');
const app = express.Router();
const poolPromise = require('../db');

//Country Master Start
app.get("/app", async (req, res) => {
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


module.exports = app;
