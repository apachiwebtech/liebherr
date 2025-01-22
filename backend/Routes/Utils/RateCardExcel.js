const express = require('express');
const app = express.Router();
const poolPromise = require('../../db');
const sql = require("mssql");

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
    let { excelData ,created_by = "1" } = req.body;

    excelData = JSON.parse(excelData)

  
    try {
      const pool = await poolPromise;
      pool.config.options.requestTimeout = 600000; 
  
      for (const item of excelData) {
        const result =  await pool.request()
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

          console.log(result,"$%%^^")
      }
  
      return res.json({ message: 'Data inserted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while inserting data' });
    }
  });

  app.post('/uploadmasterwarrantyexcel', async (req, res) => {
    let { excelData ,created_by = "1"} = req.body;

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
          .input('scheme_startdate', sql.DateTime, item.scheme_startdate ?  convertExcelDate(item.scheme_startdate) : "")
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

  app.post('/uplaodpincodeexcel', async (req, res) => {
    let { excelData  } = req.body;

    excelData = JSON.parse(excelData)

  
    try {
      const pool = await poolPromise;
      pool.config.options.requestTimeout = 600000; 
  
      for (const item of excelData) {
        const result =  await pool.request()
          .input('pincode', sql.Int, item.pincode)
          .input('account_manager', sql.VarChar, item.account_manager)
          .input('owner', sql.VarChar, item.owner)
          .input('country', sql.VarChar, item.country)
          .input('region', sql.VarChar, item.region)
          .input('state', sql.VarChar, item.state)
          .input('city', sql.VarChar, item.city)
          .input('mother_branch', sql.VarChar, item.mother_branch)
          .input('resident_branch', sql.VarChar, item.resident_branch)
          .input('area_manager', sql.VarChar, item.area_manager)
          .input('local_manager', sql.VarChar, item.local_manager)
          .input('customer_classification', sql.VarChar, item.customer_classification)
          .input('class_city', sql.VarChar, item.class_city)
          .input('csp_name', sql.VarChar, item.csp_name)
          .input('msp_name', sql.VarChar, item.msp_name)
          .input('call_type', sql.VarChar, item.call_type)
          .input('ProductType', sql.VarChar, item.ProductType)
          .input('ProductLine', sql.VarChar, item.ProductLine)
          .input('msp_code', sql.VarChar, item.msp_code)
          .input('csp_code', sql.VarChar, item.csp_code)
          .query(`
            INSERT INTO pincode_allocation 
            (pincode, account_manager, owner, country, region, state, city, mother_branch, resident_branch, area_manager, local_manager, customer_classification, class_city, csp_name, msp_name, call_type, ProductType, ProductLine, msp_code, csp_code) 
            VALUES (
              @pincode, 
              @account_manager, 
              @owner, 
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
              @ProductType,
              @ProductLine,
              @msp_code,
              @csp_code
            )
          `);
          

          console.log(result,"$%%^^")
      }
  
      return res.json({ message: 'Data inserted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred while inserting data' });
    }
  });
  
  
  
  
  



module.exports = app;