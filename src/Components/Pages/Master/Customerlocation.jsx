import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import Endcustomertabs from "./Endcustomertabs";

const Customerlocation = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [geoStates, setGeoStates] = useState([]);
  const [geoCities, setGeoCities] = useState([]);
  const [geoAreas, setGeoAreas] = useState([]);
  const [geoPincodes, setGeoPincodes] = useState([]);
  const [customerLocation, setCustomerLocation] = useState([]);
  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

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

  const fetchGeoCities = async (district_id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getgeocities_a/${district_id}`
      );
      console.log("Geo Cities:", response.data);
      setGeoCities(response.data);
    } catch (error) {
      console.error("Error fetching geo cities:", error);
    }
  };


  const fetchDistrict = async (geostate_id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getareadrop/${geostate_id}`
      );
      console.log("Area Dropdown:", response.data);
      setGeoAreas(response.data);
    } catch (error) {
      console.error("Error fetching Area:", error);
    }
  };

  const fetchPincodedrop = async (geocity_id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/getpincodedrop/${geocity_id}`
      );
      console.log("Pincode Dropdown:", response.data);
      setGeoPincodes(response.data);
    } catch (error) {
      console.error("Error fetching Pincode:", error);
    }
  };

  const fetchCustomerlocation = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getcustomerlocation`);
      setCustomerLocation(response.data);
      setFilteredAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchCustomerlocation();
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
            .put(`${Base_Url}/putcustomerlocation`, { ...formData })
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
              });
              fetchCustomerlocation();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Customer with same number already exists !");
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postcustomerlocation`, { ...formData })
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
              });
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
    if (name === "geocity_id") {
      fetchDistrict(value); // Fetch Geo Cities when Geo State is selected
    }
    if (name === "district_id") {
      fetchPincodedrop(value); // Fetch Geo Cities when Geo State is selected
    }

    if (name === "pincode_id") {
      fetchlocations(value);
  }
  
  };

  const fetchlocations = async (pincode) => {
    try {
        const response = await axios.get(
            `${Base_Url}/getmultiplelocation/${pincode}`
        );

        if (response.data && response.data[0]) {

            setlocations({ region: response.data[0].region, state: response.data[0].state, district: response.data[0].district, city: response.data[0].city , country: response.data[0].country})

        }


    } catch (error) {
        console.error("Error fetching complaint details:", error);
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
    const newErrors = {};

    // Address validation
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = "Address field is required.";
    }

    // Area validation
    if (!formData.district_id) {
      newErrors.district_id = "Area selection is required.";
    }

    // Address Type validation
    if (!formData.address_type) {
      newErrors.address_type = "Address Type selection is required.";
    }

    // Contact Person validation
    if (!formData.ccperson || formData.ccperson.trim() === '') {
      newErrors.ccperson = "Contact Person field is required.";
    }

    // Other existing validations
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
      newErrors.geocity_id = "Geo City selection is required.";
    }
    if (!formData.pincode_id) {
      newErrors.pincode_id = "Pincode selection is required.";
    }
    if (!formData.ccnumber) {
      newErrors.ccnumber = "Customer Contact Number is required.";
    }

    return newErrors;
  };


  console.log("locations data",locations)

  const deleted = async (id) => {
    try {
      await axios.post(`${Base_Url}/deletepincode`, { id });
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
      const response = await axios.get(`${Base_Url}/requestcustomerlocation/${id}`);
      setFormData(response.data);
      console.log("Form Data", setFormData);
      fetchRegions(response.data.country_id);
      fetchGeoStates(response.data.region_id);
      fetchGeoCities(response.data.geostate_id);
      fetchDistrict(response.data.geocity_id);
      fetchPincodedrop(response.data.district_id);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing Customer Location:", error);
    }
  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="tab-content">
      <Endcustomertabs></Endcustomertabs>
      <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              <div className="row mp0">
                <div className="col-6">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="exampleFormControlTextarea1">
                          Address
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

                        {/* <select
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
                        </select> */}
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
                        
                        {/* <select
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
                        </select> */}
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
                        {/* <select
                          id="geostate"
                          name="geostate_id"
                          className="form-select"
                          aria-label=".form-select-lg example"
                          value={formData.geostate_id}
                          onChange={handleChange}
                        >
                          <option value="">Select Geo State</option>
                          {geoStates.map((geoState) => (
                            <option key={geoState.id} value={geoState.id}>
                              {geoState.title}
                            </option>
                          ))}
                        </select> */}
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
                        {/* <select
                          id="area"
                          name="area_id"
                          className="form-select"
                          aria-label=".form-select-lg example"
                          value={formData.area_id}
                          onChange={handleChange}
                        >
                          <option value="">Select District</option>
                          {geoAreas.map((geoArea) => (
                            <option key={geoArea.id} value={geoArea.id}>
                              {geoArea.title}
                            </option>
                          ))}
                        </select> */}
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
                        {/* <select
                          id="geocity"
                          name="geocity_id"
                          className="form-select"
                          aria-label=".form-select-lg example"
                          value={formData.geocity_id}
                          onChange={handleChange}
                        >
                          <option value="">Select Geo City</option>
                          {geoCities.map((geoCity) => (
                            <option key={geoCity.id} value={geoCity.id}>
                              {geoCity.title}
                            </option>
                          ))}
                        </select> */}
                        {errors.geocity_id && (
                          <small className="text-danger">
                            {errors.geocity_id}
                          </small>
                        )}
                      </div>


                      {/* Pincode Dropdown */}
                      <div className="col-md-4 mb-3">
                        <label htmlFor="area" className="form-label">
                          Pincode
                        </label>

              
                        <input type="text" className="form-control" value={formData.pincode_id} name="pincode_id" onChange={handleChange} placeholder="" />

                        {/* <select
                          id="pincode"
                          name="pincode_id"
                          className="form-select"
                          aria-label=".form-select-lg example"
                          value={formData.pincode_id}
                          onChange={handleChange}
                        >
                          <option value="">Select Pincode</option>
                          {geoPincodes.map((geoPincode) => (
                            <option key={geoPincode.id} value={geoPincode.id}>
                              {geoPincode.pincode}
                            </option>
                          ))}
                        </select> */}
                        {errors.pincode_id && (
                          <small className="text-danger">{errors.pincode_id}</small>
                        )}
                      </div>



                      <div className="col-md-4 mb-3">
                        <label htmlFor="addtype" className="form-label">
                          Address Type
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
                          Customer Contact Person
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
                      <div className="col-md-4 mb-3">
                        <label htmlFor="ccnumber" className="form-label">
                          Customer Contact Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="ccnumber"
                          id="ccnumber"
                          value={formData.ccnumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isNaN(value)) {
                              if (value.length <= 15) {
                                handleChange(e);

                              }
                            }
                          }}
                          placeholder="Enter Customer Contact Number"
                          pattern="[0-9]*"
                          maxLength="15"
                          aria-describedby="cpnumber"
                        />
                        {formData.ccnumber.length > 0 && formData.ccnumber.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.ccnumber && <small className="text-danger">{errors.ccnumber}</small>}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}
                      </div>

                      {/* <div className="col-md-4 mb-3">
                      <label htmlFor="ccnumber" className="form-label">
                        Customer Contact Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ccnumber"
                        name="ccnumber"
                        value={formData.ccnumber}
                         onChange={handleChange}
                        aria-describedby="cpnumber"
                      />
                        {duplicateError && (
                      <small className="text-danger">{duplicateError}</small>
                    )}
                    </div> */}

                      <div className="col-md-12 text-right">
                        <button type="submit" className="btn btn-liebherr">
                          Submit
                        </button>
                      </div>
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
                        <th scope="col">Contact Person No</th>
                        <th scope="col">Address</th>
                        <th
                          scope="col"
                          width="15%"
                          style={{ textAlign: "center" }}
                        >
                          Edit
                        </th>
                        <th
                          scope="col"
                          width="15%"
                          style={{ textAlign: "center" }}
                        >
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerLocation.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ padding: "2px", textAlign: "center" }}>
                            {index + 1 + indexOfFirstUser}
                          </td>
                          <th scope="row">{index + 1}</th>
                          <td>{item.ccperson}</td>
                          <td>{item.ccnumber}</td>
                          <td>{item.address}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td className="text-center">
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

export default Customerlocation;
