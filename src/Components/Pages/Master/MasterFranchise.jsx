import axios from "axios";
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import md5 from "js-md5";
import Franchisemaster from '../Master/Franchisemaster';
const MasterFranchise = () => {
  // Step 1: Add this state to track errors
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [state, setState] = useState([])
  const [area, setdistricts] = useState([])
  const [city, setCity] = useState([])
  const [pincode, setPincode] = useState([])
  const [customerLocation, setCustomerLocation] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error

  const [formData, setFormData] = useState({
    title: "",
    password: "",

  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getfranchisedata`);
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching Franchise Master:", error);
    }
  };

  const fetchData = async (url, setStateFunction, errorMessage) => {
    try {
      const response = await axios.get(url);
      setStateFunction(response.data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };
  const fetchcountries = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcountries`);
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching disctricts:", error);
    }
  };

  //region
  const fetchregion = async (country_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getregionscity/${country_id}`);
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching disctricts:", error);
    }
  };

  //geostate
  const fetchState = async (region_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeostatescity/${region_id}`);
      setState(response.data);
    } catch (error) {
      console.error("Error fetching disctricts:", error);
    }
  };

  const fetchdistricts = async (geostateID) => {
    try {
      const response = await axios.get(`${Base_Url}/getdistrictcity/${geostateID}`);
      setdistricts(response.data);
    } catch (error) {
      console.error("Error fetching disctricts:", error);
    }
  };

  const fetchCity = async (area_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeocities_p/${area_id}`);
      setCity(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  const fetchpincode = async (cityid) => {
    try {
      const response = await axios.get(`${Base_Url}/getpincodebyid/${cityid}`);
      setPincode(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  useEffect(() => {
    fetchUsers();



  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // If the field is Password, hash the value
    if (name === 'password') {
      // Hash the password before setting the state
      const hashedPassword = CryptoJS.MD5(value).toString();
      setFormData({
        ...formData,
        [name]: value,  // Update the password field itself
        passwordmd5: hashedPassword,  // Update the hashed password
      });
    } else {
      // Update other fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) => user.title && user.title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {}; // Initialize an empty error object
    if (!formData.title.trim()) {
      // Check if the title is empty
      newErrors.title = "Franchise Master Field is required."; // Set error message if title is empty
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

    setDuplicateError(""); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include duplicate check
          await axios
            .put(`${Base_Url}/putfranchisedata`, { ...formData })
            .then((response) => {
              setFormData({
                title: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Franchise Master already exists!"
                ); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include duplicate check
          await axios
            .post(`${Base_Url}/postfranchisedata`, { ...formData })
            .then((response) => {
              const newpassword = md5(formData.password)

              setFormData({
                title: "",
                password: newpassword,

              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Franchise Master already exists!"
                ); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const deleted = async (id) => {
    try {
      const response = await axios.post(`${Base_Url}/deletefranchisedata`, {
        id,
      });

      setFormData({
        title: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/requestfranchisedata/${id}`
      );
      setFormData(response.data);
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (

    <div className="tab-content">
      <Franchisemaster />
      <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">

                <form
                  onSubmit={handleSubmit}
                  style={{ width: "50%" }}
                  className="text-left"
                >
                  <div className="row">
                    <div className="col-6">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Franchise Master
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        id="MasterFranchiseInput"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Franchise Master"
                      />
                      {errors.title && (
                        <small className="text-danger">{errors.title}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-6">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Franchise Master(Contact Person)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="contact_person"
                        id="MasterFranchiseInput"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Enter Contact Person"
                      />
                      {errors.contact_person && (
                        <small className="text-danger">{errors.contact_person}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-6">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Franchise Master (Email)
                      </label>
                      <input
                        type="email" // Changed type to 'email'
                        className="form-control"
                        name="email"
                        id="MasterFranchiseInput"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Franchise Master Email"
                      />
                      {errors.email && (
                        <small className="text-danger">{errors.email}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-6">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Franchise Master (Mobile Number)
                      </label>
                      <input
                        type="tel" // Changed type to 'tel' for mobile number input
                        className="form-control"
                        name="mobile_no"
                        id="MasterFranchiseInput"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        placeholder="Enter Franchise Master Mobile Number"
                        pattern="[0-9]{10}"
                        maxLength="15"
                      />
                      {errors.mobile_no && (
                        <small className="text-danger">{errors.mobile_no}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-6">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Franchise Master (Password)
                      </label>
                      <input
                        type="password" // Changed type to 'password' for secure text input
                        className="form-control"
                        name="password"
                        id="MasterFranchiseInput"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter Franchise Master Password"
                      />
                      {errors.password && (
                        <small className="text-danger">{errors.password}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="country" className="form-label">
                        Country
                      </label>
                      <select
                        id="country"
                        name="country_id"
                        className="form-select"
                        aria-label=".form-select-lg example"
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
                        <small className="text-danger">
                          {errors.country_id}
                        </small>
                      )}
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="region" className="form-label">
                        Region
                      </label>
                      <select
                        id="region"
                        name="region_id"
                        className="form-select"
                        aria-label=".form-select-lg example"
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
                        <small className="text-danger">
                          {errors.region_id}
                        </small>
                      )}
                    </div>

                    {/* Geo State Dropdown */}
                    <div className="col-md-3">
                      <label htmlFor="geostate" className="form-label">
                        Geo State
                      </label>
                      <select className="form-select" value={formData.state} name="state" onChange={handleChange}>
                        <option value="">Select State</option>
                        {state.map((item) => {
                          return (

                            <option value={item.id}>{item.title}</option>
                          )
                        })}
                      </select>
                      {errors.state && (
                        <small className="text-danger">
                          {errors.state}
                        </small>
                      )}
                    </div>

                    {/* Geo District Dropdown **/}
                    <div className="col-md-3">
                      <label htmlFor="area" className="form-label">
                        District
                      </label>
                      <label className="form-label">Area</label>
                      <select className="form-select" onChange={handleChange} name="area" value={formData.area}>
                        <option value="">Select Area</option>
                        {area.map((item) => {
                          return (
                            <option value={item.id} key={item.id}>{item.title}</option>
                          );
                        })}
                      </select>
                      {errors.area && (
                        <small className="text-danger">{errors.area}</small>
                      )}
                    </div>

                    {/* Geo City Dropdown */}
                    <div className="col-md-3">
                      <label htmlFor="geocity" className="form-label">
                        Geo City
                      </label>
                      <select className="form-select" value={formData.city} name="city" onChange={handleChange}>
                        <option value="">Select City</option>
                        {city.map((item) => {
                          return (
                            <option value={item.id} key={item.id}>{item.title}</option>
                          );
                        })}
                      </select>
                      {errors.city && (
                        <small className="text-danger">
                          {errors.city}
                        </small>
                      )}
                    </div>


                    {/* Pincode Dropdown */}
                    <div className="col-md-3">
                      <label htmlFor="area" className="form-label">
                        Pincode
                      </label>
                      <select
                        id="pincode"
                        name="pincode_id"
                        className="form-select"
                        aria-label=".form-select-lg example"
                        value={formData.pincode_id}
                        onChange={handleChange}
                      >
                        <option value="">Select Pincode</option>
                        {pincode.map((geoPincode) => (
                          <option key={geoPincode.id} value={geoPincode.id}>
                            {geoPincode.pincode}
                          </option>
                        ))}
                      </select>
                      {errors.pincode_id && (
                        <small className="text-danger">{errors.pincode_id}</small>
                      )}
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        name="address"
                        id="MasterFranchiseInput"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter Franchise Master"
                        rows="3"
                      />
                      {errors.address && (
                        <small className="text-danger">{errors.address}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
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
                  </div>
                </form>


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
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default MasterFranchise;
