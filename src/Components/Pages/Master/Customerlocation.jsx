import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Endcustomertabs from "./Endcustomertabs";
import { useParams } from "react-router-dom";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
const Customerlocation = () => {
  const [countries, setCountries] = useState([]);
  const { loaders, axiosInstance } = useAxiosLoader();
  const { customer_id } = useParams()
  console.log(customer_id);

  const token = localStorage.getItem("token");
  const [regions, setRegions] = useState([]);
  const [geoStates, setGeoStates] = useState([]);
  const [geoCities, setGeoCities] = useState([]);
  const [geoAreas, setGeoAreas] = useState([]);
  const [geoPincodes, setGeoPincodes] = useState([]);
  const [customerid, setCustomerId] = useState([]);
  const [Customernumber, setCustomernumber] = useState([]);
  const [customerLocation, setCustomerLocation] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [successMessage, setSuccessMessage] = useState('');

  const [locations, setlocations] = useState([])

  const [formData, setFormData] = useState({
    country_id: "",
    region_id: "",
    geostate_id: "",
    geocity_id: "",
    area_id: "",
    pincode_id: "",
    address: "",
    ccperson: "",
    ccnumber: "",
    address_type: "",
    customer_id: customer_id,
  });

  // const fetchCustomermobile = async () => {
  //   try {
  //     const response = await axiosInstance.get(`${Base_Url}/getcustomer`);
  //     console.log("pf",response.data);
  //     setCustomernumber(response.data);
  //   } catch (error) {
  //     console.error("Error fetching Customer Mobileno:", error);
  //   }
  // };

  const fetchCustomermobile = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcustomer`, {
        headers: {
          Authorization: token,
        },
      });
      console.log("Customer data:", response.data); // Check data structure
      console.log("Data type:", typeof response.data); // Check data type
      console.log("Is Array:", Array.isArray(response.data)); // Check if it's an array

      // Ensure we're setting an array
      const customerData = Array.isArray(response.data) ? response.data : [];
      setCustomernumber(customerData);
    } catch (error) {
      console.error("Error fetching Customer Mobileno:", error);
      setCustomernumber([]); // Set empty array on error
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcountries`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchRegions = async (countryId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getregions/${countryId}`, {
        headers: {
          Authorization: token,
        },
      });
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchGeoStates = async (regionId) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getgeostates/${regionId}`
        , {
          headers: {
            Authorization: token,
          },
        });
      setGeoStates(response.data);
    } catch (error) {
      console.error("Error fetching geo states:", error);
    }
  };

  const fetchGeoCities = async (district_id) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getgeocities_a/${district_id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      console.log("Geo Cities:", response.data);
      setGeoCities(response.data);
    } catch (error) {
      console.error("Error fetching geo cities:", error);
    }
  };


  const fetchDistrict = async (geostate_id) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getareadrop/${geostate_id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      console.log("Area Dropdown:", response.data);
      setGeoAreas(response.data);
    } catch (error) {
      console.error("Error fetching Area:", error);
    }
  };

  const fetchPincodedrop = async (geocity_id) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getpincodedrop/${geocity_id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      console.log("Pincode Dropdown:", response.data);
      setGeoPincodes(response.data);
    } catch (error) {
      console.error("Error fetching Pincode:", error);
    }
  };

  const fetchCustomerlocation = async () => {
    try {

      const response = await axiosInstance.get(`${Base_Url}/getcustomerlocation/${customer_id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setCustomerLocation(response.data);
      setFilteredAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);

    }
  };

  const fetchcustomerid = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcustomerid`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setCustomerId(response.data);
    } catch (error) {
      console.error("Error fetching customer id:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchCustomerlocation();
    fetchCustomermobile();
    fetchcustomerid();
    setFormData(prev => ({
      ...prev,
      customer_id: customer_id
    }));
  }, [customer_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,
    }

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        const payload = {
          encryptedData
          
        };
        if (isEdit) {
          await axios
            .post(`${Base_Url}/putcustomerlocation`, { encryptedData }, {
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {
              setFormData({
                country_id: "",
                region_id: "",
                geostate_id: "",
                geocity_id: "",
                district_id: "",
                pincode_id: "",
                address: "",
                ccperson: "",
                ccnumber: "",
                customer_id: customer_id,
              });
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerlocation();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Customer with same number already exists !");
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postcustomerlocation`, { encryptedData }, {
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {
              setFormData({
                country_id: "",
                region_id: "",
                geostate_id: "",
                geocity_id: "",
                district_id: "",
                pincode_id: "",
                address: "",
                ccperson: "",
                ccnumber: "",
                address_type: "",
                customer_id: customer_id,
              });
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerlocation();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Customer with same number already exists !");
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
    if (name === "pincode_id") {
      if (value.length === 6) {
        fetchlocations(value);
      }
      setFormData(prevState => ({
        ...prevState,
        pincode_id: value,
      }));

    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const fetchlocations = async (pincode) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getmultiplelocation/${pincode}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data && response.data[0]) {
        const locationData = response.data[0];
        setlocations({
          region: locationData.region,
          state: locationData.state,
          district: locationData.district,
          city: locationData.city,
          country: locationData.country
        });

        // Update formData with location values
        setFormData(prevState => ({
          ...prevState,
          country_id: locationData.country_id || "",
          region_id: locationData.region_id || "",
          geostate_id: locationData.state_id || "",
          district_id: locationData.district_id || "",
          geocity_id: locationData.city_id || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredAreas(
      customerLocation.filter(
        (area) =>
          area.title.toLowerCase().includes(searchValue) ||
          area.country_title.toLowerCase().includes(searchValue) ||
          area.region_title.toLowerCase().includes(searchValue) ||
          area.geostate_title.toLowerCase().includes(searchValue)
      )
    );
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.pincode_id) {
      newErrors.pincode_id = "Pincode is required";
    }

    if (!formData.ccperson?.trim()) {
      newErrors.ccperson = "Contact person is required";
    }

    if (!formData.address_type) {
      newErrors.address_type = "Address type is required";
    }

    if (!formData.ccnumber) {
      newErrors.ccnumber = "Contact Person Number is required";
    }

    return newErrors;
  };


  console.log("locations data", locations)

  const deleted = async (id) => {
    try {
      await axiosInstance.post(`${Base_Url}/deletecustomerlocation`, { id }, {
        headers: {
          Authorization: token,
        },
      });
      setFormData({
        country_id: "",
        region_id: "",
        geostate_id: "",
        geocity_id: "",
        district_id: "",
        pincode_id: "",
        address: "",
        ccperson: "",
        ccnumber: "",
        address_type: "",
      });
      fetchCustomerlocation();
    } catch (error) {
      console.error("Error deleting Customer Location:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestcustomerlocation/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setFormData(response.data);
      console.log("Form Data", setFormData);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing Customer Location:", error);
    }
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
    pageid: String(16)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <Endcustomertabs></Endcustomertabs>
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              {successMessage && (
                <div className="alert alert-success text-center mb-3" role="alert">
                  {successMessage}
                </div>
              )}
              <div className="row mp0">
                <div className="col-6">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="exampleFormControlTextarea1">
                          Address<span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea1"
                          rows="3"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        ></textarea>
                        {errors.address && (
                          <small className="text-danger">
                            {errors.address}
                          </small>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="country" className="form-label">
                          Country
                        </label>

                        <input type="text" className="form-control" value={locations.country} name="country_id" onChange={handleChange} placeholder="" disabled />

                        {errors.country_id && (
                          <small className="text-danger">
                            {errors.country_id}
                          </small>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="region" className="form-label">
                          Region
                        </label>
                        <input type="text" className="form-control" value={locations.region} name="region_id" onChange={handleChange} placeholder="" disabled />

                        {errors.region_id && (
                          <small className="text-danger">
                            {errors.region_id}
                          </small>
                        )}
                      </div>

                      {/* Geo State Dropdown */}
                      <div className="col-md-4 mb-3">
                        <label htmlFor="geostate" className="form-label">
                          Geo States
                        </label>
                        <input type="text" className="form-control" value={locations.state} name="geostate_id" onChange={handleChange} placeholder="" disabled />

                        {errors.geostate_id && (
                          <small className="text-danger">
                            {errors.geostate_id}
                          </small>
                        )}
                      </div>

                      {/* Geo District Dropdown */}
                      <div className="col-md-4 mb-3">
                        <label htmlFor="area" className="form-label">
                          District
                        </label>

                        <input type="text" className="form-control" value={locations.district} name="area_id" onChange={handleChange} placeholder="" disabled />

                        {errors.area_id && (
                          <small className="text-danger">{errors.area_id}</small>
                        )}
                      </div>

                      {/* Geo City Dropdown */}
                      <div className="col-md-4 mb-3">
                        <label htmlFor="geocity" className="form-label">
                          Geo City
                        </label>
                        <input type="text" className="form-control" value={locations.city} name="geocity_id" onChange={handleChange} placeholder="" disabled />

                        {errors.geocity_id && (
                          <small className="text-danger">
                            {errors.geocity_id}
                          </small>
                        )}
                      </div>


                      {/* Pincode Dropdown */}
                      <div className="col-md-4 mb-3">
                        <label htmlFor="area" className="form-label">
                          Pincode<span className="text-danger">*</span>
                        </label>


                        <input type="text" className="form-control" value={formData.pincode_id} name="pincode_id" onChange={handleChange} placeholder="" />

                        {errors.pincode_id && (
                          <small className="text-danger">{errors.pincode_id}</small>
                        )}
                      </div>



                      <div className="col-md-4 mb-3">
                        <label htmlFor="addtype" className="form-label">
                          Address Type<span className="text-danger">*</span>
                        </label>
                        <select
                          id="addtype"
                          name="address_type"
                          className="form-select"
                          aria-label=".form-select-lg example"
                          value={formData.address_type}
                          onChange={handleChange}
                        >
                          <option value="">Select Address Type</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Residential">Residential</option>
                        </select>
                        {errors.address_type && (
                          <small className="text-danger">{errors.address_type}</small>
                        )}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="ccperson" className="form-label">
                          Customer Contact Person<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="ccperson"
                          name="ccperson"
                          value={formData.ccperson}
                          onChange={handleChange}
                          aria-describedby="cperson"
                        />
                        {errors.ccperson && (
                          <small className="text-danger">{errors.ccperson}</small>
                        )}
                      </div>
                      {/* <div className="col-md-4 mb-3">
                        <label htmlFor="ccnumber" className="form-label">
                          Customer Contact Number
                        </label>
                        <select

                          className="form-select"
                          name="ccnumber"
                          id="ccnumber"
                          value={formData.ccnumber}
                          onChange={handleChange}
                          placeholder="Enter Customer Contact Number"
                          pattern="[0-9]*"
                          maxLength="15"
                          aria-describedby="cpnumber"
                        >
                          <option value="">Select Customer Contact Number</option>
                          {Customernumber.map((pf) => (
                            <option key={pf.id} value={pf.id}>
                              {pf.mobileno}
                            </option>
                          ))}
                        </select>
                        {formData.ccnumber.length > 0 && formData.ccnumber.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.ccnumber && <small className="text-danger">{errors.ccnumber}</small>}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}
                      </div> */}

                      <div className="col-md-4 mb-3">
                        <label htmlFor="ccnumber" className="form-label">
                          Contact Person Mobile Number<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="ccnumber"
                          name="ccnumber"
                          value={formData.ccnumber}
                          onChange={handleChange}
                          aria-describedby="ccnumber"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          minLength="10"
                        />
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}
                      </div>

                      {roleaccess > 2 ? <div className="col-md-12 text-right">
                        <button type="submit" className="btn btn-liebherr">
                          Submit
                        </button>
                      </div> : null}
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
                  <table

                    className="table table-bordered table dt-responsive nowrap w-100 table-css"
                    style={{ marginTop: "20px", tableLayout: "fixed" }}
                  >
                    <thead>
                      <tr>
                        <th scope="col" width="10%">
                          #
                        </th>
                        <th scope="col">Contact Person</th>
                        <th scope="col" width='23%'>Customer ID</th>
                        <th scope="col" width='25%'>Address</th>
                        {roleaccess > 3 ? <th
                          scope="col"
                          width="13%"
                          style={{ textAlign: "center" }}
                        >
                          Edit
                        </th> : null}
                        {roleaccess > 4 ?<th
                          scope="col"
                          width="13%"
                          style={{ textAlign: "center" }}
                        >
                          Delete
                        </th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {customerLocation.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ padding: "2px", textAlign: "center" }}>
                            {index + 1 + indexOfFirstUser}
                          </td>

                          <td>{item.ccperson}</td>
                          <td>{item.customer_id}</td>
                          <td>{item.address}</td>
                          {roleaccess > 3 ?<td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
                              title="Edit"
                              disabled={roleaccess > 3 ? false : true}
                            >
                              <FaPencilAlt />
                            </button>
                          </td> : null}
                          {roleaccess > 4 ?<td className="text-center">
                            <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              title="Delete"
                              disabled={roleaccess > 4 ? false : true}
                            >
                              <FaTrash />
                            </button>
                          </td> : null}
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
      </div> : null}
    </div>
  );
};

export default Customerlocation;
