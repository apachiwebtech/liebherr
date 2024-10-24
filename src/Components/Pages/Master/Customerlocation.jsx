import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Customerlocation = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [geoStates, setGeoStates] = useState([]);
  const [geoCities, setGeoCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    country_id: '',
    region_id: '',
    geostate_id: '',
    geocity_id: '', 
    area_id: '' 
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
      const response = await axios.get(`${Base_Url}/getregions/${countryId}`);
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchGeoStates = async (regionId) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeostates/${regionId}`);
      setGeoStates(response.data);
    } catch (error) {
      console.error('Error fetching geo states:', error);
    }
  };


    const fetchGeoCities = async (geostate_id) => {
        try {
        const response = await axios.get(`${Base_Url}/getgeocities_a/${geostate_id}`);
        console.log('Geo Cities:', response.data); // Add this line to debug
        setGeoCities(response.data);
        } catch (error) {
        console.error('Error fetching geo cities:', error);
        }
    };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getareas`);
      setAreas(response.data);
      setFilteredAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchAreas();
  }, []);

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
        if (isEdit) {
          await axios.put(`${Base_Url}/putarea`, { ...formData })
            .then((response) => {
              setFormData({ title: '',
                country_id: '',
                region_id: '',
                geostate_id: '',
                geocity_id: '', 
                area_id: '' 
                              })
                fetchAreas();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Area already exists!');
              }
            });
        } else {
          await axios.post(`${Base_Url}/postarea`, { ...formData })
            .then(response => {
              setFormData({ title: '',
                country_id: '',
                region_id: '',
                geostate_id: '',
                geocity_id: '', 
                area_id: '' 
                              })
                fetchAreas();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Area already exists!');
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    
        if (name === 'country_id') {
        fetchRegions(value);
        }
        if (name === 'region_id') {
        fetchGeoStates(value);
        }
        if (name === 'geostate_id') {
        fetchGeoCities(value); // Fetch Geo Cities when Geo State is selected
        }
    };
  

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredAreas(
      areas.filter((area) =>
        area.title.toLowerCase().includes(searchValue) ||
        area.country_title.toLowerCase().includes(searchValue) ||
        area.region_title.toLowerCase().includes(searchValue) ||
        area.geostate_title.toLowerCase().includes(searchValue)
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Area Field is required.';
    }
    if (!formData.country_id) {
      newErrors.country_id = 'Country selection is required.';
    }
    if (!formData.region_id) {
      newErrors.region_id = 'Region selection is required.';
    }
    if (!formData.geostate_id) {
      newErrors.geostate_id = 'Geo State selection is required.';
    }
    if (!formData.geocity_id) { // Validate Geo City
        newErrors.geocity_id = 'Geo City selection is required.';
    }
    return newErrors;
  };

  const deleted = async (id) => {
    try {
      await axios.post(`${Base_Url}/deletearea`, { id });
      setFormData({ title: '',
        country_id: '',
        region_id: '',
        geostate_id: '',
        geocity_id: '', 
        area_id: '' 
                      })
         fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestarea/${id}`);
      console.log(response.data)
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      fetchGeoCities(response.data.geostate_id);
      setIsEdit(true);
    } catch (error) {
      console.error('Error editing area:', error);
    }
  };

  return (
    <div className="row mp0">
            <div className="col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body">
                        <div className="row mp0">
                            <div className="col-6">
                                <form>
                                    <div className="row">
                                        <div className="col-md-12 mb-3">
                                            <label htmlFor="exampleFormControlTextarea1">Address</label>
                                            <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="country" className="form-label">Country</label>
                                            <select id="country" name="country_id" className="form-select" aria-label=".form-select-lg example" value={formData.country_id}
                                                 onChange={handleChange}>
                                                 <option value="">Select Country</option>
                                                {countries.map((country) => (
                                                    <option key={country.id} value={country.id}>
                                                    {country.title}
                                                    </option>
                                                ))}
                                            </select>
                                               
                                             
                                        

                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="region" className="form-label">Region</label>
                                            <select id="region" name="region" className="form-select" aria-label=".form-select-lg example">
                                                <option value="">Select Region</option>
                                                <option value="East">East</option>
                                                <option value="West">West</option>
                                                <option value="North">North</option>
                                                <option value="South">South</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="geostate" className="form-label">Geo State</label>
                                            <select id="geostate" name="geostate" className="form-select" aria-label=".form-select-lg example">
                                                <option value="">Select GEO State</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="geocity" className="form-label">Geo City</label>
                                            <select id="geocity" name="geocity" className="form-select" aria-label=".form-select-lg example">
                                                <option value="">Select GEO City</option>
                                                <option value="Mumbai">Mumbai</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="area" className="form-label">Area</label>
                                            <select id="area" name="area" className="form-select" aria-label=".form-select-lg example">
                                                <option value="">Select Area</option>
                                                <option value="Jogeshwari">Jogeshwari</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="cpincode" className="form-label">Pin Code</label>
                                            <input type="text" className="form-control" id="cpincode" aria-describedby="cpincode" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="addtype" className="form-label">Address Type</label>
                                            <select id="addtype" name="addtype" className="form-select" aria-label=".form-select-lg example">
                                                <option value="">Select Address Type</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Residential">Residential</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="cperson" className="form-label">Customer Contact Person</label>
                                            <input type="text" className="form-control" id="cperson" aria-describedby="cperson" />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label htmlFor="cpnumber" className="form-label">Customer Contact Number</label>
                                            <input type="text" className="form-control" id="cpnumber" aria-describedby="cpnumber" />
                                        </div>
                                        <div className="col-md-12 text-right">
                                            <button type="submit" className="btn btn-liebherr">Submit</button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="col-6">
                                <table id="basic-datatable" className="table table-bordered table dt-responsive nowrap w-100">
                                    <thead>
                                        <tr>
                                            <th scope="col" width="10%">#</th>
                                            <th scope="col">Contact Person</th>
                                            <th scope="col">Contact Person No</th>
                                            <th scope="col">Address</th>
                                            <th scope="col" width="15%" style={{ textAlign: 'center' }}>Edit</th>
                                            <th scope="col" width="15%" style={{ textAlign: 'center' }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">1</th>
                                            <td>Nikhil Jadhav</td>
                                            <td>9875642156</td>
                                            <td>Majaswadi, Jogeshwari</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="edithelper">
                                                    <i className="fa-solid fa-pen fa-rotate-by" style={{ color: '#0000FF', '--fa-rotate-angle': '1deg' }}></i>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="deletehelper">
                                                    <i className="fa-solid fa-trash" style={{ color: '#df2025' }}></i>
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">2</th>
                                            <td>Sana Shaikh</td>
                                            <td>6485612798</td>
                                            <td>Majaswadi, Jogeshwari</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="edithelper">
                                                    <i className="fa-solid fa-pen fa-rotate-by" style={{ color: '#0000FF', '--fa-rotate-angle': '1deg' }}></i>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="deletehelper">
                                                    <i className="fa-solid fa-trash" style={{ color: '#df2025' }}></i>
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
};

export default Customerlocation;


