import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";

const Area = () => {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    country_id: "",
    region_id: "",
    geostate_id: "",
    geocity_id: "",
    area_id: "",
  });

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcountries`);
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchRegions = async (countryId) => {
    try {
      const response = await axios.get(`${Base_Url}/getregions/${countryId}`);
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchGeoStates = async (regionId) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeostates/${regionId}`);
      setGeoStates(response.data);
    } catch (error) {
      console.error("Error fetching geo states:", error);
    }
  };

  const fetchGeoCities = async (geostate_id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getgeocities_a/${geostate_id}`
      );
      console.log("Geo Cities:", response.data);
      setGeoCities(response.data);
    } catch (error) {
      console.error("Error fetching geo cities:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getareas`);
      setAreas(response.data);
      setFilteredAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
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

    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          await axios
            .put(`${Base_Url}/putarea`, { ...formData })
            .then((response) => {
              setFormData({
                title: "",
                country_id: "",
                region_id: "",
                geostate_id: "",
                geocity_id: "",
                area_id: "",
              });
              fetchAreas();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Area already exists!");
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postarea`, { ...formData })
            .then((response) => {
              setFormData({
                title: "",
                country_id: "",
                region_id: "",
                geostate_id: "",
                geocity_id: "",
                area_id: "",
              });
              fetchAreas();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Area already exists!");
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "country_id") {
      fetchRegions(value);
    }
    if (name === "region_id") {
      fetchGeoStates(value);
    }
    if (name === "geostate_id") {
      fetchGeoCities(value); // Fetch Geo Cities when Geo State is selected
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredAreas(
      areas.filter(
        (area) =>
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
      newErrors.title = "Area Field is required.";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Country selection is required.";
    }
    if (!formData.region_id) {
      newErrors.region_id = "Region selection is required.";
    }
    if (!formData.geostate_id) {
      newErrors.geostate_id = "Geo State selection is required.";
    }
    if (!formData.geocity_id) {
      // Validate Geo City
      newErrors.geocity_id = "Geo City selection is required.";
    }
    return newErrors;
  };

  const deleted = async (id) => {
    try {
      await axios.post(`${Base_Url}/deletearea`, { id });
      setFormData({
        title: "",
        country_id: "",
        region_id: "",
        geostate_id: "",
        geocity_id: "",
        area_id: "",
      });
      fetchAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestarea/${id}`);
      console.log(response.data);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      fetchGeoCities(response.data.geostate_id);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing area:", error);
    }
  };

  return (
    <div className="tab-content">
      <LocationTabs />
      <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <div className="col-6">
                  <form
                    onSubmit={handleSubmit}
                    style={{ width: "50%" }}
                    className="text-left"
                  >
                    {/* Country Dropdown */}
                    <div className="form-group">
                      <label
                        htmlFor="country"
                        className="form-label pb-0 dropdown-label"
                      >
                        Country
                      </label>
                      <select
                        className="form-select dropdown-select"
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
                      <label
                        htmlFor="region"
                        className="form-label pb-0 dropdown-label"
                      >
                        Region
                      </label>
                      <select
                        className="form-select dropdown-select"
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
                      <label
                        htmlFor="geostate_id"
                        className="form-label pb-0 dropdown-label"
                      >
                        Geo State
                      </label>
                      <select
                        className="form-select dropdown-select"
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
                        <small className="text-danger">
                          {errors.geostate_id}
                        </small>
                      )}
                    </div>

                    {/* Geo City Dropdown */}
                    <div className="form-group">
                      <label
                        htmlFor="geocity_id"
                        className="form-label pb-0 dropdown-label"
                      >
                        Geo City
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="geocity_id" // Ensure the name matches formData
                        value={formData.geocity_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Geo City</option>
                        {geoCities.map((geoCity) => (
                          <option key={geoCity.id} value={geoCity.id}>
                            {geoCity.title}
                          </option>
                        ))}
                      </select>
                      {errors.geocity_id && (
                        <small className="text-danger">{errors.geocity_id}</small>
                      )}
                    </div>

                    {/* Title Input */}
                    <div className="form-group">
                      <label htmlFor="areaInput" className="input-field">
                        Area
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
                    <div className="text-right">
                      <button
                        className="btn btn-liebherr"
                        type="submit"
                        style={{ marginTop: "15px" }}
                      >
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
                        style={{
                          width: "51px",
                          display: "inline-block",
                          marginLeft: "5px",
                          marginRight: "5px",
                        }}
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
                      style={{ width: "300px" }}
                    />
                  </div>

                  <table className="table table-bordered table-hover dt-responsive nowrap w-100">
                    <thead>
                      <tr className="text-center">
                        <th scope="col" width="10%" className='text-center'>#</th>
                        <th scope="col" width="14%" className='text-center'>Country</th>
                        <th scope="col" width="14%" className='text-center'>Region</th>
                        <th scope="col" width="14%" className='text-center'>Geo State</th>
                        <th scope="col" width="14%" className='text-center'>Geo City</th>
                        <th scope="col" width="14%" className='text-center'>Area</th>
                        <th scope="col" width="15%" className='text-center'>Edit</th>
                        <th scope="col" width="15%" className='text-center'>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAreas
                        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                        .map((area, index) => (
                          <tr key={area.id} className="text-center">
                            <td className='text-center'>{currentPage * itemsPerPage + index + 1}</td>
                            <td className='text-center'>{area.country_title}</td>
                            <td className='text-center'>{area.region_title}</td>
                            <td className='text-center'>{area.geostate_title}</td>
                            <td className='text-center'>{area.geocity_title}</td>
                            <td className='text-center'>{area.title}</td>
                            <td className='text-center'>
                              <FaPencilAlt style={{ cursor: 'pointer', color: 'blue' }} onClick={() => edit(area.id)} />
                            </td>
                            <td className='text-center'>
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => deleted(area.id)} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  <div>
                    Showing {currentPage * itemsPerPage + 1} to{" "}
                    {Math.min(
                      (currentPage + 1) * itemsPerPage,
                      filteredAreas.length
                    )}{" "}
                    of {filteredAreas.length} entries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default Area;
