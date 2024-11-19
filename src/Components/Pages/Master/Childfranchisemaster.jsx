import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import Franchisemaster from '../Master/Franchisemaster';
const Childfranchisemaster = () => {
  // Step 1: Add this state to track errors
  const [Parentfranchise, setParentfranchise] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [state, setState] = useState([])
  const [area, setdistricts] = useState([])
  const [city, setCity] = useState([])
  const [pincode, setPincode] = useState([])

  const [formData, setFormData] = useState({
    title: "",
    pfranchise_id: "",
    contact_person: "",
    email: "",
    mobile_no: "",
    password: "",
    country_id: "",
    region_id: "",
    state: "",
    area: "",
    city: "",
    pincode_id: "",
    address: ""
  });


  const fetchParentfranchise = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getparentfranchise`);
      console.log(response.data);
      setParentfranchise(response.data);
    } catch (error) {
      console.error("Error fetching Parentfranchise:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getchildFranchiseDetails`);
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  //This is for State Dropdown

  async function getState(params) {
    axios.get(`${Base_Url}/getstate`)
      .then((res) => {
        if (res.data) {

          setState(res.data)

        }
      })
  }


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
    fetchcountries();
    fetchParentfranchise();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Handle dependent dropdowns
    switch (name) {
      case "country_id":
        fetchregion(value);
        break;
      case "region_id":
        fetchState(value);
        break;
      case "state":
        fetchdistricts(value);
        break;
      case "area":
        fetchCity(value);
        break;
      case "city":
        fetchpincode(value);
        break;
      default:
        break;
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
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Child Franchise Field is required.";
    if (!formData.pfranchise_id) newErrors.pfranchise_id = "Parent Franchise selection is required.";
    if (!formData.contact_person.trim()) newErrors.contact_person = "Contact Person is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.mobile_no.trim()) newErrors.mobile_no = "Mobile Number is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.country_id) newErrors.country_id = "Country selection is required.";
    if (!formData.region_id) newErrors.region_id = "Region selection is required.";
    if (!formData.state) newErrors.state = "State selection is required.";
    if (!formData.area) newErrors.area = "Area selection is required.";
    if (!formData.city) newErrors.city = "City selection is required.";
    if (!formData.pincode_id) newErrors.pincode_id = "Pincode selection is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    return newErrors;
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
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          await axios.put(`${Base_Url}/putchildfranchise`, formData)
            .then((response) => {
              setFormData({
                title: "",
                pfranchise_id: "",
                contact_person: "",
                email: "",
                mobile_no: "",
                password: "",
                country_id: "",
                region_id: "",
                state: "",
                area: "",
                city: "",
                pincode_id: "",
                address: ""
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Child Franchise already exists!");
              }
            });
        } else {
          await axios.post(`${Base_Url}/postchildfranchise`, formData)
            .then((response) => {
              setFormData({
                title: "",
                pfranchise_id: "",
                contact_person: "",
                email: "",
                mobile_no: "",
                password: "",
                country_id: "",
                region_id: "",
                state: "",
                area: "",
                city: "",
                pincode_id: "",
                address: ""
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Child Franchise already exists!");
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
      const response = await axios.post(`${Base_Url}/deletechildfranchise`, {
        id,
      });
      setFormData({
        title: "",
        pfranchise_id: "",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(
        `${Base_Url}/requestchildfranchise/${id}`
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
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className="row mp0">
                <div className="col-md-6">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="Parent Franchise" className="form-label pb-0 dropdown-label">
                          Parent Franchise
                        </label>
                        <select
                          className="form-select dropdown-select"
                          name="pfranchise_id"
                          value={formData.pfranchise_id}
                          onChange={handleChange}
                          style={{ fontSize: "18px" }}
                        >
                          <option value="">Select Parent Franchise</option>
                          {Parentfranchise.map((pf) => (
                            <option key={pf.id} value={pf.id}>
                              {pf.title}
                            </option>
                          ))}
                        </select>
                        {errors.pfranchise_id && (
                          <small className="text-danger">
                            {errors.pfranchise_id}
                          </small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="ChildFranchiseMasterInput"
                          className="input-field"
                          style={{ marginBottom: "15px", fontSize: "18px" }}
                        >
                          Child Franchise Master
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          id="ChildFranchiseMasterInput"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter Child Franchise Master"
                          style={{ fontSize: "18px" }}
                        />
                        {errors.title && (
                          <small className="text-danger">{errors.title}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="MasterFranchiseInput"
                          className="input-field"
                          style={{ fontSize: "18px" }}
                        >
                          Child Franchise Master(Contact Person)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="contact_person"
                          id="ChildFranchiseCP"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="Enter Contact Person"
                          style={{ fontSize: "18px" }}
                        />
                        {errors.contact_person && (
                          <small className="text-danger">{errors.contact_person}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="ChildFranchiseMasterInput"
                          className="input-field"
                          style={{ marginBottom: "15px", fontSize: "18px" }}
                        >
                          Child Franchise(Email)
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter Child Franchise Master Email"
                          style={{ fontSize: "18px" }}
                        />
                        {errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="ChildFranchiseMasterInput"
                          className="input-field"
                          style={{ marginBottom: "15px", fontSize: "18px" }}
                        >
                          Child Franchise(Mobile Number)
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="mobile_no"
                          value={formData.mobile_no}
                          onChange={handleChange}
                          placeholder="Enter Mobile Number"
                          pattern="[0-9]{10}"
                          maxLength="15"
                          style={{ fontSize: "18px" }}
                        />
                        {errors.mobile_no && (
                          <small className="text-danger">{errors.mobile_no}</small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label
                          htmlFor="ChildFranchiseMasterInput"
                          className="input-field"
                          style={{ marginBottom: "15px", fontSize: "18px" }}
                        >
                          Child Franchise(Password)
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter Password"
                          style={{ fontSize: "18px" }}
                        />
                        {errors.password && (
                          <small className="text-danger">{errors.password}</small>
                        )}
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

                      <div className="col-md-4">
                        <label htmlFor="region" className="form-label" style={{ fontSize: "18px" }}>
                          Region
                        </label>
                        <select
                          id="region"
                          name="region_id"
                          className="form-select"
                          value={formData.region_id}
                          onChange={handleChange}
                          style={{ fontSize: "18px" }}
                        >
                          <option value="">Select Region</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="geostate" className="form-label">
                          Geo State
                        </label>
                        <select className="form-control" value={formData.state} name="state" onChange={handleChange}>
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

                      <div className="col-md-4">
                        <label htmlFor="area" className="form-label">
                          District
                        </label>
                        <label className="form-label">Area</label>
                        <select className="form-control" onChange={handleChange} name="area" value={formData.area}>
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

                      <div className="col-md-4">
                        <label htmlFor="geocity" className="form-label">
                          Geo City
                        </label>
                        <select className="form-control" value={formData.city} name="city" onChange={handleChange}>
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

                      <div className="col-md-4">
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

                  {/* Adjust table padding and spacing */}
                  <table className="table table-bordered table-hover" style={{ marginTop: "20px" }}>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col" width="10%" style={{ textAlign: "center" }}>#</th>
                        <th scope="col" width="35%" style={{ textAlign: "center" }}>Parent Franchise</th>
                        <th scope="col" width="35%" style={{ textAlign: "center" }}>Child Franchise</th>
                        <th scope="col" width="15%" style={{ textAlign: "center" }}>Edit</th>
                        <th scope="col" width="15%" style={{ textAlign: "center" }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: "center" }}>{index + 1 + indexOfFirstUser}</td>
                          <td>{item.totle}</td>
                          <td>{item.title}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
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

export default Childfranchisemaster;
