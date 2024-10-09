import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

const Area = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [geoStates, setGeoStates] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});
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
    area_id: '' // Added area_id to formData
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
              window.location.reload();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Area already exists!');
              }
            });
        } else {
          await axios.post(`${Base_Url}/postarea`, { ...formData })
            .then(response => {
              window.location.reload();
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
    return newErrors;
  };

  const deleted = async (id) => {
    try {
      await axios.post(`${Base_Url}/deletearea`, { id });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestarea/${id}`);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      setIsEdit(true);
    } catch (error) {
      console.error('Error editing area:', error);
    }
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <form onSubmit={handleSubmit}>
          {/* Country Dropdown */}
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              className="form-control"
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.title}
                </option>
              ))}
            </select>
            {errors.country_id && (
              <small className="text-danger">{errors.country_id}</small>
            )}
          </div>

          {/* Region Dropdown */}
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <select
              className="form-control"
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.title}
                </option>
              ))}
            </select>
            {errors.region_id && (
              <small className="text-danger">{errors.region_id}</small>
            )}
          </div>

          {/* Geo State Dropdown */}
          <div className="form-group">
            <label htmlFor="geostate_id">Geo State</label>
            <select
              className="form-control"
              name="geostate_id"
              value={formData.geostate_id}
              onChange={handleChange}
            >
              <option value="">Select Geo State</option>
              {geoStates.map((geoState) => (
                <option key={geoState.id} value={geoState.id}>
                  {geoState.title}
                </option>
              ))}
            </select>
            {errors.geostate_id && (
              <small className="text-danger">{errors.geostate_id}</small>
            )}
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label
              htmlFor="areaInput"
              style={{ marginBottom: '15px', fontSize: '18px' }}
            >
              Add Area
            </label>
            <input
              type="text"
              className="form-control"
              name="title"
              id="areaInput"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Area"
            />
            {errors.title && (
              <small className="text-danger">{errors.title}</small>
            )}
            {duplicateError && (
              <small className="text-danger">{duplicateError}</small>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm"
            type="submit"
            style={{ marginTop: '15px' }}
          >
            {isEdit ? 'Update' : 'Submit'}
          </button>
        </form>
      </div>

      <div className="col-md-6">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="form-control"
              style={{ width: 'auto', display: 'inline-block', marginLeft: '5px' }}
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
            className="form-control"
            style={{ width: '200px' }}
          />
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Area</th>
              <th>Country</th>
              <th>Region</th>
              <th>Geo State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAreas.slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage).map((area) => (
              <tr key={area.id}>
                <td>{area.title}</td>
                <td>{area.country_title}</td>
                <td>{area.region_title}</td>
                <td>{area.geostate_title}</td>
                <td>
                  <FaPencilAlt
                    onClick={() => edit(area.id)}
                    style={{ cursor: 'pointer', marginRight: '10px', color: 'blue' }}
                  />
                  <FaTrash
                    onClick={() => deleted(area.id)}
                    style={{ cursor: 'pointer', color: 'red' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredAreas.length)} of {filteredAreas.length} entries
        </div>
      </div>
    </div>
  );
};

export default Area;
