const express = require('express');
const app = express.Router();
const poolPromise = require('../../db');
const sql = require("mssql");
const CryptoJS = require('crypto-js');

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));


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


app.post('/uplaodratecardexcel', async (req, res) => {
  let { excelData, created_by = "1" } = req.body;

  excelData = JSON.parse(excelData)


  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;

    for (const item of excelData) {
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

app.post('/uploadmasterwarrantyexcel', async (req, res) => {
  let { excelData, created_by = "1" } = req.body;

  excelData = JSON.parse(excelData)

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
        .input('scheme_startdate', sql.DateTime, convertExcelDate(item.scheme_startdate))
        .input('scheme_enddate', sql.DateTime, convertExcelDate(item.scheme_enddate))
        .input('csp_code', sql.VarChar, "A12334")
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

app.post('/uploadpostwarrentyexcel', async (req, res) => {
  let { excelData, created_by = "1" } = req.body;

  // Parse the incoming JSON data for excelData
  excelData = JSON.parse(excelData);

  try {
    const pool = await poolPromise;

    // Set request timeout to handle large datasets
    pool.config.options.requestTimeout = 600000;

    // Loop through the rows and insert them into the database
    for (const item of excelData) {
      await pool.request()
        .input('item_code', sql.Int, item.item_code)
        .input('serial_no', sql.NVarChar, item.serial_no)
        .input('customer_name', sql.NVarChar, item.customer_name)
        .input('customer_email', sql.NVarChar, item.customer_email)
        .input('customer_mobile', sql.NVarChar, item.customer_mobile)
        .input('ProductType', sql.NVarChar, item.ProductType)
        .input('ProductLine', sql.NVarChar, item.ProductLine)
        .input('ProductClass', sql.NVarChar, item.ProductClass)
        .input('ServiceType', sql.NVarChar, item.ServiceType)
        .input('warranty_year', sql.Int, item.warranty_year)
        .input('compressor_warranty', sql.Int, item.compressor_warranty)
        .input('warranty_amount', sql.Int, item.warranty_amount)
        .input('is_scheme', sql.VarChar, item.is_scheme)
        .input('scheme_name', sql.NVarChar, item.scheme_name)
        .input('scheme_startdate', sql.DateTime, item.scheme_startdate ? convertExcelDate(item.scheme_startdate) : "")
        .input('scheme_enddate', sql.DateTime, item.scheme_enddate ? convertExcelDate(item.scheme_enddate) : "")
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

app.post('/uploadpinexcel', async (req, res) => {


  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);


  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;

    for (const item of excelData) {
      const result = await pool.request()
        .input('pincode', sql.Int, item.pincode)
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
        .query(`INSERT INTO pincode_allocation 
              (pincode, country, region, state, city, mother_branch, resident_branch, area_manager, local_manager, customer_classification, class_city, csp_name, msp_name, call_type, msp_code, csp_code) 
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
                @csp_code
              )

          `);
    }


    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});

app.post('/uploadtickets', async (req, res) => {
  let { jsonData } = req.body;
  let excelData = JSON.parse(jsonData);

  try {
    const pool = await poolPromise;
    pool.config.options.requestTimeout = 600000;

    for (const item of excelData) {
      await pool.request()
        .input('ticket_no', sql.VarChar, item.ticket_no)
        .input('ticket_date', sql.VarChar, item.ticket_date)
        .input('customer_id', sql.VarChar, item.customer_id)
        .input('salutation', sql.VarChar, item.salutation)
        .input('customer_name', sql.VarChar, item.customer_name)
        .input('alt_mobile', sql.VarChar, item.alt_mobile)
        .input('customer_mobile', sql.VarChar, item.customer_mobile)
        .input('customer_email', sql.VarChar, item.customer_email)
        .input('ModelNumber', sql.VarChar, item.ModelNumber)
        .input('serial_no', sql.Int, item.serial_no)
        .input('address', sql.VarChar, item.address)
        .input('region', sql.VarChar, item.region)
        .input('state', sql.VarChar, item.state)
        .input('city', sql.VarChar, item.city)
        .input('area', sql.VarChar, item.area)
        .input('pincode', sql.VarChar, item.pincode)
        .input('service_partner', sql.VarChar, item.service_partner)
        .input('child_service_partner', sql.VarChar, item.child_service_partner)
        .input('msp', sql.VarChar, item.msp)
        .input('csp', sql.VarChar, item.csp)
        .input('sales_partner', sql.VarChar, item.sales_partner)
        .input('assigned_to', sql.VarChar, item.assigned_to)
        .input('old_engineer', sql.VarBinary, item.old_engineer)
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
        .input('invoice_date', sql.VarChar, item.invoice_date)
        .input('call_charges', sql.VarChar, item.call_charges)
        .input('mode_of_contact', sql.VarChar, item.mode_of_contact)
        .input('created_date', sql.VarChar, item.created_date)
        .input('created_by', sql.VarChar, item.created_by)
        .input('deleted', sql.Int, item.deleted)
        .input('updated_by', sql.VarChar, item.updated_by)
        .input('updated_date', sql.DateTime, item.updated_date)
        .input('contact_person', sql.VarChar, item.contact_person)
        .input('purchase_date', sql.VarChar, item.purchase_date)
        .input('specification', sql.VarChar, item.specification)
        .input('ageing', sql.Int, item.ageing)
        .input('area_id', sql.Int, item.area_id)
        .input('state_id', sql.Int, item.state_id)
        .input('city_id', sql.Int, item.city_id)
        .input('pincode_id', sql.Int, item.pincode_id)
        .input('closed_date', sql.DateTime, item.closed_date)
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
        .input('mwhatsapp', sql.Int, item.mwhatsapp)
        .input('awhatsapp', sql.Int, item.awhatsapp)
        .query(`
          INSERT INTO pincode_allocation (
            ticket_no, ticket_date, customer_id, salutation, customer_name, alt_mobile, customer_mobile, customer_email, ModelNumber, serial_no, 
            address, region, state, city, area, pincode, service_partner, child_service_partner, msp, csp, sales_partner, assigned_to, old_engineer, 
            engineer_code, engineer_id, ticket_type, call_type, sub_call_status, call_status, symptom_code, cause_code, action_code, service_charges, 
            other_charges, warranty_status, invoice_date, call_charges, mode_of_contact, created_date, created_by, deleted, updated_by, updated_date, 
            contact_person, purchase_date, specification, ageing, area_id, state_id, city_id, pincode_id, closed_date, customer_class, call_priority, 
            spare_doc_path, call_remark, spare_detail, group_code, defect_type, site_defect, activity_code, spare_part_id, totp, requested_by, 
            requested_email, requested_mobile, sales_partner2, mwhatsapp, awhatsapp
          ) 
          VALUES (
            @ticket_no, @ticket_date, @customer_id, @salutation, @customer_name, @alt_mobile, @customer_mobile, @customer_email, @ModelNumber, @serial_no, 
            @address, @region, @state, @city, @area, @pincode, @service_partner, @child_service_partner, @msp, @csp, @sales_partner, @assigned_to, 
            @old_engineer, @engineer_code, @engineer_id, @ticket_type, @call_type, @sub_call_status, @call_status, @symptom_code, @cause_code, @action_code, 
            @service_charges, @other_charges, @warranty_status, @invoice_date, @call_charges, @mode_of_contact, @created_date, @created_by, @deleted, 
            @updated_by, @updated_date, @contact_person, @purchase_date, @specification, @ageing, @area_id, @state_id, @city_id, @pincode_id, @closed_date, 
            @customer_class, @call_priority, @spare_doc_path, @call_remark, @spare_detail, @group_code, @defect_type, @site_defect, @activity_code, 
            @spare_part_id, @totp, @requested_by, @requested_email, @requested_mobile, @sales_partner2, @mwhatsapp, @awhatsapp
          )
        `);
    }

    return res.json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while inserting data' });
  }
});










module.exports = app;