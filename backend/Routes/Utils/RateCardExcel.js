const express = require('express');
const app = express.Router();
const poolPromise = require('../../db');
const sql = require("mssql");

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

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


// const convertExcelDate = (excelDate) => {
//   // Excel uses 1900-01-01 as the base date, so we create that as a JavaScript Date object
//   const excelBaseDate = new Date(1900, 0, 1); // January 1, 1900
//   // Excel date system has a bug where it treats 1900 as a leap year, so we adjust for that
//   const adjustedExcelDate = excelDate - 2; // Adjust for the leap year bug in Excel

//   // Convert the serial date to milliseconds and add it to the base date
//   const date = new Date(excelBaseDate.getTime() + adjustedExcelDate * 24 * 60 * 60 * 1000);

//   // Format the date as YYYY-MM-DD
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const day = date.getDate().toString().padStart(2, '0');

//   return `${year}-${month}-${day}`;
// };


// app.post('/uplaodratecardexcel', authenticateToken, async (req, res) => {
//   let { excelData, created_by = "1" } = req.body;

//   excelData = JSON.parse(excelData)


//   try {
//     const pool = await poolPromise;
//     pool.config.options.requestTimeout = 600000;

//     for (const item of excelData) {
//       const result = await pool.request()
//         .input('call_type', sql.VarChar, item.call_type)
//         .input('sub_call_type', sql.VarChar, item.sub_call_type)
//         .input('warranty_type', sql.VarChar, item.warranty_type)
//         .input('item_code', sql.Int, item.item_code)
//         .input('class_city', sql.VarChar, item.class_city)
//         .input('engineer_level', sql.VarChar, item.engineer_level)
//         .input('ProductType', sql.VarChar, item.ProductType)
//         .input('ProductLine', sql.VarChar, item.ProductLine)
//         .input('ProductClass', sql.VarChar, item.ProductClass)
//         .input('Within24Hours', sql.Int, item["Within 24 Hours"])
//         .input('Within48Hours', sql.Int, item["Within 48 Hours"])
//         .input('Within96Hours', sql.Int, item["Within 96 Hours"])
//         .input('MoreThan96Hours', sql.Int, item["> 96 Hours"])
//         .input('gas_charging', sql.Int, item.gas_charging)
//         .input('transportation', sql.Int, item.transportation)
//         .input('csp_code', sql.VarChar, "A12334")
//         .input('created_by', sql.VarChar, created_by)
//         .input('created_date', sql.DateTime, new Date())
//         .query(`
//             INSERT INTO rate_card 
//             (csp_code,call_type, sub_call_type, warranty_type, item_code, class_city, engineer_level, ProductType, ProductLine, ProductClass, Within_24_Hours, Within_48_Hours, Within_96_Hours, MoreThan96_Hours, gas_charging, transportation, created_by , created_date) 
//             VALUES (
//               @csp_code, 
//               @call_type, 
//               @sub_call_type, 
//               @warranty_type, 
//               @item_code, 
//               @class_city, 
//               @engineer_level, 
//               @ProductType, 
//               @ProductLine, 
//               @ProductClass, 
//               @Within24Hours, 
//               @Within48Hours, 
//               @Within96Hours, 
//               @MoreThan96Hours, 
//               @gas_charging, 
//               @transportation,
//               @created_by,
//               @created_date

//             )
//           `);

//       console.log(result, "$%%^^")
//     }

//     return res.json({ message: 'Data inserted successfully' });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'An error occurred while inserting data' });
//   }
// });

// app.post('/uploadmasterwarrantyexcel',authenticateToken, async (req, res) => {
//   let { excelData, created_by = "1" } = req.body;

//   excelData = JSON.parse(excelData)

//   try {
//     const pool = await poolPromise;

//     // Set request timeout to handle large datasets
//     pool.config.options.requestTimeout = 600000;



//     // Loop through the rows and insert them
//     for (const item of excelData) {

//       console.log(item, "$$$");

//       await pool.request()
//         .input('item_code', sql.Int, item.item_code)
//         .input('ProductType', sql.VarChar, item.ProductType)
//         .input('ProductLine', sql.VarChar, item.ProductLine)
//         .input('ProductClass', sql.VarChar, item.ProductClass)
//         .input('ServiceType', sql.VarChar, item.ServiceType)
//         .input('warranty_year', sql.Int, item.warranty_year)
//         .input('compressor_warranty', sql.Int, item.compressor_warranty)
//         .input('warranty_amount', sql.Int, item.warranty_amount)
//         .input('is_scheme', sql.VarChar, item.is_scheme)
//         .input('scheme_name', sql.VarChar, item.scheme_name)
//         .input('scheme_startdate', sql.DateTime, item.scheme_startdate ? convertExcelDate(item.scheme_startdate) : null)
//         .input('scheme_enddate', sql.DateTime, item.scheme_enddate ? convertExcelDate(item.scheme_enddate) : null)
//         .input('csp_code', sql.VarChar, "NULL")
//         .input('created_by', sql.VarChar, created_by)
//         .input('created_date', sql.DateTime, new Date())
//         .query(`
//             INSERT INTO Master_warrenty 
//             (csp_code,item_code, Product_Type, Product_Line, Product_Class, Service_Type, warrenty_year, compressor_warrenty, warrenty_amount, is_scheme, scheme_name, scheme_startdate, scheme_enddate , created_date, created_by) 
//             VALUES 
//             (@csp_code,@item_code, @ProductType, @ProductLine, @ProductClass, @ServiceType, @warranty_year, @compressor_warranty, @warranty_amount, @is_scheme, @scheme_name, @scheme_startdate, @scheme_enddate ,@created_date , @created_by)
//           `);
//     }

//     return res.json({ message: 'Data inserted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'An error occurred while inserting data' });
//   }
// });

// app.post('/uploadpostwarrentyexcel',authenticateToken, async (req, res) => {
//   let { excelData, created_by = "1" } = req.body;

//   // Parse the incoming JSON data for excelData
//   excelData = JSON.parse(excelData);

//   try {
//     const pool = await poolPromise;

//     // Set request timeout to handle large datasets
//     pool.config.options.requestTimeout = 600000;

//     // Loop through the rows and insert them into the database
//     for (const item of excelData) {
//       await pool.request()
//         .input('item_code', sql.Int, item.item_code)
//         .input('serial_no', sql.VarChar, item.serial_no)
//         .input('customer_name', sql.VarChar, item.customer_name)
//         .input('customer_email', sql.VarChar, item.customer_email)
//         .input('customer_mobile', sql.VarChar, item.customer_mobile)
//         .input('ProductType', sql.VarChar, item.ProductType)
//         .input('ProductLine', sql.VarChar, item.ProductLine)
//         .input('ProductClass', sql.VarChar, item.ProductClass)
//         .input('ServiceType', sql.VarChar, item.ServiceType)
//         .input('warranty_year', item.warranty_year ? item.warranty_year : null)
//         .input('compressor_warranty', sql.Int, item.compressor_warranty)
//         .input('warranty_amount', sql.Int, item.warranty_amount)
//         .input('is_scheme', sql.VarChar, item.is_scheme)
//         .input('scheme_name', sql.VarChar, item.scheme_name)
//         .input('scheme_startdate', sql.DateTime, item.scheme_startdate ? convertExcelDate(item.scheme_startdate) : null)
//         .input('scheme_enddate', sql.DateTime, item.scheme_enddate ? convertExcelDate(item.scheme_enddate) : null)
//         .input('created_by', sql.VarChar, created_by)
//         .input('created_date', sql.DateTime, new Date())
//         .query(`
//             INSERT INTO post_sale_warrenty
//             (item_code, serial_no, customer_name, customer_email, customer_mobile, ProductType, ProductLine, 
//             ProductClass, ServiceType, warranty_year, compressor_warranty, warranty_amount, 
//             is_scheme, scheme_name, scheme_startdate, scheme_enddate, created_by ,created_date)
//             VALUES
//             (@item_code, @serial_no, @customer_name, @customer_email, @customer_mobile, @ProductType, @ProductLine, 
//             @ProductClass, @ServiceType, @warranty_year, @compressor_warranty, @warranty_amount, 
//             @is_scheme, @scheme_name, @scheme_startdate, @scheme_enddate, @created_by , @created_date)
//           `);
//     }

//     return res.json({ message: 'Data inserted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'An error occurred while inserting data' });
//   }
// });

// app.post('/uploadpinexcel',authenticateToken, async (req, res) => {


//   let { jsonData } = req.body;
//   let excelData = JSON.parse(jsonData);


//   try {
//     const pool = await poolPromise;
//     pool.config.options.requestTimeout = 600000;

//     for (const item of excelData) {
//       const result = await pool.request()
//         .input('pincode', sql.Int, item.pincode)
//         .input('country', sql.VarChar, item.country)
//         .input('region', sql.VarChar, item.region)
//         .input('state', sql.VarChar, item.state)
//         .input('city', sql.VarChar, item.city)
//         .input('mother_branch', sql.VarChar, item.mother_branch)
//         .input('resident_branch', sql.VarChar, item.resident_branch)
//         .input('area_manager', sql.VarChar, item.area_manager)
//         .input('local_manager', sql.VarChar, item.local_manager)
//         .input('customer_classification', sql.VarChar, item.customer_classification)
//         .input('class_city', sql.VarChar, item.class_of_city)
//         .input('csp_name', sql.VarChar, item.child_service_partner_name)
//         .input('msp_name', sql.VarChar, item.master_service_partner_name)
//         .input('call_type', sql.VarChar, item.call_type)
//         .input('msp_code', sql.Int, item.master_service_partner_code)
//         .input('csp_code', item.child_service_partner_code)
//         .query(`INSERT INTO pincode_allocation 
//               (pincode, country, region, state, city, mother_branch, resident_branch, area_manager, local_manager, customer_classification, class_city, csp_name, msp_name, call_type, msp_code, csp_code) 
//               VALUES (
//                 @pincode, 
//                 @country, 
//                 @region, 
//                 @state, 
//                 @city, 
//                 @mother_branch, 
//                 @resident_branch, 
//                 @area_manager, 
//                 @local_manager, 
//                 @customer_classification, 
//                 @class_city, 
//                 @csp_name, 
//                 @msp_name, 
//                 @call_type,
//                 @msp_code,
//                 @csp_code
//               )

//           `);
//     }


//     return res.json({ message: 'Data inserted successfully' });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'An error occurred while inserting data' });
//   }
// });






// app.post('/uploadspareexcel', async (req, res) => {
//   let { jsonData } = req.body;
//   let excelData = JSON.parse(jsonData);

//   try {
//     const pool = await poolPromise;
//     pool.config.options.requestTimeout = 600000;

//     // Truncate Spare_parts table before inserting new records
//     // await pool.request().query("TRUNCATE TABLE Spare_parts");

//     for (const item of excelData) {
//       // Insert new record in Spare_parts table
//       await pool.request()
//         .input('ProductCode', sql.VarChar, item.ProductCode)
//         .input('ModelNumber', sql.VarChar, item.ModelNumber)
//         .input('title', sql.VarChar, item.title)
//         .input('ItemDescription', sql.VarChar, item.ItemDescription)
//         .input('Manufactured', sql.VarChar, item.Manufactured)
//         .input('BOMQty', sql.VarChar, item.BOMQty)
//         .input('PriceGroup', sql.VarChar, item.PriceGroup)
//         .input('Status', sql.VarChar, item.Status)
//         .input('ProductType', sql.VarChar, item.ProductType)
//         .input('Model', sql.VarChar, item.Model)
//         .input('Index1', sql.VarChar, item.Index1)
//         .input('PartNature', sql.VarChar, item.PartNature)
//         .input('Warranty', sql.VarChar, item.Warranty)
//         .input('HSN', sql.VarChar, item.HSN)
//         .input('Packed', sql.VarChar, item.Packed)
//         .input('Returnable', sql.VarChar, item.Returnable)
//         .input('ProductLine', sql.VarChar, item.ProductLine)
//         .input('ProductClass', sql.VarChar, item.ProductClass)
//         .input('Serialized', sql.VarChar, item.Serialized)
//         .query(`
//           INSERT INTO Spare_parts 
//             (ProductCode, ModelNumber, title, ItemDescription, Manufactured, BOMQty, PriceGroup, Status, ProductType, Model, Index1, PartNature, Warranty, HSN, Packed, Returnable, ProductClass, ProductLine, Serialized) 
//           VALUES (
//             @ProductCode, 
//             @ModelNumber, 
//             @title, 
//             @ItemDescription, 
//             @Manufactured, 
//             @BOMQty, 
//             @PriceGroup, 
//             @Status, 
//             @ProductType, 
//             @Model, 
//             @Index1, 
//             @PartNature, 
//             @Warranty, 
//             @HSN,
//             @Packed,
//             @Returnable,
//             @ProductClass,
//             @ProductLine,
//             @Serialized
//           )
//         `);
//     }

//     return res.status(200).json({ message: 'Data processed successfully' });

//   } catch (err) {
//     console.error("Error inserting data:", err);
//     return res.status(500).json({ error: 'An error occurred while processing data' });
//   }
// });








module.exports = app;