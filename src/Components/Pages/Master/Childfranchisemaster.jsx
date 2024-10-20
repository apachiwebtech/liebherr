import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Childfranchisemaster = () => {
 // Step 1: Add this state to track errors
  const [Parentfranchise, setParentfranchise] = useState([]);
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
    pfranchise_id: ''
  });

  const fetchParentfranchise = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getparentfranchise`);
      console.log(response.data); 
      setParentfranchise(response.data); 
    } catch (error) {
      console.error('Error fetching Parentfranchise:', error); 
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getchildfranchise`);
      console.log(response.data); 
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchParentfranchise();
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
        newErrors.title = "Child Franchise Field is required."; 
      }

       // Check if the pfranchise_id is empty
      if (!formData.pfranchise_id) {
        newErrors.pfranchise_id = "Parent Franchise selection is required.";
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
              await axios.put(`${Base_Url}/putchildfranchise`, { ...formData })
                .then(response => {
                  setFormData({
                    title: '',
                pfranchise_id: ''
                              })
                    fetchUsers();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Child Franchise already exists!'); // Show duplicate error for update
                  }
                });
            } else {
              // For insert, include duplicate check
              await axios.post(`${Base_Url}/postchildfranchise`, { ...formData })
                .then(response => {
                  setFormData({
                    title: '',
                pfranchise_id: ''
                              })
                    fetchUsers();
                })
                .catch(error => {
                  if (error.response && error.response.status === 409) {
                    setDuplicateError('Duplicate entry, Child Franchise already exists!'); // Show duplicate error for insert
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
      const response = await axios.post(`${Base_Url}/deletechildfranchise`, { id });
      setFormData({
        title: '',
    pfranchise_id: ''
                  })
        fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestchildfranchise/${id}`);
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
           {/* Step 2.1: Parent Franchise Dropdown */}
           <div className="form-group">
              <label htmlFor="Parent Franchise" className="form-label pb-0 dropdown-label">Parent Franchise</label>
              <select className='form-select dropdown-select' name='pfranchise_id' value={formData.pfranchise_id} onChange={handleChange} >
                <option value="">Select Parent Franchise</option>
                {Parentfranchise.map((pf) => (
                  <option key={pf.id} value={pf.id}>{pf.title}</option>
                ))}
              </select>
              {errors.pfranchise_id && <small className="text-danger">{errors.pfranchise_id}</small>} {/* Show error for Parent Franchise selection */}
            </div>
            {/* Step 2.2: Child Franchise Master Input */}
          <div className="form-group">
            <label htmlFor="ChildFranchiseMasterInput" className="input-field" style={{marginBottom: '15style={{ mapx', fontSize: '18px' }}>Add Child Franchise Master</label>
            <input
              type="text"
              className="form-control"
              name="title"
              id="ChildFranchiseMasterInput"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Child Franchise Master"
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
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
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Parent Franchise</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Child Franchise</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((item, index) => (
              <tr key={item.id}>
                <td style={{ padding: '2px', textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                <td style={{ padding: '10px' }}>{item.parentfranchise_title}</td>
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

export default Childfranchisemaster;
