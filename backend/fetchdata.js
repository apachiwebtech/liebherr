

// This is for gettiing data from the another database

const API_KEY = "satyam_123";


app.post("/fetchproductmaster", async (req, res) => {

  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }

  const { item_code, ModelNumber, product_model, product_type, product_class_code, product_class, product_line_code, product_line, material, manufacturer, item_type, serialized, size, crmproducttype, colour, handle_type, serial_identification, installation_type, customer_classification, price_group, mrp, service_partner_basic } = req.body;


  try {
    const pool = await poolPromise;
    // SQL query to insert a new complaint remark
    const sql = `INSERT INTO product_master (
  serial_no, item_code, item_description, productType, productLineCode, productLine,
  productClassCode, productClass, material, manufacturer, itemType, serialized,
  sizeProduct, crm_productType, color, installationType, handleType, customerClassification,
  price_group, mrp, service_partner_basic)
VALUES (
  @serial_identification, @item_code, @item_description, @product_type, @product_line_code,
  @product_line, @product_class_code, @product_class, @material, @manufacturer, @item_type,
  @serialized, @size, @crmproducttype, @colour, @installation_type, @handle_type,
  @customer_classification, @price_group, @mrp, @service_partner_basic
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
      .input('service_partner_basic', service_partner_basic);



    const result = await request.query(sql);

    res.json({ insertId: result.rowsAffected[0] }); // Send the inserted ID back to the client
  } catch (err) {
    console.error("Error inserting remark:", err);
    return res.status(500).json({ error: "Database error", details: err.message }); // Send back more details for debugging
  }
});


app.post("/fetchcustomermaster", async (req, res) => {

  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }


  const {
    customer_fname,
    customer_lname,
    customer_type,
    customer_classification,
    mobileno,
    alt_mobileno,
    dateofbirth,
    anniversary_date,
    email,
    salutation,
    customer_id
  } = req.body;

  try {
    // Use the poolPromise to get the connection pool
    const pool = await poolPromise;

    // Step 1: Check for duplicates using parameterized query
    const checkDuplicateSql = `
      SELECT * FROM awt_customer
      WHERE customer_id = @customer_id
      AND deleted = 0
    `;
    const checkDuplicateResult = await pool.request()
      .input('customer_id', customer_id)
      .query(checkDuplicateSql);

    // If a duplicate customer is found
    if (checkDuplicateResult.recordset.length > 0) {
      return res.status(409).json({
        message: "Duplicate entry, Customer with the same Customer_id already exists!"
      });
    }

    // Step 2: Insert the customer if no duplicate is found
    const insertSql = `
      INSERT INTO awt_customer (
        customer_fname,
        customer_lname,
        customer_type,
        customer_classification,
        mobileno,
        alt_mobileno,
        dateofbirth,
        anniversary_date,
        email,
        salutation,
        customer_id
      ) VALUES (
        @customer_fname,
        @customer_lname,
        @customer_type,
        @customer_classification,
        @mobileno,
        @alt_mobileno,
        @dateofbirth,
        @anniversary_date,
        @email,
        @salutation,
        @customer_id
      )
    `;

    // Execute the insert query
    await pool.request()
      .input('customer_fname', customer_fname)
      .input('customer_lname', customer_lname)
      .input('customer_type', customer_type)
      .input('customer_classification', customer_classification)
      .input('mobileno', mobileno)
      .input('alt_mobileno', alt_mobileno)
      .input('dateofbirth', dateofbirth)
      .input('anniversary_date', anniversary_date)
      .input('email', email)
      .input('salutation', salutation)
      .input('customer_id', customer_id)
      .query(insertSql);

    // Send success response
    return res.status(201).json({
      message: "Customer master added successfully",
    });

  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ error: "Database error occurred" });
  }
});

app.post("/fetchlhiusers", async (req, res) => {


  const apiKey = req.header('x-api-key'); // Get API key from request header

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key' });
  }


  const { Lhiuser,
    mobile_no,
    Password,
    UserCode,
    email,
    remarks,
    status,
  } = req.body;



  try {
    const pool = await poolPromise;

    // Step 1: Check if the same Lhiuser exists and is not soft-deleted
    let sql = `SELECT * FROM lhi_user WHERE  Usercode = '${UserCode}' AND deleted = 0`;
    const result = await pool.request().query(sql);

    if (result.recordset.length > 0) {
      // If duplicate data exists (not soft-deleted)
      return res.status(409).json({ message: "Duplicate entry, Lhiuser already exists!" });
    } else {
      
      sql = `INSERT INTO lhi_user (Lhiuser,password,remarks,Usercode,mobile_no,email,status) VALUES ('${Lhiuser}','${Password}','${remarks}','${UserCode}','${mobile_no}','${email}','${status}')`
      await pool.request().query(sql);

      return res.json({ message: "Lhiuser added successfully!" });
  
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "An error occurred while processing the request" });
  }
});

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