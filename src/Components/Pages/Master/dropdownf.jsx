import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Test = () => {
  // Step 1: Insert - Initial form data ke liye state banate hain
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    address: '',
    country_id: '',  // Country field
    state_id: ''     // State field
  });

  // Step 2: Listing - Users, Countries, States ko display karne ke liye state banate hain
  const [users, setUsers] = useState([]);     // Sabhi users ke data ko store karne ke liye
  const [countries, setCountries] = useState([]); // Countries ko store karne ke liye
  const [states, setStates] = useState([]);   // Selected country ke basis par states ko store karne ke liye
  const [isEdit, setIsEdit] = useState(false); // Edit mode ko track karne ke liye

  // Step 2.1: Fetch countries - Server se countries data ko fetch kar rahe hain
  const fetchCountries = async () => {
    try {
      const response = await axios.get('http://localhost:8081/getcountries');
      setCountries(response.data); // Countries data ko set kar rahe hain
    } catch (error) {
      console.error('Error fetching countries:', error); // Agar error aata hai to console me print karenge
    }
  };

  // Step 2.2: Fetch states based on selected country - Jab country select hoti hai to states ko fetch karte hain
  const fetchStates = async (country_id) => {
    try {
      const response = await axios.get(`http://localhost:8081/getstates/${country_id}`);
      setStates(response.data); // States data ko set kar rahe hain
    } catch (error) {
      console.error('Error fetching states:', error); // Error ko console me show karenge
    }
  };

  // Step 2.3: Fetch users - Sabhi users ko list karne ke liye data fetch karte hain
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8081/getdata');
      setUsers(response.data); // Users ka data set karte hain
    } catch (error) {
      console.error('Error fetching users:', error); // Agar koi error ho to print karte hain
    }
  };

  // Component ke render hone par countries aur users ko fetch karte hain
  useEffect(() => {
    fetchUsers();      // Step 2: Listing - Users ko fetch karte hain
    fetchCountries();  // Step 2.1: Countries ko fetch karte hain
  }, []);

  // Input change ko handle karne ke liye function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'country_id') {
      fetchStates(value); // Step 2.2: Country select hone par states fetch kar rahe hain
    }
  };

  // Step 1: Insert / Step 3.2: Update - Form submit karte hain
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      
      if (confirmSubmission) {
        let response;
  
        if (isEdit) {
          // Step 3.2: Update - Existing user ko update karte hain
          response = await axios.put('http://localhost:8081/putdata', { ...formData });
          console.log('Data updated successfully:', response.data);
        } else {
          // Step 1: Insert - Naye user ka data insert karte hain
          response = await axios.post('http://localhost:8081/postdata', { ...formData });
          console.log('Data inserted successfully:', response.data);
        }
  
        // Data submit hone ke baad page ko reload karte hain
        window.location.href = 'http://localhost:3000/test';
      }
    } catch (error) {
      console.error('Error during form submission:', error); // Agar error hota hai to console me print karte hain
    }
  };

  // Step 4: Delete - User ko soft delete karte hain
  const deleted = async (id) => {
    try {
      const response = await axios.post(`http://localhost:8081/deletedata`, { id });
      alert(response.data);
      window.location.href = 'http://localhost:3000/test'; // Delete hone ke baad page reload karte hain
    } catch (error) {
      console.error('Error:', error); // Agar error ho to print karte hain
    }
  };

  // Step 3: Edit - User data ko edit karne ke liye form ko populate karte hain
  const edit = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8081/requestdata/${id}`);
      setFormData(response.data); // Step 3.1: Form fields me data ko populate karte hain
      setIsEdit(true); // Step 3.1: Edit mode ko enable karte hain
      fetchStates(response.data.country_id); // Selected country se states ko fetch karte hain
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error); // Error ko handle karte hain
    }
  };

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <div className='container-fluid d-flex' style={{ width: '1000px', height: '400px' }}>
        <div className="col-md-6 p-5 m-1 shadow">
          <h5 className='text-center'>This is CRUD App</h5>
          
          {/* Step 1: Insert / Step 3.2: Update - Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" className='form-control' name='username' value={formData.username} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" className='form-control' name='password' value={formData.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea name="address" className='form-control' value={formData.address} onChange={handleChange}></textarea>
            </div>
            {/* Step 2.1: Country Dropdown */}
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select className='form-control' name='country_id' value={formData.country_id} onChange={handleChange}>
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.name}</option>
                ))}
              </select>
            </div>
            {/* Step 2.2: State Dropdown */}
            <div className="form-group">
              <label htmlFor="state">State</label>
              <select className='form-control' name='state_id' value={formData.state_id} onChange={handleChange}>
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group mt-2">
              <button type="submit" className='btn btn-primary'>{isEdit ? 'Update' : 'Submit'}</button>
            </div>
          </form>
        </div>
        
        {/* Step 2: Listing - Users table */}
        <div className="col-md-6 p-5 m-1 shadow">
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Password</th>
                <th>Address</th>
                <th>Country</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td>{user.address}</td>
                  <td>{user.country_id}</td>
                  <td>{user.state_id}</td>
                  <td>
                    {/* Step 3: Edit button */}
                    <button className='btn btn-warning' onClick={() => edit(user.id)}>Edit</button>
                    {/* Step 4: Delete button */}
                    <button className='btn btn-danger' onClick={() => deleted(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
       

        </div>
      </div>
    </div>
  );
};

export default Test;



























// Necessary modules ko import kar rahe hain
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
  database: 'crud' // Database ka naam jisme hum data ko store kar rahe hain ('crud')
});

// API banate hain jo sabhi countries ko fetch karega
app.get('/getcountries', (req, res) => {
  const sql = 'SELECT * FROM countries'; // Countries table se sabhi records ko fetch karne ke liye SQL query likh rahe hain
  con.query(sql, (err, data) => { // SQL query ko execute kar rahe hain
    if (err) {
      return res.status(500).json(err); // Agar koi error aata hai to 500 status ke sath error message return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to countries ka data JSON format me return karenge
    }
  });
});

// API banate hain jo kisi specific country ke states ko fetch karega
app.get('/getstates/:country_id', (req, res) => {
  const { country_id } = req.params; // URL se country_id ko extract kar rahe hain
  const sql = 'SELECT * FROM states WHERE country_id = ?'; // States table se country_id ke base par states ko fetch karne ki SQL query
  con.query(sql, [country_id], (err, data) => { // SQL query ko execute kar rahe hain, aur country_id ko parameter ke roop me pass kar rahe hain
    if (err) {
      return res.status(500).json(err); // Agar koi error aata hai to 500 status ke sath error message return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to states ka data JSON format me return karenge
    }
  });
});

// API jo sabhi users ko fetch karegi jinhone soft delete nahi kiya gaya hai
app.get('/getdata', (req, res) => {
  const sql = "SELECT * FROM users WHERE deleted = 0"; // Users table se sabhi users ko fetch karne ki query jinke 'deleted' column me 0 hai
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
  const sql = "SELECT * FROM users WHERE id = ? AND deleted = 0"; // User ko uske ID aur soft-delete status ke base par fetch karne ki query
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
  const { username, password, address, country_id, state_id } = req.body; // Request body se user ke data ko extract kar rahe hain
  const sql = `INSERT INTO users (username, password, address, country_id, state_id) VALUES (?, ?, ?, ?, ?)`; // User data ko database me insert karne ki SQL query
  con.query(sql, [username, password, address, country_id, state_id], (err, data) => { // SQL query ko execute kar rahe hain, user ke data ko parameters ke roop me pass kar rahe hain
    if (err) {
      return res.json(err); // Agar koi error aata hai to error message return karenge
    } else {
      return res.json({ message: 'User added successfully!' }); // Agar query successful hoti hai to success message return karenge
    }
  });
});

// API jo user ke data ko update karegi
app.put('/putdata', (req, res) => {
  const { username, password, address, country_id, state_id, id } = req.body; // Request body se updated user ke data ko extract kar rahe hain
  const sql = `UPDATE users SET username = ?, password = ?, address = ?, country_id = ?, state_id = ? WHERE id = ?`; // User ke data ko update karne ki SQL query
  con.query(sql, [username, password, address, country_id, state_id, id], (err, data) => { // SQL query ko execute kar rahe hain, updated user ke data ko parameters ke roop me pass kar rahe hain
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
  const sql = `UPDATE users SET deleted = 1 WHERE id = ?`; // User ko soft-delete karne ki SQL query (deleted column ko 1 kar dena)
  con.query(sql, [id], (err, data) => { // SQL query ko execute kar rahe hain, id ko parameter ke roop me pass kar rahe hain
    if (err) {
      console.error(err); // Agar koi error aata hai to usse console me print karenge
      return res.status(500).json({ message: 'Error updating user' }); // Error message ke sath 500 status return karenge
    } else {
      return res.json(data); // Agar query successful hoti hai to updated data return karenge
    }
  });
});

// Express server ko port 8081 par run karte hain
app.listen(8081, () => {
  console.log('Server is running on http://localhost:8081'); // Console me message print kar rahe hain jab server successfully start ho jata hai
});
 