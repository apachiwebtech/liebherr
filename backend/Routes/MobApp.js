const express = require('express');
const app = express.Router();
const sql = require('mssql');
const poolPromise = require('../db');
const jwt = require("jsonwebtoken");
const multer = require('multer');
// const path = require('path');
const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = "Lh!_Login_123";



module.exports = app;
