import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [formData, setFormData] = useState({
    pincode: "",
    country_id: "",
    region_id: "",
    geostate_id: "",
    geocity_id: "",
    area_id: "",
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

  const fetchCountries = () =>
    fetchData(
      `${Base_Url}/getcountries`,
      setCountries,
      "Error fetching countries:"
    );
  const fetchRegions = (countryId) =>
    fetchData(
      `${Base_Url}/getregionspincode/${countryId}`,
      setRegions,
      "Error fetching regions:"
    );
  const fetchGeoStates = (regionId) =>
    fetchData(
      `${Base_Url}/getgeostatespincode/${regionId}`,
      setGeoStates,
      "Error fetching geo states:"
    );
  const fetchGeoCities = (area_id) =>
    fetchData(
      `${Base_Url}/getgeocities_p/${area_id}`,
      setGeoCities,
      "Error fetching geo cities:"
    );
  const fetchAreas = (geocity_id) =>
    fetchData(
      `${Base_Url}/getareas/${geocity_id}`,
      setAreas,
      "Error fetching areas:"
    );
  const fetchPincodes = () =>
    fetchData(
      `${Base_Url}/getpincodes`,
      (data) => {
        setPincodes(data);
        setFilteredPincodes(data);
      },
      "Error fetching pincodes:"
    );

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
        const url = isEdit
          ? `${Base_Url}/putpincode`
          : `${Base_Url}/postpincode`;
        const method = isEdit ? axios.put : axios.post;
        await method(url, formData);
        setFormData({
          title: "",
          pincode: "",
          country_id: "",
          region_id: "",
          geostate_id: "",
          geocity_id: "",
          area_id: "",
        });
        fetchPincodes();
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setDuplicateError("Duplicate entry, Pincode already exists!");
      } else {
        console.error("Error during form submission:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "country_id") fetchRegions(value);
      if (name === "region_id") fetchGeoStates(value);
      if (name === "geostate_id") fetchAreas(value);
      if (name === "area_id") fetchGeoCities(value);
    }
  };
  
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredPincodes(
      pincodes.filter((pincode) =>
        Object.values(pincode).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchValue)
        )
      )
    );
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "pincode",
      "country_id",
      "region_id",
      "geostate_id",
      "geocity_id",
      "area_id",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace("_id", "").charAt(0).toUpperCase() +
          field.replace("_id", "").slice(1)
          } is required.`;
      }
    });
    return newErrors;
  };

  const deleted = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this pincode?")) {
        await axios.post(`${Base_Url}/deletepincode`, { id });
        setFormData({
          title: "",
          pincode: "",
          country_id: "",
          region_id: "",
          geostate_id: "",
          geocity_id: "",
          area_id: "",
        });
        fetchPincodes();
      }
    } catch (error) {
      console.error("Error deleting pincode:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestpincode/${id}`);
      setFormData(response.data);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      fetchGeoCities(response.data.area_id);
      fetchAreas(response.data.geostate_id);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing pincode:", error);
    }
  };

  const renderDropdown = (name, options, label) => (
    <div className="form-group">
      <label htmlFor={name} className="form-label pb-0 dropdown-label">
        {label}
      </label>

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
                    {renderDropdown("country_id", countries, "Country")}
                    {renderDropdown("region_id", regions, "Region")}
                    {renderDropdown("geostate_id", geoStates, "Geo State")}
                    {renderDropdown("area_id", areas, "District")}
                    {renderDropdown("geocity_id", geoCities, "Geo City")}

                    <div className="mb-3">
                      <label htmlFor="pincodeInput" className="input-field">
                        Pincode
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
                      {errors.pincode && (
                        <small className="text-danger">{errors.pincode}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                    </div>
                    <div className="text-right">
                      <button className="btn btn-liebherr" type="submit">
                        {isEdit ? "Update" : "Submit"}
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
                          width: "51px",
                          display: "inline-block",
                          margin: "0 5px",
                        }}
                      >
                        {[10, 15, 20].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
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
                      style={{ width: "300px" }}
                    />
                  </div>

                  <table
                    id="basic-datatable"
                    className="table table-bordered table-hover dt-responsive nowrap w-100"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th scope="col" width="10%" className='text-center'>
                          #
                        </th>
                        <th scope="col" width="12%" className='text-center'>Country</th>
                        <th scope="col" width="12%" className='text-center'>Region</th>
                        <th scope="col" width="11%" className='text-center'>Geo State</th>
                        <th scope="col" width="12%" className='text-center'>District</th>
                        <th scope="col" width="11%" className='text-center'>Geo City</th>
                        <th scope="col" width="12%" className='text-center'>Pincode</th>
                        <th scope="col" width="15%" className='text-center'>
                          Edit
                        </th>
                        <th scope="col" width="15%" className='text-center'>
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPincodes
                        .slice(
                          currentPage * itemsPerPage,
                          (currentPage + 1) * itemsPerPage
                        )
                        .map((pincode, index) => (
                          <tr key={pincode.id}>
                            <td className="text-center">
                              {currentPage * itemsPerPage + index + 1}
                            </td>
                            <td className="text-center">
                              {pincode.country_title}
                            </td>
                            <td className="text-center">
                              {pincode.region_title}
                            </td>
                            <td className="text-center">
                              {pincode.geostate_title}
                            </td>
                            <td className="text-center">
                              {pincode.area_title}
                            </td>
                            <td className="text-center">
                              {pincode.geocity_title}
                            </td>
                            <td className="text-center">
                              {pincode.pincode}
                            </td>
                            <td className='text-center'>
                              <FaPencilAlt style={{ cursor: 'pointer', color: 'blue' }}  onClick={() => edit(pincode.id)} />
                            </td>
                            <td className='text-center'>
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => deleted(pincode.id)}/>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  <div>
                    Showing {currentPage * itemsPerPage + 1} to{" "}
                    {Math.min(
                      (currentPage + 1) * itemsPerPage,
                      filteredPincodes.length
                    )}{" "}
                    of {filteredPincodes.length} entries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default Pincode;



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

                  {/* Adjust table padding and spacing */}
                  <table className="table table-bordered table-hover table-hover">
                    <thead className="thead-dark">
                      <tr>
                        <th width="10%" style={{ textAlign: "center" }}>#</th>
                        <th width="70%" style={{ textAlign: "left" }}>Master Franchise</th>
                        <th width="15%" style={{ textAlign: "center" }}>Edit</th>
                        <th width="15%" style={{ textAlign: "center" }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: "center" }}>{index + 1 + indexOfFirstUser}</td>
                          <td>{item.title}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-link"
                              onClick={() => {
                                edit(item.id);
                              }}
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div
                    className="d-flex justify-content-between"
                    style={{ marginTop: "10px" }}
                  >
                    <div>
                      Showing {indexOfFirstUser + 1} to{" "}
                      {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                      {filteredUsers.length} entries
                    </div>

                    <div className="pagination" style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        {"<"}
                      </button>
                      {Array.from(
                        {
                          length: Math.ceil(filteredUsers.length / itemsPerPage),
                        },
                        (_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={currentPage === index ? "active" : ""}
                          >
                            {index + 1}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage ===
                          Math.ceil(filteredUsers.length / itemsPerPage) - 1
                        }
                      >
                        {">"}
                      </button>
                    </div>
                  </div>
                </div>
