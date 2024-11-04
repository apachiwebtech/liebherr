import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const EngineerMaster = () => {
 // Step 1: Add this state to track errors
  const [Childfranchise, setChildfranchise] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState(''); 


  const [formData, setFormData] = useState({ 
    title: '',
    cfranchise_id: '',
    password: '',
    email: '',
    mobile_no: '',
  });

  const fetchChildfranchise = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getchildfranchise`);
      console.log(response.data); 
      setChildfranchise(response.data); 
    } catch (error) {
      console.error('Error fetching Childfranchise:', error); 
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getengineer`);
      console.log(response.data); 
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchChildfranchise();
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
      const newErrors = {}; 
      if (!formData.title.trim()) { 
        newErrors.title = "Engineer Name Field is required."; 
      }

       // Check if the cfranchise_id is empty
      if (!formData.cfranchise_id) {
        newErrors.cfranchise_id = "Child Franchise selection is required.";
      }
      if (!formData.email) {
        newErrors.email = "Engineer Email Field is required.";
      }
      if (!formData.mobile_no) {
        newErrors.mobile_no = "Engineer Mobile No Field is required.";
      }
      if (!formData.password) {
        newErrors.password = "Engineer Password Field is required.";
      }
      return newErrors; 
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
              await axios.put(`${Base_Url}/putengineer`, { ...formData })
                .then(response => {
                  console.log(response.data)
                  setFormData({
                    title: '',
                    cfranchise_id: '',
                    password: '',
                    email: '',
                    mobile_no: ''
                              })
                    fetchUsers();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for update
                  }
                });
            } else {
              // For insert, include duplicate check
              await axios.post(`${Base_Url}/postengineer`, { ...formData })
                .then(response => {
                  setFormData({
                    title: '',
                    cfranchise_id: '',
                    password: '',
                    email: '',
                    mobile_no: ''
                              })
                    fetchUsers();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for insert
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
      const response = await axios.post(`${Base_Url}/deleteengineer`, { id });
      setFormData({
        title: '',
    cfranchise_id: ''
                  })
        fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
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
    <div className="row mp0" >
    <div className="col-12">
      <div className="card mb-3 tab_box">
        <div className="card-body" style={{flex: "1 1 auto",padding: "13px 28px"}}>
          <div className="row mp0">
            <div className="col-6">  
      <form onSubmit={handleSubmit} style={{width:"50%"}} className="text-left">
           {/* Step 2.1: Child Franchise Dropdown */}
           <div className="form-group">
              <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">Child Franchise</label>
              <select className='form-select dropdown-select' name='cfranchise_id' value={formData.cfranchise_id} onChange={handleChange} >
                <option value="">Select Child Franchise</option>
                {Childfranchise.map((pf) => (
                  <option key={pf.id} value={pf.id}>{pf.title}</option>
                ))}
              </select>
              {errors.cfranchise_id && <small className="text-danger">{errors.cfranchise_id}</small>} {/* Show error for Child Franchise selection */}
            </div>
            {/* Step 2.2: Engineer Master Input */}
          <div className="form-group">
            <label htmlFor="EngineerNameInput" className="input-field" style={{marginBottom: '15style={{ mapx', fontSize: '18px' }}> Engineer Name</label>
            <input
              type="text"
              className="form-control"
              name="title"
              id="EngineerNameInput"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Engineer Name"
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
           
          </div>
                    <div className="form-group">
                        <label htmlFor="emailInput" className="input-field" style={{marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Email</label>
                        <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="emailInput"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Engineer Email"
                        />
                        {errors.email && <small className="text-danger">{errors.email}</small>}
                       
                    </div>
                    <div className="form-group">
                                <label
                                  htmlFor="mobile_noInput"
                                  className="input-field"
                                  style={{ marginBottom: '15px', fontSize: '18px' }}
                                >
                                  Engineer Mobile No
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="mobile_no"
                                  id="mobile_noInput"
                                  value={formData.mobile_no}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (!isNaN(value)) {
                                      if (value.length <= 15) {
                                        handleChange(e);
                                      }
                                    }
                                  }}
                                  placeholder="Enter Engineer Mobile No"
                                  pattern="[0-9]*"
                                  maxLength="15"
                                />
                                {formData.mobile_no.length > 0 && formData.mobile_no.length < 10 && (
                                  <small className="text-danger">Mobile number must be at least 10 digits</small>
                                )}
                                {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                               
                     </div>

                             <div className="form-group">
                                <label htmlFor="passwordInput" className="input-field" style={{marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Password</label>
                                <input
                                type="password"
                                className="form-control"
                                name="password"
                                id="passwordInput"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter Engineer Password"
                                />
                                {errors.password && <small className="text-danger">{errors.password}</small>}
                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                            </div>
          <div className="text-right">
          <button className="btn btn-liebherr" type="submit" style={{ marginTop: '15px' }}>
            {isEdit ? "Update" : "Submit"}
          </button>
          </div>
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
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Child Franchise</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Engineer</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                <td style={{ padding: '10px' }}>{item.childfranchise_title}</td>
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
    </div>
    </div>
    </div>
    </div>
  );
};

export default EngineerMaster;
 