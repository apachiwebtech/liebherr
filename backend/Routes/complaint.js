const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/ticket', (req,res) =>{

    const sql = "SELECT * FROM `complaint_ticket`"

    db.query(sql ,  (err,data) =>{
        if(err){
            return res.json(err)
        }else{
            return res.json(data)
        }
    })
})

module.exports = router