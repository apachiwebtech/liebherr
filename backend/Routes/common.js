const express = require('express');
const router = express.Router();
const con = require('../db');

router.get('/getstate-new', (req, res) => {
 
  const sql = "select id , region_id,title from awt_geostate where deleted = 0" 

  con.query(sql , (err,data) =>{
    if(err){
        return res.json(err)
    }else{
        return res.json(data)
    }
  })
});

router.get('/getproduct', (req, res) => {
 
  const sql = "select * from product_master " 

  con.query(sql , (err,data) =>{
    if(err){
        return res.json(err)
    }else{
        return res.json(data)
    }
  })
});




module.exports = router;
