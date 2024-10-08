import React, { useState, useEffect } from 'react';
CC

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
  const [users, setUsers] = useState([]);     // Sabhi users ke data ko store karne ke liye - Listing ke Liye 
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
 