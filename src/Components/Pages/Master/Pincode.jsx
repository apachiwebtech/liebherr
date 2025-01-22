import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

const Pincode = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
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
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [loading, setLoading] = useState(false);
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





  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcountries`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setCountries(response.data); // Update countries with the response data
    } catch (error) {
      console.error("Error fetching countries:", error.message);
      // Optionally, handle errors in a user-friendly way, e.g., show a message
    }
  };

  const fetchRegions = async (countryId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getregionspincode/${countryId}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setRegions(response.data); // Update countries with the response data
    } catch (error) {
      console.error("Error fetching Regions:", error.message);
      // Optionally, handle errors in a user-friendly way, e.g., show a message
    }
  };

  const fetchGeoStates = async (regionId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeostatespincode/${regionId}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setGeoStates(response.data); // Update countries with the response data
    } catch (error) {
      console.error("Error fetching geo states:", error.message);
      // Optionally, handle errors in a user-friendly way, e.g., show a message
    }
  };

  const fetchGeoCities = async (area_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeocities_p/${area_id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setGeoCities(response.data); // Update countries with the response data
    } catch (error) {
      console.error("Error fetching geo cities:", error.message);
      // Optionally, handle errors in a user-friendly way, e.g., show a message
    }
  };

  const fetchAreas = async (geocity_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getareas/${geocity_id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setAreas(response.data); // Update countries with the response data
    } catch (error) {
      console.error("Error fetching areas:", error.message);
      // Optionally, handle errors in a user-friendly way, e.g., show a message
    }
  };

  const fetchPincodes = async () => {
    setLoading(true);  // Start loader before API call
    try {
      const response = await axiosInstance.get(`${Base_Url}/getpincodes`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
  
      setPincodes(response.data);
      setFilteredPincodes(response.data);
    } catch (error) {
      console.error("Error fetching pincodes:", error.message);
      // Optionally, handle errors in a user-friendly way
    } finally {
      setLoading(false);  // Stop loader after data is loaded or in case of error
    }
  };


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
        const method = isEdit ? axiosInstance.post : axiosInstance.post;
        await method(url, formData, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
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
        await axiosInstance.post(`${Base_Url}/deletepincode`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
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
      const response = await axiosInstance.get(`${Base_Url}/requestpincode/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
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
        {label}<span className="text-danger">*</span>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "pincode") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const title = selectedOption ? selectedOption.text : "";
  
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        [`${name}_title`]: title, // Add the title for the dropdown
      }));
  
      // Fetch dependent data based on ID
      if (name === "country_id") fetchRegions(value);
      if (name === "region_id") fetchGeoStates(value);
      if (name === "geostate_id") fetchAreas(value);
      if (name === "area_id") fetchGeoCities(value);
    }
  };
  

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredPincodes.map(user => ({
      "Country": user.country_title,
      "Region": user.region_title,
      "Geo State": user.geostate_title,
      "District": user.area_title,
      "Geo City": user.geocity_title,
      "Pincode": user.pincode
      // Add fields you want to export
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pincode");

    // Export the workbook
    XLSX.writeFile(workbook, "Pincode.xlsx");
  };

  // export to excel end 

  // Role Right 


  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };

  const storedEncryptedRole = localStorage.getItem("Userrole");
  const decryptedRole = Decrypt(storedEncryptedRole);

  const roledata = {
    role: decryptedRole,
    pageid: String(6)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      <LocationTabs />
      {(loaders || loading) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders || loading} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <div className="col-4">
                  <form
                    onSubmit={handleSubmit}
                    style={{ width: "50%" }}
                    className="text-left"
                  >
                    {/* <div className="form-group">
                      <label htmlFor={'country_id'} className="form-label pb-0 dropdown-label">
                        {'Country'}<span className="text-danger">*</span>
                      </label>

                      <select
                        className="form-select dropdown-select"
                        name={'country_id'}
                        value={formData['country_id']}
                        onChange={handleChange}
                      >
                        <option value="">Select {'Country'}</option>
                        {countries.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                      {errors['country_id'] && <small className="text-danger">{errors['country_id']}</small>}
                    </div> */}
                    {renderDropdown("country_id", countries, "Country")}
                    {renderDropdown("region_id", regions, "Region")}
                    {renderDropdown("geostate_id", geoStates, "Geo State")}
                    {renderDropdown("area_id", areas, "District")}
                    {renderDropdown("geocity_id", geoCities, "Geo City")}

                    <div className="mb-3">
                      <label htmlFor="pincodeInput" className="input-field">
                        Pincode<span className="text-danger">*</span>
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
                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit">
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
                  </form>
                </div>

                <div className="col-8">
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
                        {[10, 15, 20, 250].map((value) => (
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
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
                    >
                      Export to Excel
                    </button>
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
                              <FaPencilAlt style={{ cursor: 'pointer', color: 'blue' }} onClick={() => edit(pincode.id)} disabled={roleaccess > 3 ? false : true} />
                            </td>
                            <td className='text-center'>
                              <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={() => deleted(pincode.id)} disabled={roleaccess > 4 ? false : true} />
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
                    Showing {currentPage * itemsPerPage + 1} to{" "}
                    {Math.min(
                      (currentPage + 1) * itemsPerPage,
                      filteredPincodes.length
                    )}{" "}
                    of {filteredPincodes.length} entries
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
                          length: Math.min(3, Math.ceil(filteredPincodes.length / itemsPerPage)), // Limit to 3 buttons
                        },
                        (_, index) => {
                          const pageIndex = Math.max(0, currentPage - 1) + index; // Adjust index for sliding window
                          if (pageIndex >= Math.ceil(filteredPincodes.length / itemsPerPage)) return null; // Skip invalid pages

                          return (
                            <button
                              key={pageIndex}
                              onClick={() => setCurrentPage(pageIndex)}
                              className={currentPage === pageIndex ? "active" : ""}
                            >
                              {pageIndex + 1}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={
                          currentPage ===
                          Math.ceil(filteredPincodes.length / itemsPerPage) - 1
                        }
                      >
                        {">"}
                      </button>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default Pincode;
