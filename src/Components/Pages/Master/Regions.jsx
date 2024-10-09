import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Location = () => {
 // Step 1: Add this state to track errors
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState(''); // State to track duplicate error


  const [formData, setFormData] = useState({ 
    title: '',
    country_id: ''
  });

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcountries`);
      console.log(response.data); 
      setCountries(response.data); // Countries data ko set kar rahe hain
    } catch (error) {
      console.error('Error fetching countries:', error); // Agar error aata hai to console me print karenge
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getregions`);
      console.log(response.data); 
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.title && user.title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

   
    // Step 2: Add form validation function
    const validateForm = () => {
      const newErrors = {}; // Initialize an empty error object
      if (!formData.title.trim()) { // Check if the title is empty
        newErrors.title = "Region Field is required."; // Set error message if title is empty
      }

       // Check if the country_id is empty
      if (!formData.country_id) {
        newErrors.country_id = "Country selection is required."; // Set error message if no country is selected
      }
      return newErrors; // Return the error object
    };
  

      //handlesubmit form
      const handleSubmit = async (e) => {
        e.preventDefault();
      
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      
        setDuplicateError(''); // Clear duplicate error before submitting
      
        try {
          const confirmSubmission = window.confirm("Do you want to submit the data?");
          if (confirmSubmission) {
            if (isEdit) {
              // For update, include duplicate check
              await axios.put(`${Base_Url}/putregion`, { ...formData })
                .then(response => {
                  window.location.reload();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Region already exists!'); // Show duplicate error for update
                  }
                });
            } else {
              // For insert, include duplicate check
              await axios.post(`${Base_Url}/postregion`, { ...formData })
                .then(response => {
                  window.location.reload();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Region already exists!'); // Show duplicate error for insert
                  }
                });
            }
          }
        } catch (error) {
          console.error('Error during form submission:', error);
        }
      };
      

  const deleted = async (id) => {
    try {
      const response = await axios.post(`${Base_Url}/deleteregion`, { id });
      // alert(response.data[0]);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestregion/${id}`);
      setFormData(response.data)
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };


  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="row">
      <div className="col-md-6">
      <form onSubmit={handleSubmit}>
           {/* Step 2.1: Country Dropdown */}
           <div className="form-group">
              <label htmlFor="country">Country</label>
              <select className='form-control' name='country_id' value={formData.country_id} onChange={handleChange} >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>{country.title}</option>
                ))}
              </select>
              {errors.country_id && <small className="text-danger">{errors.country_id}</small>} {/* Show error for country selection */}
            </div>
            {/* Step 2.2: Region Input */}
          <div className="form-group">
            <label htmlFor="regionInput" style={{ marginBottom: '15px', fontSize: '18px' }}>Add Region</label>
            <input
              type="text"
              className="form-control"
              name="title"
              id="regionInput"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Region"
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
            {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
          </div>
          <button className="btn btn-primary btn-sm" type="submit" style={{ marginTop: '15px' }}>
            {isEdit ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      <div className="col-md-6">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="form-control d-inline-block"
              style={{ width: '51px', display: 'inline-block', marginLeft: '5px',marginRight: '5px' }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
            entries
          </span>

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="form-control d-inline-block"
            style={{ width: '300px' }}
          />
        </div>

        {/* Adjust table padding and spacing */}
        <table className='table table-bordered' style={{ marginTop: '20px', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Country</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Region</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                <td style={{ padding: '10px' }}>{item.country_title}</td>
                <td style={{ padding: '10px' }}>{item.title}</td>
                <td style={{ padding: '0px', textAlign: 'center' }}>
                  <button
                    className='btn'
                    onClick={() => {
                      // alert(item.id)
                      edit(item.id)
                    }}
                    title="Edit"
                    style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                  >
                    <FaPencilAlt />
                  </button>
                  </td>
                  <td style={{ padding: '0px', textAlign: 'center' }}>
                  <button
                    className='btn'
                    onClick={() => deleted(item.id)}
                    title="Delete"
                    style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between" style={{ marginTop: '10px' }}>
          <div>
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
          </div>

          <div className="pagination" style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              {'<'}
            </button>
            {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={currentPage === index ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage) - 1}
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
