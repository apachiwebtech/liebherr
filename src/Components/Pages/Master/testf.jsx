app.post("/postcustomerlocation", (req, res) => {
  const { country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type } = req.body;

  // Check for duplicates
  const checkDuplicateSql = `SELECT * FROM awt_customerlocation WHERE ccnumber = ? AND deleted = 0`;
  con.query(checkDuplicateSql, [ccnumber],
    (err, data) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (data.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with same number already exists !",
      });
    } else {
      const sql = `INSERT INTO awt_customerlocation (country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      con.query(
        sql,
        [country_id, region_id, geostate_id, geocity_id, area_id, pincode_id,address,ccperson,ccnumber,address_type],
        (err, data) => {
          if (err) {
            return res.json(err);
          } else {
            return res.json({ message: "Customer Location added successfully!" });
          }
        }
      );
    }
  });
});


                    customer_fname: '',
                    customer_lname: '',
                    customer_type: '',
                    customer_classification: '',
                    mobileno: '',
                    alt_mobileno: '',
                    dateofbirth: '',
                    anniversary_date: '',
                    email: '',