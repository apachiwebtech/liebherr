import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Channelpartner = () => {
 // Step 1: Add this state to track errors
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState(''); // State to track duplicate error


  const [formData, setFormData] = useState({ 
    Channel_partner: ''
  });

  
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcdata`);
      console.log(response.data); 
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.Channel_partner && user.Channel_partner.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

   
    // Step 2: Add form validation function
    const validateForm = () => {
      const newErrors = {}; // Initialize an empty error object
      if (!formData.Channel_partner.trim()) { // Check if the Channel_partner is empty
        newErrors.Channel_partner = "Channelpartner Field is required."; // Set error message if Channel_partner is empty
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
              await axios.put(`${Base_Url}/putcdata`, { ...formData })
                .then(response => {
                  window.location.reload();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Channelpartner already exists!'); // Show duplicate error for update
                  }
                });
            } else {
              // For insert, include duplicate check
              await axios.post(`${Base_Url}/postcdata`, { ...formData })
                .then(response => {
                  window.location.reload();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Channelpartner already exists!'); // Show duplicate error for insert
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
      const response = await axios.post(`${Base_Url}/deletecdata`, { id });
      // alert(response.data[0]);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestcdata/${id}`);
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
          <div className="form-group">
            <label htmlFor="ChannelpartnerInput" style={{ marginBottom: '15px', fontSize: '18px' }}>Add Channel Partner</label>
            <input
              type="text"
              className="form-control"
              name="Channel_partner"
              id="ChannelpartnerInput"
              value={formData.Channel_partner}
              onChange={handleChange}
              placeholder="Enter Channelpartner"
            />
            {errors.Channel_partner && <small className="text-danger">{errors.Channel_partner}</small>}
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
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Channel partner</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                <td style={{ padding: '10px' }}>{item.Channel_partner}</td>
                <td style={{ padding: '0px', textAlign: 'center' }}>
                  <button
                    className='btn'
                    onClick={() => {
                      // alert(item.id)
                      edit(item.id)
                    }}
                    Channel_partner="Edit"
                    style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                  >
                    <FaPencilAlt />
                  </button>
                  </td>
                  <td style={{ padding: '0px', textAlign: 'center' }}>
                  <button
                    className='btn'
                    onClick={() => deleted(item.id)}
                    Channel_partner="Delete"
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

export default Channelpartner;
