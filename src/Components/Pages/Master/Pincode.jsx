import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';


const Pincode = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [geoStates, setGeoStates] = useState([]);
  const [geoCities, setGeoCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredPincodes, setFilteredPincodes] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [formData, setFormData] = useState({
    pincode: '',
    country_id: '',
    region_id: '',
    geostate_id: '',
    geocity_id: '',
    area_id: ''
  });

  useEffect(() => {
    fetchCountries();
    fetchPincodes();
  }, []);

  const fetchData = async (url, setStateFunction, errorMessage) => {
    try {
      const response = await axios.get(url);
      setStateFunction(response.data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };

  const fetchCountries = () => fetchData(`${Base_Url}/getcountries`, setCountries, 'Error fetching countries:');
  const fetchRegions = (countryId) => fetchData(`${Base_Url}/getregions/${countryId}`, setRegions, 'Error fetching regions:');
  const fetchGeoStates = (regionId) => fetchData(`${Base_Url}/getgeostates/${regionId}`, setGeoStates, 'Error fetching geo states:');
  const fetchGeoCities = (geostate_id) => fetchData(`${Base_Url}/getgeocities_a/${geostate_id}`, setGeoCities, 'Error fetching geo cities:');
  const fetchAreas = (geocity_id) => fetchData(`${Base_Url}/getareas/${geocity_id}`, setAreas, 'Error fetching areas:');
  const fetchPincodes = () => fetchData(`${Base_Url}/getpincodes`, (data) => {
    setPincodes(data);
    setFilteredPincodes(data);
  }, 'Error fetching pincodes:');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDuplicateError('');

    try {
      const confirmSubmission = window.confirm('Do you want to submit the data?');
      if (confirmSubmission) {
        const url = isEdit ? `${Base_Url}/putpincode` : `${Base_Url}/postpincode`;
        const method = isEdit ? axios.put : axios.post;
        await method(url, formData);
        setFormData({ title: '',
          pincode: '',
         country_id: '',
         region_id: '',
         geostate_id: '',
         geocity_id: '',
         area_id: ''
                       })
         fetchPincodes();
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setDuplicateError('Duplicate entry, Pincode already exists!');
      } else {
        console.error('Error during form submission:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'country_id') fetchRegions(value);
      if (name === 'region_id') fetchGeoStates(value);
      if (name === 'geostate_id') fetchGeoCities(value);
      if (name === 'geocity_id') fetchAreas(value);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredPincodes(
      pincodes.filter((pincode) =>
        Object.values(pincode).some(value => 
          value && value.toString().toLowerCase().includes(searchValue)
        )
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['pincode', 'country_id', 'region_id', 'geostate_id', 'geocity_id', 'area_id'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace('_id', '').charAt(0).toUpperCase() + field.replace('_id', '').slice(1)} is required.`;
      }
    });
    return newErrors;
  };

  const deleted = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this pincode?')) {
        await axios.post(`${Base_Url}/deletepincode`, { id });
        setFormData({ title: '',
          pincode: '',
         country_id: '',
         region_id: '',
         geostate_id: '',
         geocity_id: '',
         area_id: ''
                       })
          fetchPincodes();
      }
    } catch (error) {
      console.error('Error deleting pincode:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestpincode/${id}`);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      fetchGeoCities(response.data.geostate_id);
      fetchAreas(response.data.geocity_id);
      setIsEdit(true);
    } catch (error) {
      console.error('Error editing pincode:', error);
    }
  };

  const renderDropdown = (name, options, label) => (
    <div className="form-group">
      <label htmlFor={name}  className="form-label pb-0 dropdown-label" >{label}</label>

      <select
        className="form-select dropdown-select"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.title}
          </option>
        ))}
      </select>
      {errors[name] && <small className="text-danger">{errors[name]}</small>}
    </div>
  );

  return (
    <div className="row mp0" >
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div className="card-body" style={{flex: "1 1 auto",padding: "13px 28px"}}>
            <div className="row mp0">
              <div className="col-6">   
                <form onSubmit={handleSubmit} style={{width:"50%"}} className="text-left">
                  {renderDropdown("country_id", countries, "Country")}
                  {renderDropdown("region_id", regions, "Region")}
                  {renderDropdown("geostate_id", geoStates, "Geo State")}
                  {renderDropdown("geocity_id", geoCities, "Geo City")}
                  {renderDropdown("area_id", areas, "Area")}
                  
                  <div className="mb-3">
                      <label htmlFor="pincodeInput" className="input-field" >
                        Add Pincode
                      </label>
                          <input
                            type="text"
                            className="form-control"
                            name="pincode"
                            id="pincodeInput"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Enter Pincode"
                            maxLength={6}
                          />
                          {errors.pincode && <small className="text-danger">{errors.pincode}</small>}
                          {duplicateError && <small className="text-danger">{duplicateError}</small>}
                  </div>
                  <div className="text-right">
                      <button className="btn btn-liebherr" type="submit" >
                        {isEdit ? 'Update' : 'Submit'}
                      </button>
                  </div>
                </form>
              </div>

              <div className="col-6">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>
                    Show
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="form-control d-inline-block"
                      style={{
                        width: '51px',
                        display: 'inline-block',
                        margin: '0 5px',
                      }}
                    >
                      {[10, 15, 20].map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
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

                <table id="basic-datatable" className="table table-bordered table dt-responsive nowrap w-100 table-css">
                  <thead>
                    <tr>
                      <th scope="col" width="10%">#</th>
                      <th scope="col">Country</th>
                      <th scope="col">Region</th>
                      <th scope="col">Geo State</th>
                      <th scope="col">Geo City</th>
                      <th scope="col">Area</th>
                      <th scope="col">Pincode</th>
                      <th scope="col" width="15%" style={{textAlign: 'center'}}>Edit</th>
                      <th scope="col" width="15%" style={{textAlign: 'center'}}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPincodes
                      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                      .map((pincode, index) => (
                        <tr key={pincode.id}>
                          <td style={{ padding: '10px', textAlign: 'center', width: '30px' }}>
                            {currentPage * itemsPerPage + index + 1}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.country_title}</td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.region_title}</td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.geostate_title}</td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.geocity_title}</td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.area_title}</td>
                          <td style={{ padding: '10px', textAlign: 'center', minWidth: '70px' }}>{pincode.pincode}</td>
                          <td style={{ padding: '10px', textAlign: 'center', width: '30px' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => edit(pincode.id)}
                              style={{
                                fontSize: '14px',
                                color: 'blue',
                                background: 'transparent',
                              }}
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center', width: '30px' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => deleted(pincode.id)}
                              style={{
                                fontSize: '14px',
                                color: 'red',
                                background: 'transparent',
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div>
                  Showing {(currentPage * itemsPerPage) + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredPincodes.length)} of {filteredPincodes.length} entries
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pincode;