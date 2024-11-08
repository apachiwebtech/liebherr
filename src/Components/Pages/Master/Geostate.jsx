import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Geostate = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]); // State for regions
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
    country_id: '',
    region_id: '' 
  });

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcountries`);
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };



  const fetchRegions = async (countryId) => {
    try {
      const response = await axios.get(`${Base_Url}/getregion/${countryId}`); // API to fetch regions based on country_id
      setRegions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getgeostates`); // This should be updated to fetch from your geostate table if necessary
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchUsers();
    fetchRegions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Fetch regions when country is selected
    if (name === 'country_id') {
      fetchRegions(value); // Fetch regions for the selected country
    //   setFormData({ ...formData, region_id: '' }); // Reset region_id when country changes
    }
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Geo State Field is required.";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Country selection is required.";
    }
    if (!formData.region_id) { // Validation for region_id
      newErrors.region_id = "Region selection is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setDuplicateError('');
    
    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          await axios.put(`${Base_Url}/putgeostate`, { ...formData })
            .then(response => {
              setFormData({
                title: '',
            country_id: '',
              region_id: '' 
                        })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Geo State already exists!');
              }
            });
        } else {
          await axios.post(`${Base_Url}/postgeostate`, { ...formData })
            .then(response => {
              setFormData({
                title: '',
            country_id: '',
               region_id: '' 
                        })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Geo State already exists!');
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
      await axios.post(`${Base_Url}/deletegeostate`, { id });
      setFormData({
        title: '',
    country_id: '',
       region_id: '' 
                })
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestgeostate/${id}`);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      console.log("ddtttttt",response.data);
      console.log("ddddd",response.data.country_id);
      setIsEdit(true);
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
          {/* Country Dropdown */}
          <div className="form-group">
            <label htmlFor="country" className="form-label pb-0 dropdown-label">Country</label>
            <select className='form-select dropdown-select' name='country_id' value={formData.country_id} onChange={handleChange}>
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>{country.title}</option>
              ))}
            </select>
            {errors.country_id && <small className="text-danger">{errors.country_id}</small>}
          </div>

          {/* Region Dropdown */}
          <div className="form-group">
            <label htmlFor="region" className="form-label pb-0 dropdown-label">Region</label>
            <select className='form-select dropdown-select' name='region_id' value={formData.region_id} onChange={handleChange}>
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.title}</option>
              ))}
            </select>
            {errors.region_id && <small className="text-danger">{errors.region_id}</small>} {/* Show error for region selection */}
          </div>

          {/* Region Input */}
          <div className="form-group">
            <label htmlFor="geoStateInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Geo State</label>
            <input
              type="text"
              className="form-control"
              name="title"
              id="geostateInput"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Geo State"
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
            {duplicateError && <small className="text-danger">{duplicateError}</small>}
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
              style={{ width: '51px', display: 'inline-block', marginLeft: '5px', marginRight: '5px' }}
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

        <table className='table table-bordered' style={{ marginTop: '20px', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Country</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Region</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Geo State</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Edit</th>
              <th style={{ padding: '0px 0px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user.id}>
                <td style={{ textAlign: 'center' }}>{index + 1 + indexOfFirstUser}</td>
                <td style={{ textAlign: 'center' }}>{user.country_title}</td>
                <td style={{ textAlign: 'center' }}>{user.region_title}</td>
                <td style={{ textAlign: 'center' }}>{user.title}</td>
                <td style={{ textAlign: 'center' }}>
                  <FaPencilAlt style={{ cursor: 'pointer', color: 'blue' }} onClick={() => edit(user.id)} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => deleted(user.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center">
          <span>
            Showing {currentUsers.length} of {filteredUsers.length} entries
          </span>
          <nav>
            <ul className="pagination">
              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, i) => (
                <li className={`page-item ${i === currentPage ? 'active' : ''}`} key={i}>
                  <button className="page-link" onClick={() => setCurrentPage(i)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Geostate;