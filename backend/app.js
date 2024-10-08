
const { createPool } = require('mysql'); // MySQL ke liye connection pool banane ke liye mysql module import kar rahe hain
const express = require('express'); // Express framework ko import kar rahe hain jo HTTP requests aur responses ko handle karega
const app = express(); // Express application ka instance bana rahe hain
const cors = require('cors'); // Cross-Origin Resource Sharing (CORS) ko manage karne ke liye cors module ko import kar rahe hain

// Middleware setup kar rahe hain
app.use(cors({ origin: '*' })); // CORS ko sabhi domains ke liye enable kar rahe hain taaki koi bhi external website API ko access kar sake
app.use(express.json()); // JSON requests ko parse kar rahe hain taaki req.body se data access kar sake

// Database connection setup kar rahe hain
const con = createPool({
  host: 'localhost', // MySQL ke server ka host address (local development ke liye 'localhost')
  user: 'root', // MySQL user ka username (default XAMPP ya local server ke liye 'root')
  password: '', // MySQL user ka password (local server me aksar blank hota hai)
  database: 'liebherr' // Database ka naam jisme hum data ko store kar rahe hain ('crud')
});


// API jo sabhi users ko fetch karegi jinhone soft delete nahi kiya gaya hai
app.get('/getdata', (req, res) => {
  const sql = "SELECT * FROM awt_country WHERE deleted = 0"; // Users table se sabhi users ko fetch karne ki query jinke 'deleted' column me 0 hai
  con.query(sql, (err, data) => { // SQL query ko execute kar rahe hain
    if (err) {
      return res.json(err); // Agar koi error aata hai to error message return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to users ka data JSON format me return karenge
    }
  });
});

// API jo specific user ko uske ID ke base par fetch karegi
app.get('/requestdata/:id', (req, res) => {
  const { id } = req.params; // URL se user ki id ko extract kar rahe hain
  const sql = "SELECT * FROM awt_country WHERE id = ? AND deleted = 0"; // User ko uske ID aur soft-delete status ke base par fetch karne ki query
  con.query(sql, [id], (err, data) => { // SQL query ko execute kar rahe hain, id ko parameter ke roop me pass kar rahe hain
    if (err) {
      return res.status(500).json(err); // Agar koi error aata hai to 500 status ke sath error message return karenge
    } else {
      return res.json(data[0]); // Agar query successful hoti hai to specific user ka data (index 0) return karenge
    }
  });
});

// API jo naye user ko insert karegi
app.post('/postdata', (req, res) => {
  const { title } = req.body; // Request body se user ke data ko extract kar rahe hain
  const sql = `INSERT INTO awt_country (title) VALUES (?)`; // User data ko database me insert karne ki SQL query
  con.query(sql, [title], (err, data) => { // SQL query ko execute kar rahe hain, user ke data ko parameters ke roop me pass kar rahe hain
    if (err) {
      return res.json(err); // Agar koi error aata hai to error message return karenge
    } else {
      return res.json({ message: 'User added successfully!' }); // Agar query successful hoti hai to success message return karenge
    }
  });
});

// API jo user ke data ko update karegi
app.put('/putdata', (req, res) => {
  const { title, id } = req.body; // Request body se updated user ke data ko extract kar rahe hain
  const sql = `UPDATE awt_country SET title = ? WHERE id = ?`; // User ke data ko update karne ki SQL query
  con.query(sql, [title, id], (err, data) => { // SQL query ko execute kar rahe hain, updated user ke data ko parameters ke roop me pass kar rahe hain
    if (err) {
      return res.json(err); // Agar koi error aata hai to error message return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to updated data return karenge
    }
  });
});

// API jo user ko soft-delete karegi (user ko remove nahi karegi, bas 'deleted' column me 1 mark karegi)
app.post('/deletedata', (req, res) => {
  const { id } = req.body; // Request body se user ki ID ko extract kar rahe hain
  const sql = `UPDATE awt_country SET deleted = 1 WHERE id = ?`; // User ko soft-delete karne ki SQL query (deleted column ko 1 kar dena)
  con.query(sql, [id], (err, data) => { // SQL query ko execute kar rahe hain, id ko parameter ke roop me pass kar rahe hain
    if (err) {
      console.error(err); // Agar koi error aata hai to usse console me print karenge
      return res.status(500).json({ message: 'Error updating user' }); // Error message ke sath 500 status return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to updated data return karenge
    }
  });
});


app.listen(8081, () => {
  console.log('Server is running on http://localhost:8081'); 
});
