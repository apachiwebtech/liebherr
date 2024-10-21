const express = require('express');
const router = express.Router();
const con = require('../db');

router.post('/getticket', (req, res) => {
    let { searchparam } = req.body;
    

    const sql = `
        SELECT * FROM complaint_ticket 
        WHERE deleted = 0 
        AND (customer_email LIKE ? OR customer_name LIKE ? OR customer_mobile LIKE ?)
    `;

    const searchValue = `%${searchparam}%`;



    con.query(sql, [searchValue, searchValue, searchValue], (err, data) => {
        if (err) {
            return res.json(err);
        } else {
            // console.log(data)
            return res.json(data);

        }
    });
});

module.exports = router;
