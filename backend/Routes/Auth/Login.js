const express = require('express');
const router = express.Router();
const poolPromise = require('../../db');
const jwt = require("jsonwebtoken");



// Secret key for JWT
const JWT_SECRET = "Lh!_Login_123"; // Replace with a strong, secret key



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




router.post("/loginuser", async (req, res) => {


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




router.get("/protected-route", authenticateToken, (req, res) => {
    res.json({ message: "You have access", user: req.user });
});


module.exports = {
    router,
    authenticateToken,
};