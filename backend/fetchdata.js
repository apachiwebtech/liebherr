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

  const {
    item_code, ModelNumber, product_model, product_type, product_class_code, product_class,
    product_line_code, product_line, material, manufacturer, item_type, serialized, size,
    crmproducttype, colour, handle_type, serial_identification, installation_type,
    customer_classification, price_group, mrp, service_partner_basic, packed
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check if the serial number already exists
    const checkSql = `SELECT COUNT(*) AS count FROM product_master WHERE item_code = @item_code`;
    const checkRequest = pool.request().input('item_code', item_code);
    const checkResult = await checkRequest.query(checkSql);

    if (checkResult.recordset[0].count > 0) {
      // Update the existing record if a duplicate is found
      const updateSql = `
        UPDATE product_master
        SET 
          item_description = @item_description,
          productType = @product_type,
          productLineCode = @product_line_code,
          productLine = @product_line,
          productClassCode = @product_class_code,
          productClass = @product_class,
          material = @material,
          manufacturer = @manufacturer,
          itemType = @item_type,
          serialized = @serialized,
          sizeProduct = @size,
          crm_productType = @crmproducttype,
          color = @colour,
          installationType = @installation_type,
          handleType = @handle_type,
          customerClassification = @customer_classification,
          price_group = @price_group,
          mrp = @mrp,
          service_partner_basic = @service_partner_basic,
          packed = @packed
        WHERE item_code = @item_code
      `;

      const updateRequest = pool.request()
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
        .input('packed', packed);

      await updateRequest.query(updateSql);
      return res.json({ message: 'Record updated successfully' });
    }

    // Insert a new record if no duplicate is found
    const insertSql = `
      INSERT INTO product_master (
        serial_no, item_code, item_description, productType, productLineCode, productLine,
        productClassCode, productClass, material, manufacturer, itemType, serialized,
        sizeProduct, crm_productType, color, installationType, handleType, customerClassification,
        price_group, mrp, service_partner_basic, packed
      ) VALUES (
        @serial_identification, @item_code, @item_description, @product_type, @product_line_code,
        @product_line, @product_class_code, @product_class, @material, @manufacturer, @item_type,
        @serialized, @size, @crmproducttype, @colour, @installation_type, @handle_type,
        @customer_classification, @price_group, @mrp, @service_partner_basic, @packed
      )
    `;

    const insertRequest = pool.request()
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
      .input('packed', packed);

    const result = await insertRequest.query(insertSql);
    res.json({ insertId: result.rowsAffected[0], message: 'Record inserted successfully' });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
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
    lastworkindate, contract_acti, contract_expir, licarecode, partner_name, BP_code, lastmodificationdate, BP_status,
    branch, Licare_Ac_Id, Vendor_Name_licare, work_with_liebherr,
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Check if the licarecode already exists in the table
    const result = await pool.request()
      .input('BP_code', sql.VarChar, BP_code)
      .query('SELECT COUNT(*) AS count FROM awt_franchisemaster WHERE BP_code = @BP_code');

    if (result.recordset[0].count > 0) {
      // If the BP_code exists, update the existing record
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
        .input('with_liebherr', sql.VarChar, with_liebherr)
        .input('lastworkindate', sql.VarChar, lastworkindate)
        .input('contract_acti', sql.VarChar, contract_acti)
        .input('contract_expir', sql.VarChar, contract_expir)
        .input('BP_code', sql.VarChar, BP_code)
        .input('lastmodificationdate', sql.VarChar, lastmodificationdate)
        .input('BP_status', sql.VarChar, BP_status)
        .input('branch', sql.VarChar, branch)
        .input('Licare_Ac_Id', sql.VarChar, Licare_Ac_Id)
        .input('Vendor_Name_licare', sql.VarChar, Vendor_Name_licare)
        .input('work_with_liebherr', sql.VarChar, work_with_liebherr)
        .query(`
          UPDATE awt_franchisemaster
          SET title = @title, licarecode = @licarecode, partner_name = @partner_name, contact_person = @contact_person,
              email = @email, mobile_no = @mobile_no, password = @password, address = @address, country_id = @country_id,
              region_id = @region_id, geostate_id = @state, area_id = @area, geocity_id = @city, pincode_id = @pincode_id,
              webste = @website, gstno = @gst_no, panno = @panno, bankname = @bank_name, bankacc = @bank_acc,
              bankifsc = @bank_ifsc, bankaddress = @bank_address, withliebher = @with_liebherr, lastworkinddate = @lastworkindate,
              contractacti = @contract_acti, contractexpir = @contract_expir, lastmodificationdate = @lastmodificationdate,
              BP_status = @BP_status, branch = @branch, Licare_Ac_Id = @Licare_Ac_Id, Vendor_Name_licare = @Vendor_Name_licare,
              work_with_liebherr = @work_with_liebherr
          WHERE BP_code = @BP_code
        `);

      return res.json({
        message: "Franchise Master updated successfully!",
      });
    } else {
      // Insert new record if BP_code does not exist
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
        .input('with_liebherr', sql.VarChar, with_liebherr)
        .input('lastworkindate', sql.VarChar, lastworkindate)
        .input('contract_acti', sql.VarChar, contract_acti)
        .input('contract_expir', sql.VarChar, contract_expir)
        .input('BP_code', sql.VarChar, BP_code)
        .input('lastmodificationdate', sql.VarChar, lastmodificationdate)
        .input('BP_status', sql.VarChar, BP_status)
        .input('branch', sql.VarChar, branch)
        .input('Licare_Ac_Id', sql.VarChar, Licare_Ac_Id)
        .input('Vendor_Name_licare', sql.VarChar, Vendor_Name_licare)
        .input('work_with_liebherr', sql.VarChar, work_with_liebherr)
        .query(`
          INSERT INTO awt_franchisemaster 
          (title, licarecode, partner_name, contact_person, email, mobile_no, password, address, country_id, region_id, geostate_id, 
           area_id, geocity_id, pincode_id, webste, gstno, panno, bankname, bankacc, bankifsc, bankaddress, withliebher, 
           lastworkinddate, contractacti, contractexpir, BP_code, lastmodificationdate, BP_status, branch, Licare_Ac_Id, 
           Vendor_Name_licare, work_with_liebherr)
          VALUES 
          (@title, @licarecode, @partner_name, @contact_person, @email, @mobile_no, @password, @address, @country_id, 
           @region_id, @state, @area, @city, @pincode_id, @website, @gst_no, @panno, @bank_name, @bank_acc, @bank_ifsc, 
           @bank_address, @with_liebherr, @lastworkindate, @contract_acti, @contract_expir, @BP_code, @lastmodificationdate,
           @BP_status, @branch, @Licare_Ac_Id, @Vendor_Name_licare, @work_with_liebherr)
        `);

      return res.json({
        message: "Franchise Master added successfully!",
      });
    }
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

  const date = new Date();

  try {
    const pool = await poolPromise;

    // Check if the ProductCode already exists
    const checkSql = `
      SELECT COUNT(*) AS count FROM Spare_parts WHERE ProductCode = @ProductCode
    `;
    const checkResult = await pool.request()
      .input('ProductCode', sql.VarChar, ProductCode)
      .query(checkSql);

    if (checkResult.recordset[0].count > 0) {
      // Update the record if it exists
      const updateSql = `
        UPDATE Spare_parts
        SET 
          ModelNumber = @ModelNumber,
          title = @title,
          ItemDescription = @ItemDescription,
          Manufactured = @Manufactured,
          BOMQty = @BOMQty,
          PriceGroup = @PriceGroup,
          Status = @Status,
          ProductType = @ProductType,
          Model = @Model,
          Index1 = @Index1,
          PartNature = @PartNature,
          Warranty = @Warranty,
          HSN = @HSN,
          Packed = @Packed,
          Returnable = @Returnable,
          created_date = @created_date
        WHERE ProductCode = @ProductCode
      `;

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
        .input('created_date', sql.DateTime, date)
        .query(updateSql);

      return res.json({ message: "Spare Part updated successfully!" });
    }

    // Insert a new record if no duplicate is found
    const insertSql = `
      INSERT INTO Spare_parts 
      (ProductCode, ModelNumber, title, ItemDescription, Manufactured, BOMQty, PriceGroup, Status, ProductType, Model, Index1, 
       PartNature, Warranty, HSN, Packed, Returnable, created_date)
      VALUES 
      (@ProductCode, @ModelNumber, @title, @ItemDescription, @Manufactured, @BOMQty, @PriceGroup, @Status, @ProductType, 
       @Model, @Index1, @PartNature, @Warranty, @HSN, @Packed, @Returnable, @created_date)
    `;

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
      .input('created_date', sql.DateTime, date)
      .query(insertSql);

    return res.json({ message: "Spare Part added successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error", details: err.message });
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
      // If duplicate exists, update the record
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
        .input("created_date", sql.VarChar, created_date)
        .input("updated_date", sql.VarChar, updated_date)
        .input("partner_status", sql.VarChar, partner_status)
        .input("bankname", sql.VarChar, bankname)
        .input("bankacc", sql.VarChar, bankacc)
        .input("bankaddress", sql.VarChar, bankaddress)
        .input("bankifsc", sql.VarChar, bankifsc)
        .input("Licare_Ac_Id", sql.VarChar, Licare_Ac_Id)
        .input("Licare_code", sql.VarChar, Licare_code)
        .input("Vendor_Name", sql.VarChar, Vendor_Name)
        .input("withliebher", sql.VarChar, withliebher)
        .input("lastworkingdate", sql.VarChar, lastworkingdate)
        .input("contractactive", sql.VarChar, contractactive)
        .input("contractexpire", sql.VarChar, contractexpire)
        .query(`
          UPDATE bussiness_partner SET
            title = @title,
            address = @address,
            pincode_id = @pincode_id,
            geostate_id = @geostate_id,
            partner_name = @partner_name,
            mobile_no = @mobile_no,
            email = @email,
            gstno = @gstno,
            panno = @panno,
            created_date = @created_date,
            updated_date = @updated_date,
            partner_status = @partner_status,
            bankname = @bankname,
            bankacc = @bankacc,
            bankaddress = @bankaddress,
            bankifsc = @bankifsc,
            Licare_Ac_Id = @Licare_Ac_Id,
            Licare_code = @Licare_code,
            Vendor_Name = @Vendor_Name,
            withliebher = @withliebher,
            lastworkingdate = @lastworkingdate,
            contractactive = @contractactive,
            contractexpire = @contractexpire
          WHERE Bp_code = @Bp_code
        `);

      return res.json({
        message: "Business partner updated successfully!",
      });
    } else {
      // Insert new record if no duplicate
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
        .input("created_date", sql.VarChar, created_date)
        .input("updated_date", sql.VarChar, updated_date)
        .input("partner_status", sql.VarChar, partner_status)
        .input("bankname", sql.VarChar, bankname)
        .input("bankacc", sql.VarChar, bankacc)
        .input("bankaddress", sql.VarChar, bankaddress)
        .input("bankifsc", sql.VarChar, bankifsc)
        .input("Licare_Ac_Id", sql.VarChar, Licare_Ac_Id)
        .input("Licare_code", sql.VarChar, Licare_code)
        .input("Vendor_Name", sql.VarChar, Vendor_Name)
        .input("withliebher", sql.VarChar, withliebher)
        .input("lastworkingdate", sql.VarChar, lastworkingdate)
        .input("contractactive", sql.VarChar, contractactive)
        .input("contractexpire", sql.VarChar, contractexpire)
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
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err });
  }
});


//This is for Shipment FG

app.post("/fetchshipment_fg", async (req, res) => {
  const apiKey = req.header("x-api-key"); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(200).json({ error: "Forbidden: Invalid API key" });
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
    customer_classification,
    hsn_code,
    basic_rate,
    licarecode,
    licare_address,
    product_choice,
    serial_identification,
    lot_number,
    order_number,
    order_line_number,
    wearhouse,
    service_type,
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicates and insert or update as necessary
    const result = await pool.request()
      .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
      .input("InvoiceDate", sql.VarChar, InvoiceDate)
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
      .input("Manufacture_date", sql.VarChar, Manufacture_date)
      .input("Vehicle_no", sql.VarChar, Vehicle_no)
      .input("Vehicale_Type", sql.VarChar, Vehicale_Type)
      .input("Transporter_name", sql.VarChar, Transporter_name)
      .input("Lr_number", sql.VarChar, Lr_number)
      .input("Lr_date", sql.VarChar, Lr_date)
      .input("Address_code", sql.VarChar, Address_code)
      .input("Address", sql.VarChar, Address)
      .input("Pincode", sql.VarChar, Pincode)
      .input("Shipment_id", sql.VarChar, Shipment_id)
      .input("Ship_date", sql.VarChar, Ship_date)
      .input("Transaction_Type", sql.VarChar, Transaction_Type)
      .input("created_date", sql.VarChar, created_date)
      .input("customer_classification", sql.VarChar, customer_classification)
      .input("hsn_code", sql.VarChar, hsn_code)
      .input("basic_rate", sql.VarChar, basic_rate)
      .input("licarecode", sql.VarChar, licarecode)
      .input("licare_address", sql.VarChar, licare_address)
      .input("product_choice", sql.VarChar, product_choice)
      .input("serial_identification", sql.VarChar, serial_identification)
      .input("lot_number", sql.VarChar, lot_number)
      .input("order_number", sql.VarChar, order_number)
      .input("order_line_number", sql.VarChar, order_line_number)
      .input("wearhouse", sql.VarChar, wearhouse)
      .input("service_type", sql.VarChar, service_type)
      .query(`
        IF EXISTS (
          SELECT 1 
          FROM Shipment_Fg 
          WHERE Serial_no = @S AND Item_Code = @Item_Code AND InvoiceNumber = @InvoiceNumber
        )
        BEGIN
          UPDATE Shipment_Fg
          SET 
            InvoiceDate = @InvoiceDate, Invoice_bpcode = @Invoice_bpcode, Invoice_bpName = @Invoice_bpName,
            Invoice_city = @Invoice_city, Invoice_state = @Invoice_state, orderType_desc = @orderType_desc,
            Customer_Po = @Customer_Po, Item_Description = @Item_Description, Invoice_qty = @Invoice_qty,
            compressor_bar = @compressor_bar, Manufacture_date = @Manufacture_date, Vehicle_no = @Vehicle_no,
            Vehicale_Type = @Vehicale_Type, Transporter_name = @Transporter_name, Lr_number = @Lr_number,
            Lr_date = @Lr_date, Address_code = @Address_code, Address = @Address, Pincode = @Pincode,
            Shipment_id = @Shipment_id, Ship_date = @Ship_date, Transaction_Type = @Transaction_Type,
            created_date = @created_date, customer_classification = @customer_classification,
            hsn_code = @hsn_code, basic_rate = @basic_rate, licarecode = @licarecode,
            licare_address = @licare_address, product_choice = @product_choice,
            serial_identification = @serial_identification, lot_number = @lot_number,
            order_number = @order_number, order_line_number = @order_line_number,
            wearhouse = @wearhouse, service_type = @service_type
          WHERE Serial_no = @Serial_no AND Item_Code = @Item_Code AND InvoiceNumber = @InvoiceNumber
        END
        ELSE
        BEGIN
          INSERT INTO Shipment_Fg (
            InvoiceNumber, InvoiceDate, Invoice_bpcode, Invoice_bpName, Invoice_city, Invoice_state,
            orderType_desc, Customer_Po, Item_Code, Item_Description, Invoice_qty, Serial_no,
            compressor_bar, Manufacture_date, Vehicle_no, Vehicale_Type, Transporter_name, Lr_number,
            Lr_date, Address_code, Address, Pincode, Shipment_id, Ship_date, Transaction_Type,
            created_date, customer_classification, hsn_code, basic_rate, licarecode, licare_address,
            product_choice, serial_identification, lot_number, order_number, order_line_number,
            wearhouse, service_type
          ) VALUES (
            @InvoiceNumber, @InvoiceDate, @Invoice_bpcode, @Invoice_bpName, @Invoice_city, @Invoice_state,
            @orderType_desc, @Customer_Po, @Item_Code, @Item_Description, @Invoice_qty, @Serial_no,
            @compressor_bar, @Manufacture_date, @Vehicle_no, @Vehicale_Type, @Transporter_name, @Lr_number,
            @Lr_date, @Address_code, @Address, @Pincode, @Shipment_id, @Ship_date, @Transaction_Type,
            @created_date, @customer_classification, @hsn_code, @basic_rate, @licarecode, @licare_address,
            @product_choice, @serial_identification, @lot_number, @order_number, @order_line_number,
            @wearhouse, @service_type
          )
        END
      `);

    return res.json({
      message: "Operation completed successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.json(err);
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
    Serial_no,
    Lot_Number,
    Order_Number,
    Order_Line_Number,
    Warehouse,
    Service_Type,
    created_date,
    Manufactured_Date,
  } = req.body;

  try {
    const pool = await poolPromise;

    // Check for duplicate entry
    const duplicateCheck = await pool.request()
      .input("Item_Code", sql.VarChar, Item_Code)
      .input("Serial_no", sql.VarChar, Serial_no)
      .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
      .query(`
        SELECT COUNT(*) AS count 
        FROM Shipment_parts 
        WHERE Item_Code = @Item_Code AND Serial_no = @Serial_no AND InvoiceNumber = @InvoiceNumber
      `);

    const { count } = duplicateCheck.recordset[0];

    if (count > 0) {
      // Update existing record
      await pool.request()
        .input("InvoiceDate", sql.VarChar, InvoiceDate)
        .input("Invoice_bpcode", sql.VarChar, Invoice_bpcode)
        .input("Invoice_bpName", sql.VarChar, Invoice_bpName)
        .input("Invoice_city", sql.VarChar, Invoice_city)
        .input("Invoice_state", sql.VarChar, Invoice_state)
        .input("orderType_desc", sql.VarChar, orderType_desc)
        .input("Customer_Po", sql.VarChar, Customer_Po)
        .input("Item_Description", sql.VarChar, Item_Description)
        .input("Invoice_qty", sql.VarChar, Invoice_qty)
        .input("hsn_code", sql.VarChar, hsn_code)
        .input("Basic_rate", sql.VarChar, Basic_rate)
        .input("compressor_bar", sql.VarChar, compressor_bar)
        .input("Vehicle_no", sql.VarChar, Vehicle_no)
        .input("Vehicale_Type", sql.VarChar, Vehicale_Type)
        .input("Transporter_name", sql.VarChar, Transporter_name)
        .input("Lr_number", sql.VarChar, Lr_number)
        .input("Lr_date", sql.VarChar, Lr_date)
        .input("Address_code", sql.VarChar, Address_code)
        .input("Address", sql.VarChar, Address)
        .input("Pincode", sql.VarChar, Pincode)
        .input("Licare_code", sql.VarChar, Licare_code)
        .input("Licare_Address", sql.VarChar, Licare_Address)
        .input("Shipment_id", sql.VarChar, Shipment_id)
        .input("Ship_date", sql.VarChar, Ship_date)
        .input("Transaction_Type", sql.VarChar, Transaction_Type)
        .input("Product_Choice", sql.VarChar, Product_Choice)
        .input("Serial_Indentity", sql.VarChar, Serial_Indentity)
        .input("Lot_Number", sql.VarChar, Lot_Number)
        .input("Order_Number", sql.VarChar, Order_Number)
        .input("Order_Line_Number", sql.VarChar, Order_Line_Number)
        .input("Warehouse", sql.VarChar, Warehouse)
        .input("Service_Type", sql.VarChar, Service_Type)
        .input("Manufactured_Date", sql.VarChar, Manufactured_Date)
        .input("created_date", sql.VarChar, created_date)
        .input("Item_Code", sql.VarChar, Item_Code)
        .input("Serial_no", sql.VarChar, Serial_no)
        .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
        .query(`
          UPDATE Shipment_parts
          SET 
            InvoiceDate = @InvoiceDate, Invoice_bpcode = @Invoice_bpcode, Invoice_bpName = @Invoice_bpName,
            Invoice_city = @Invoice_city, Invoice_state = @Invoice_state, orderType_desc = @orderType_desc,
            Customer_Po = @Customer_Po, Item_Description = @Item_Description, Invoice_qty = @Invoice_qty,
            hsn_code = @hsn_code, Basic_rate = @Basic_rate, compressor_bar = @compressor_bar,
            Vehicle_no = @Vehicle_no, Vehicale_Type = @Vehicale_Type, Transporter_name = @Transporter_name,
            Lr_number = @Lr_number, Lr_date = @Lr_date, Address_code = @Address_code, Address = @Address,
            Pincode = @Pincode, Licare_code = @Licare_code, Licare_Address = @Licare_Address,
            Shipment_id = @Shipment_id, Ship_date = @Ship_date, Transaction_Type = @Transaction_Type,
            Product_Choice = @Product_Choice, Serial_Indentity = @Serial_Indentity, Lot_Number = @Lot_Number,
            Order_Number = @Order_Number, Order_Line_Number = @Order_Line_Number, Warehouse = @Warehouse,
            Service_Type = @Service_Type, created_date = @created_date, Manufactured_Date = @Manufactured_Date
          WHERE Item_Code = @Item_Code AND Serial_no = @Serial_no AND InvoiceNumber = @InvoiceNumber
        `);

      return res.json({ message: "Record updated successfully!" });
    } else {
      // Insert new record
      await pool.request()
      .input("InvoiceNumber", sql.VarChar, InvoiceNumber)
      .input("InvoiceDate", sql.VarChar, InvoiceDate)
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
      .input("Lr_date", sql.VarChar, Lr_date)
      .input("Address_code", sql.VarChar, Address_code)
      .input("Address", sql.VarChar, Address)
      .input("Pincode", sql.VarChar, Pincode)
      .input("Licare_code", sql.VarChar, Licare_code)
      .input("Licare_Address", sql.VarChar, Licare_Address)
      .input("Shipment_id", sql.VarChar, Shipment_id)
      .input("Ship_date", sql.VarChar, Ship_date)
      .input("Transaction_Type", sql.VarChar, Transaction_Type)
      .input("Product_Choice", sql.VarChar, Product_Choice)
      .input("Serial_Indentity", sql.VarChar, Serial_Indentity)
      .input("Serial_no", sql.VarChar, Serial_no)
      .input("Lot_Number", sql.VarChar, Lot_Number)
      .input("Order_Number", sql.VarChar, Order_Number)
      .input("Order_Line_Number", sql.VarChar, Order_Line_Number)
      .input("Warehouse", sql.VarChar, Warehouse)
      .input("Service_Type", sql.VarChar, Service_Type)
      .input("Manufactured_Date", sql.VarChar, Manufactured_Date)
      .input("created_date", sql.VarChar, created_date)
      .query(`
        INSERT INTO Shipment_parts (
          InvoiceNumber, InvoiceDate, Invoice_bpcode, Invoice_bpName, 
          Invoice_city, Invoice_state, orderType_desc, Customer_Po, Item_Code,
          Item_Description, Invoice_qty,Serial_no, hsn_code, Basic_rate,Manufactured_Date, compressor_bar,
          Vehicle_no, Vehicale_Type, Transporter_name, Lr_number, Lr_date,
          Address_code, Address, Pincode, Licare_code, Licare_Address,
          Shipment_id, Ship_date, Transaction_Type, Product_Choice, Serial_Indentity,Lot_Number,Order_Number,Order_Line_Number,
          Warehouse, Service_Type, created_date
        ) VALUES (
          @InvoiceNumber, @InvoiceDate, @Invoice_bpcode, @Invoice_bpName,
          @Invoice_city, @Invoice_state, @orderType_desc, @Customer_Po, @Item_Code,
          @Item_Description, @Invoice_qty,@Serial_no, @hsn_code, @Basic_rate,@Manufactured_Date, @compressor_bar,
          @Vehicle_no, @Vehicale_Type, @Transporter_name, @Lr_number, @Lr_date,
          @Address_code, @Address, @Pincode, @Licare_code, @Licare_Address,
          @Shipment_id, @Ship_date, @Transaction_Type, @Product_Choice, @Serial_Indentity,@Lot_Number,@Order_Number,@Order_Line_Number,
           @Warehouse, @Service_Type, @created_date
        )
      `);

      return res.json({ message: "Added successfully!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", details: err });
  }
});








app.post("/fetchspareprice", async (req, res) => {
  const apiKey = req.header("x-api-key"); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  const {
    Product_code, Product_descV1, Item, item_description, Manufactured, Qty,
    Price_group, status, Product_type, Model, Index_num,
    part_nature, warrenty, refundable
  } = req.body;

  try {
    // Connect to the database
    const pool = await poolPromise;

    // Check for duplicate record based on Item and Product_code
    const duplicateCheckQuery = `
      SELECT COUNT(*) AS count 
      FROM Spare_partprice
      WHERE Item = @Item AND Product_code = @Product_code
    `;

    const duplicateCheckResult = await pool.request()
      .input('Item', sql.VarChar(50), Item)
      .input('Product_code', sql.VarChar(50), Product_code)
      .query(duplicateCheckQuery);

    console.log("Duplicate Check Result:", duplicateCheckResult.recordset[0].count);



    const duplicateCount = duplicateCheckResult.recordset[0].count;


    if(duplicateCount > 0) {
      const updateQuery = ` UPDATE Spare_partprice
        SET 
          Product_descV1 = @Product_descV1,
          item_description = @item_description,
          Manufactured = @Manufactured,
          Qty = @Qty,
          Price_group = @Price_group,
          status = @status,
          Product_type = @Product_type,
          Model = @Model,
          Index_num = @Index_num,
          part_nature = @part_nature,
          warrenty = @warrenty,
          refundable = @refundable
        WHERE Product_code = @Product_code`;


        await pool.request()
        .input('Product_descV1', sql.Text, Product_descV1)
        .input('item_description', sql.Text, item_description)
        .input('Manufactured', sql.VarChar(50), Manufactured)
        .input('Qty', sql.VarChar(50), Qty)
        .input('Price_group', sql.VarChar(50), Price_group)
        .input('status', sql.VarChar(50), status)
        .input('Product_type', sql.VarChar(50), Product_type)
        .input('Model', sql.VarChar(50), Model)
        .input('Index_num', sql.VarChar(50), Index_num)
        .input('part_nature', sql.VarChar(50), part_nature)
        .input('warrenty', sql.VarChar(50), warrenty)
        .input('refundable', sql.VarChar(50), refundable)
        .input('Product_code', sql.VarChar, Product_code) // Using the existing record ID
        .query(updateQuery);

      return res.status(200).json({ message: "Record updated successfully!" });
    }



    // SQL Insert Query
    const query = `
      INSERT INTO Spare_partprice (
        Product_code, Product_descV1, Item, item_description, Manufactured, Qty,
        Price_group, status, Product_type, Model, Index_num,
        part_nature, warrenty, refundable, created_date, created_by
      )
      VALUES (
        @Product_code, @Product_descV1, @Item, @item_description, @Manufactured, @Qty,
        @Price_group, @status, @Product_type, @Model, @Index_num,
        @part_nature, @warrenty, @refundable, @created_date, @created_by
      )
    `;

    // Execute the query
    await pool.request()
      .input('Product_code', sql.VarChar(50), Product_code)
      .input('Product_descV1', sql.Text, Product_descV1)
      .input('Item', sql.VarChar(50), Item)
      .input('item_description', sql.Text, item_description)
      .input('Manufactured', sql.VarChar(50), Manufactured)
      .input('Qty', sql.VarChar(50), Qty)
      .input('Price_group', sql.VarChar(50), Price_group)
      .input('status', sql.VarChar(50), status)
      .input('Product_type', sql.VarChar(50), Product_type)
      .input('Model', sql.VarChar(50), Model)
      .input('Index_num', sql.VarChar(50), Index_num)
      .input('part_nature', sql.VarChar(50), part_nature)
      .input('warrenty', sql.VarChar(50), warrenty)
      .input('refundable', sql.VarChar(50), refundable)
      .input('created_date', sql.DateTime, new Date())
      .input('created_by', sql.VarChar(50), '1') // Assuming '1' is the created_by ID
      .query(query);

    res.status(201).json({ message: "Record inserted successfully!" });
  } catch (err) {
    console.error("Error inserting record:", err);
    res.status(500).json({ error: "Failed to insert record", details: err.message });
  }
});




module.exports = app;