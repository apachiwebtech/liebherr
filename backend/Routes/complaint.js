const express = require('express');
const router = express.Router();
const con = require('../db');

router.post('/getticket', (req, res) => {
    let { searchparam } = req.body;

    if(searchparam === "" ){
                
        return res.json([]);
    }


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

router.post('/add_complaint', (req, res) => {

    const date = new Date()



    let { complaint_date, customer_name, contact_person, email, mobile,  address, state, city, area, pincode, mode_of_contact, ticket_type, cust_type, warrenty_status, invoice_date, call_charge, cust_id, model } = req.body;



    const sql = "select * from complaint_ticket where deleted = 0"

    con.query(sql, (err, data) => {
        if (err) {
            return res.json(err)
        } else {

            const count = data.length + 1;

            const formatDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;


            const countFormat = count.toString().padStart(5, "0");

            const ticket_no = 'IG' + formatDate + "-" + countFormat



            const sql = "insert into complaint_ticket(`ticket_no`,`ticket_date`,`customer_name`,`customer_mobile`,`customer_email`,`address`,`state_id`,`city`,`area`,`pincode`,`customer_id`,`ModelNumber`,`ticket_type`,`call_type`,`call_status`,`warranty_status`,`invoice_date`,`call_charges`,`mode_of_contact`,`contact_person`,`created_date`,`created_by`)   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)";

            const param = [ticket_no,complaint_date, customer_name, mobile, email, address, state, city, area, pincode, cust_id, model, ticket_type, cust_type, "0", warrenty_status, invoice_date, call_charge, mode_of_contact,contact_person,date, "1"]


            con.query(sql, param, (err, data) => {
                if (err) {
                    return res.json(err);
                } else {
                    // console.log(data)
                    return res.json(data);

                }
            });



        }
    })







});



module.exports = router;
