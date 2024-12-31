const express = require('express');
const app = express.Router();
const sql = require('mssql');
const poolPromise = require('./db');
// This is for gettiing data from the another database

const API_KEY = "a8f2b3c4-d5e6-7f8g-h9i0-12345jklmn67";

//This is for Product Master 


app.post("/fetchproductmaster", async (req, res) => {

  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }




  const { item_code, ModelNumber, product_model, product_type, product_class_code, product_class, product_line_code, product_line, material, manufacturer, item_type, serialized, size, crmproducttype, colour, handle_type, serial_identification, installation_type, customer_classification, price_group, mrp, service_partner_basic , packed } = req.body;


  try {
    const pool = await poolPromise;



    // Check if the serial number already exists
    const checkSql = `SELECT COUNT(*) AS count FROM product_master WHERE serial_no = @serial_identification`;
    const checkRequest = pool.request().input('serial_identification', serial_identification);
    const checkResult = await checkRequest.query(checkSql);

    if (checkResult.recordset[0].count > 0) {
      return res.status(400).json({ error: 'Duplicate serial number: serial_no already exists' });
    }

    // SQL query to insert a new complaint remark
    const sql = `INSERT INTO product_master (
  serial_no, item_code, item_description, productType, productLineCode, productLine,
  productClassCode, productClass, material, manufacturer, itemType, serialized,
  sizeProduct, crm_productType, color, installationType, handleType, customerClassification,
  price_group, mrp, service_partner_basic, packed)
VALUES (
  @serial_identification, @item_code, @item_description, @product_type, @product_line_code,
  @product_line, @product_class_code, @product_class, @material, @manufacturer, @item_type,
  @serialized, @size, @crmproducttype, @colour, @installation_type, @handle_type,
  @customer_classification, @price_group, @mrp, @service_partner_basic , @packed
)`;



    const request = pool.request()
      .input('item_code', item_code)
      .input('item_description', ModelNumber)
      .input('product_model', product_model)
      .input('product_type', product_type)
      .input('product_class_code', product_class_code)
      .input('product_class', product_class)
      .input('product_line_code', product_line_code)
      .input('product_line', product_line)
      .input('material', material)
      .input('manufacturer', manufacturer)
      .input('item_type', item_type)
      .input('serialized', serialized)
      .input('size', size)
      .input('crmproducttype', crmproducttype)
      .input('colour', colour)
      .input('handle_type', handle_type)
      .input('serial_identification', serial_identification)
      .input('installation_type', installation_type)
      .input('customer_classification', customer_classification)
      .input('price_group', price_group)
      .input('mrp', mrp)
      .input('service_partner_basic', service_partner_basic)
      .input('packed', packed );



    const result = await request.query(sql);

    res.json({ insertId: result.rowsAffected[0] }); // Send the inserted ID back to the client
  } catch (err) {
    console.error("Error inserting remark:", err);
    return res.status(500).json({ error: "Database error", details: err.message }); // Send back more details for debugging
  }
});

//This is for Franchise Master

app.post("/fetchservicemaster", async (req, res) => {

  
  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  const {
    title, contact_person, email, mobile_no, password, address, country_id, region_id, state, area, city,
    pincode_id, website, gst_no, panno, bank_name, bank_acc, bank_ifsc, bank_address, with_liebherr,
    lastworkindate, contract_acti, contract_expir, licarecode, partner_name
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

       // Check if the licarecode already exists in the table
       const result = await pool.request()
       .input('licarecode', sql.VarChar, licarecode)
       .query('SELECT COUNT(*) AS count FROM awt_franchisemaster WHERE licarecode = @licarecode');
     
     if (result.recordset[0].count > 0) {
       return res.status(409).json({ error: 'Duplicate licarecode: This licarecode already exists' });
     }

   
         // Insert new record using parameterized query
         await pool.request()
         .input('title', sql.VarChar, title)
         .input('licarecode', sql.VarChar, licarecode)
         .input('partner_name', sql.VarChar, partner_name)
         .input('contact_person', sql.VarChar, contact_person)
         .input('email', sql.VarChar, email)
         .input('mobile_no', sql.VarChar, mobile_no)
         .input('password', sql.VarChar, password)
         .input('address', sql.VarChar, address)
         .input('country_id', sql.VarChar, country_id)
         .input('region_id', sql.VarChar, region_id)
         .input('state', sql.VarChar, state)
         .input('area', sql.VarChar, area)
         .input('city', sql.VarChar, city)
         .input('pincode_id', sql.VarChar, pincode_id)
         .input('website', sql.VarChar, website)
         .input('gst_no', sql.VarChar, gst_no)
         .input('panno', sql.VarChar, panno)
         .input('bank_name', sql.VarChar, bank_name)
         .input('bank_acc', sql.VarChar, bank_acc)
         .input('bank_ifsc', sql.VarChar, bank_ifsc)
         .input('bank_address', sql.VarChar, bank_address)
         .input('with_liebherr', sql.DateTime, with_liebherr)
         .input('lastworkindate', sql.DateTime, lastworkindate)
         .input('contract_acti', sql.DateTime, contract_acti)
         .input('contract_expir', sql.DateTime, contract_expir)
         .query(`
           INSERT INTO awt_franchisemaster 
           (title, licarecode, partner_name, contact_person, email, mobile_no, password, address, country_id, region_id, geostate_id, 
            area_id, geocity_id, pincode_id, webste, gstno, panno, bankname, bankacc, bankifsc, bankaddress, withliebher, 
            lastworkinddate, contractacti, contractexpir)
           VALUES 
           (@title, @licarecode, @partner_name, @contact_person, @email, @mobile_no, @password, @address, @country_id, 
            @region_id, @state, @area, @city, @pincode_id, @website, @gst_no, @panno, @bank_name, @bank_acc, @bank_ifsc, 
            @bank_address, @with_liebherr, @lastworkindate, @contract_acti, @contract_expir)
         `);
 
 
       return res.json({
         message: "Franchise Master added successfully!",
       });



   



  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});


//This is for spare parts

app.post("/fetchsparemaster", async (req, res) => {
  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  const {
    ProductCode, ModelNumber, title, ItemDescription, Manufactured, BOMQty, PriceGroup,
    Status, ProductType, Model, Index1, PartNature, Warranty, HSN, Packed, Returnable
  } = req.body;

  const date = new Date()

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

      // Check if the ProductCode already exists
      const result = await pool.request()
      .input('ProductCode', sql.VarChar, ProductCode)
      .query(`
        SELECT COUNT(*) AS count FROM Spare_parts WHERE ProductCode = @ProductCode
      `);

    if (result.recordset[0].count > 0) {
      return res.status(400).json({ error: 'ProductCode already exists' });
    }

    await pool.request()
      .input('ProductCode', sql.VarChar, ProductCode)
      .input('ModelNumber', sql.VarChar, ModelNumber)
      .input('title', sql.VarChar, title)
      .input('ItemDescription', sql.VarChar, ItemDescription)
      .input('Manufactured', sql.VarChar, Manufactured)
      .input('BOMQty', sql.VarChar, BOMQty)
      .input('PriceGroup', sql.VarChar, PriceGroup)
      .input('Status', sql.VarChar, Status)
      .input('ProductType', sql.VarChar, ProductType)
      .input('Model', sql.VarChar, Model)
      .input('Index1', sql.VarChar, Index1)
      .input('PartNature', sql.VarChar, PartNature)
      .input('Warranty', sql.VarChar, Warranty)
      .input('HSN', sql.VarChar, HSN)
      .input('Packed', sql.VarChar, Packed)
      .input('Returnable', sql.VarChar, Returnable)
      .input('created_date', sql.DateTime, date) // Set the current date and time
      .query(`
        INSERT INTO Spare_parts 
        (ProductCode, ModelNumber, title, ItemDescription, Manufactured, BOMQty, PriceGroup, Status, ProductType, Model, Index1, 
         PartNature, Warranty, HSN, Packed, Returnable, created_date)
        VALUES 
        (@ProductCode, @ModelNumber, @title, @ItemDescription, @Manufactured, @BOMQty, @PriceGroup, @Status, @ProductType, 
         @Model, @Index1, @PartNature, @Warranty, @HSN, @Packed, @Returnable, @created_date)
      `);

    return res.json({
      message: "Spare Part added successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});



//This is for Bussiness Partner

app.post("/fetchbussiness_partner", async (req, res) => {
  const apiKey = req.header("x-api-key"); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  const {
    Bp_code,
    title,
    address,
    pincode_id,
    geostate_id,
    partner_name,
    mobile_no,
    email,
    gstno,
    panno,
    created_date,
    updated_date,
    partner_status,
    bankname,
    bankacc,
    bankaddress,
    bankifsc,
    Licare_Ac_Id,
    Licare_code,
    Vendor_Name,
    withliebher,
    lastworkingdate,
    contractactive,
    contractexpire,
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicate Bp_code
    const checkDuplicate = await pool.request()
      .input("Bp_code", sql.VarChar, Bp_code)
      .query(`SELECT COUNT(*) AS count FROM bussiness_partner WHERE Bp_code = @Bp_code`);

    if (checkDuplicate.recordset[0].count > 0) {
      return res.status(409).json({
        error: "Conflict: Duplicate Bp_code",
      });
    }

    // Insert new record
    await pool.request()
      .input("Bp_code", sql.VarChar, Bp_code)
      .input("title", sql.VarChar, title)
      .input("address", sql.VarChar, address)
      .input("pincode_id", sql.VarChar, pincode_id)
      .input("geostate_id", sql.VarChar, geostate_id)
      .input("partner_name", sql.VarChar, partner_name)
      .input("mobile_no", sql.VarChar, mobile_no)
      .input("email", sql.VarChar, email)
      .input("gstno", sql.VarChar, gstno)
      .input("panno", sql.VarChar, panno)
      .input("created_date", sql.DateTime, created_date)
      .input("updated_date", sql.DateTime, updated_date)
      .input("partner_status", sql.VarChar, partner_status)
      .input("bankname", sql.VarChar, bankname)
      .input("bankacc", sql.VarChar, bankacc)
      .input("bankaddress", sql.VarChar, bankaddress)
      .input("bankifsc", sql.VarChar, bankifsc)
      .input("Licare_Ac_Id", sql.VarChar, Licare_Ac_Id)
      .input("Licare_code", sql.VarChar, Licare_code)
      .input("Vendor_Name", sql.VarChar, Vendor_Name)
      .input("withliebher", sql.VarChar, withliebher)
      .input("lastworkingdate", sql.DateTime, lastworkingdate)
      .input("contractactive", sql.VarChar, contractactive)
      .input("contractexpire", sql.DateTime, contractexpire)
      .query(`
        INSERT INTO bussiness_partner (
          Bp_code, title, address, pincode_id, geostate_id, partner_name, mobile_no, email, 
          gstno, panno, created_date, partner_status, bankname, bankacc, bankaddress, 
          bankifsc, Licare_Ac_Id, Licare_code, Vendor_Name, withliebher, lastworkingdate, 
          contractactive, contractexpire
        ) VALUES (
          @Bp_code, @title, @address, @pincode_id, @geostate_id, @partner_name, @mobile_no, @email, 
          @gstno, @panno, @created_date, @partner_status, @bankname, @bankacc, @bankaddress, 
          @bankifsc, @Licare_Ac_Id, @Licare_code, @Vendor_Name, @withliebher, @lastworkingdate, 
          @contractactive, @contractexpire
        )
      `);

    return res.json({
      message: "Business partner added successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err });
  }
});

//This is for Shipment FG

app.post("/fetchshipment_fg", async (req, res) => {
  const apiKey = req.header("x-api-key"); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  const {
    InvoiceNumber,
    InvoiceDate,
    Invoice_bpcode,
    Invoice_bpName,
    Invoice_city,
    Invoice_state,
    orderType_desc,
    Customer_Po,
    Item_Code,
    Item_Description,
    Invoice_qty,
    Serial_no,
    compressor_bar,
    Manufacture_date,
    Vehicle_no,
    Vehicale_Type,
    Transporter_name,
    Lr_number,
    Lr_date,
    Address_code,
    Address,
    Pincode,
    Shipment_id,
    Ship_date,
    Transaction_Type,
    created_date,
    customer_classification
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicates based on Serial_no and Item_Code
    const checkDuplicate = await pool.request()
      .input("Serial_no", sql.VarChar, Serial_no)
      .input("Item_Code", sql.VarChar, Item_Code)
      .query(`
        SELECT COUNT(*) AS count 
        FROM Shipment_Fg 
        WHERE Serial_no = @Serial_no AND Item_Code = @Item_Code
      `);

    if (checkDuplicate.recordset[0].count > 0) {
      return res.status(409).json({
        error: "Conflict: Duplicate Serial_no and Item_Code combination"
      });
    }

    // Insert new record
    await pool.request()
      .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
      .input("InvoiceDate", sql.DateTime, InvoiceDate)
      .input("Invoice_bpcode", sql.VarChar, Invoice_bpcode)
      .input("Invoice_bpName", sql.VarChar, Invoice_bpName)
      .input("Invoice_city", sql.VarChar, Invoice_city)
      .input("Invoice_state", sql.VarChar, Invoice_state)
      .input("orderType_desc", sql.VarChar, orderType_desc)
      .input("Customer_Po", sql.VarChar, Customer_Po)
      .input("Item_Code", sql.VarChar, Item_Code)
      .input("Item_Description", sql.VarChar, Item_Description)
      .input("Invoice_qty", sql.VarChar, Invoice_qty)
      .input("Serial_no", sql.VarChar, Serial_no)
      .input("compressor_bar", sql.VarChar, compressor_bar)
      .input("Manufacture_date", sql.DateTime, Manufacture_date)
      .input("Vehicle_no", sql.VarChar, Vehicle_no)
      .input("Vehicale_Type", sql.VarChar, Vehicale_Type)
      .input("Transporter_name", sql.VarChar, Transporter_name)
      .input("Lr_number", sql.VarChar, Lr_number)
      .input("Lr_date", sql.DateTime, Lr_date)
      .input("Address_code", sql.VarChar, Address_code)
      .input("Address", sql.VarChar, Address)
      .input("Pincode", sql.VarChar, Pincode)
      .input("Shipment_id", sql.VarChar, Shipment_id)
      .input("Ship_date", sql.DateTime, Ship_date)
      .input("Transaction_Type", sql.VarChar, Transaction_Type)
      .input("created_date", sql.DateTime, created_date)
      .input("customer_classification", sql.VarChar, customer_classification)
      .query(`
        INSERT INTO Shipment_Fg (
          InvoiceNumber, InvoiceDate, Invoice_bpcode, Invoice_bpName, Invoice_city, Invoice_state,
          orderType_desc, Customer_Po, Item_Code, Item_Description, Invoice_qty, Serial_no,
          compressor_bar, Manufacture_date, Vehicle_no, Vehicale_Type, Transporter_name, Lr_number,
          Lr_date, Address_code, Address, Pincode, Shipment_id, Ship_date, Transaction_Type ,created_date,customer_classification
        ) VALUES (
          @InvoiceNumber, @InvoiceDate, @Invoice_bpcode, @Invoice_bpName, @Invoice_city, @Invoice_state,
          @orderType_desc, @Customer_Po, @Item_Code, @Item_Description, @Invoice_qty, @Serial_no,
          @compressor_bar, @Manufacture_date, @Vehicle_no, @Vehicale_Type, @Transporter_name, @Lr_number,
          @Lr_date, @Address_code, @Address, @Pincode, @Shipment_id, @Ship_date, @Transaction_Type ,@created_date,@customer_classification
        )
      `);

    return res.json({
      message: "Added successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err });
  }
});

//This is for Shipment Parts

app.post("/fetchshipment_Parts", async (req, res) => {
  const apiKey = req.header("x-api-key"); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  const {
    InvoiceNumber,
    InvoiceDate,
    Invoice_bpcode,
    Invoice_bpName,
    Invoice_city,
    Invoice_state,
    orderType_desc,
    Customer_Po,
    Item_Code,
    Item_Description,
    Invoice_qty,
    hsn_code,
    Basic_rate,
    compressor_bar,
    Vehicle_no,
    Vehicale_Type,
    Transporter_name,
    Lr_number,
    Lr_date,
    Address_code,
    Address,
    Pincode,
    Licare_code,
    Licare_Address,
    Shipment_id,
    Ship_date,
    Transaction_Type,
    Product_Choice,
    Serial_Indentity,
    created_date,
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicate entry
    const duplicateCheck = await pool.request()
      .input("Serial_Indentity", sql.VarChar, Serial_Indentity)
      .input("Item_Code", sql.VarChar, Item_Code)
      .query(`
        SELECT COUNT(*) AS count 
        FROM Shipment_parts 
        WHERE Serial_Indentity = @Serial_Indentity AND Item_Code = @Item_Code
      `);

    const { count } = duplicateCheck.recordset[0];

    if (count > 0) {
      return res.status(409).json({ error: "Duplicate entry: Serial_Indentity and Item_Code already exist" });
    }

    // Insert new record
    await pool.request()
      .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
      .input("InvoiceDate", sql.DateTime, InvoiceDate)
      .input("Invoice_bpcode", sql.VarChar, Invoice_bpcode)
      .input("Invoice_bpName", sql.VarChar, Invoice_bpName)
      .input("Invoice_city", sql.VarChar, Invoice_city)
      .input("Invoice_state", sql.VarChar, Invoice_state)
      .input("orderType_desc", sql.VarChar, orderType_desc)
      .input("Customer_Po", sql.VarChar, Customer_Po)
      .input("Item_Code", sql.VarChar, Item_Code)
      .input("Item_Description", sql.VarChar, Item_Description)
      .input("Invoice_qty", sql.VarChar, Invoice_qty)
      .input("hsn_code", sql.VarChar, hsn_code)
      .input("Basic_rate", sql.VarChar, Basic_rate)
      .input("compressor_bar", sql.VarChar, compressor_bar)
      .input("Vehicle_no", sql.VarChar, Vehicle_no)
      .input("Vehicale_Type", sql.VarChar, Vehicale_Type)
      .input("Transporter_name", sql.VarChar, Transporter_name)
      .input("Lr_number", sql.VarChar, Lr_number)
      .input("Lr_date", sql.DateTime, Lr_date)
      .input("Address_code", sql.VarChar, Address_code)
      .input("Address", sql.VarChar, Address)
      .input("Pincode", sql.VarChar, Pincode)
      .input("Licare_code", sql.VarChar, Licare_code)
      .input("Licare_Address", sql.VarChar, Licare_Address)
      .input("Shipment_id", sql.Int, Shipment_id)
      .input("Ship_date", sql.DateTime, Ship_date)
      .input("Transaction_Type", sql.VarChar, Transaction_Type)
      .input("Product_Choice", sql.VarChar, Product_Choice)
      .input("Serial_Indentity", sql.VarChar, Serial_Indentity)
      .input("created_date", sql.VarChar, created_date)
      .query(`
        INSERT INTO Shipment_parts (
          InvoiceNumber, InvoiceDate, Invoice_bpcode, Invoice_bpName, 
          Invoice_city, Invoice_state, orderType_desc, Customer_Po, Item_Code,
          Item_Description, Invoice_qty, hsn_code, Basic_rate, compressor_bar,
          Vehicle_no, Vehicale_Type, Transporter_name, Lr_number, Lr_date,
          Address_code, Address, Pincode, Licare_code, Licare_Address,
          Shipment_id, Ship_date, Transaction_Type, Product_Choice, Serial_Indentity, created_date
        ) VALUES (
          @InvoiceNumber, @InvoiceDate, @Invoice_bpcode, @Invoice_bpName,
          @Invoice_city, @Invoice_state, @orderType_desc, @Customer_Po, @Item_Code,
          @Item_Description, @Invoice_qty, @hsn_code, @Basic_rate, @compressor_bar,
          @Vehicle_no, @Vehicale_Type, @Transporter_name, @Lr_number, @Lr_date,
          @Address_code, @Address, @Pincode, @Licare_code, @Licare_Address,
          @Shipment_id, @Ship_date, @Transaction_Type, @Product_Choice, @Serial_Indentity, @created_date
        )
      `);

    return res.json({ message: "Added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err });
  }
});





module.exports = app;