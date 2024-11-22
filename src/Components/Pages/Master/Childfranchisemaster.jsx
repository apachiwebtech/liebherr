import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import Franchisemaster from '../Master/Franchisemaster';
import { useParams } from "react-router-dom";
import md5 from 'md5';

const Childfranchisemaster = () => {
  const { childid } = useParams();

  const [Parentfranchise, setParentfranchise] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [duplicateError, setDuplicateError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  // const [filteredUsers, setFilteredUsers] = useState([]);
  // const [currentPage, setCurrentPage] = useState(0);
  // const [itemsPerPage, setItemsPerPage] = useState(10);
  // const [searchTerm, setSearchTerm] = useState("");

  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [state, setState] = useState([])
  const [area, setdistricts] = useState([])
  const [city, setCity] = useState([])
  const [pincode, setPincode] = useState([])
    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

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
    address: "",
    licare_code: "",
    partner_name: "",
    website: "",
    gst_number: "",
    pan_number: "",
    bank_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_address: "",
    last_working_date: "",
    contract_activation_date: "",
    contract_expiration_date: "",
    with_liebherr: "",
  });

  const fetchchildfranchisepopulate = async (childid) => {
    try {

      const response = await axios.get(`${Base_Url}/getchildfranchisepopulate/${childid}`);
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
        pfranchise_id: response.data[0].pfranchise_id,
        title: response.data[0].title,
        contact_person: response.data[0].contact_person,
        email: response.data[0].email,
        mobile_no: response.data[0].mobile_no,
        password: response.data[0].password,
        country_id: response.data[0].country_id,
        region_id: response.data[0].region_id,
        state: response.data[0].geostate_id,
        area: response.data[0].area_id,
        city: response.data[0].geocity_id,
        pincode_id: response.data[0].pincode_id,
        address: response.data[0].address,
        licare_code: response.data[0].licare_code,
        partner_name: response.data[0].partner_name,
        website: response.data[0].webste,
        gst_number: response.data[0].gstno,
        pan_number: response.data[0].panno,
        bank_name: response.data[0].bankname,
        bank_account_number: response.data[0].bankacc,
        bank_ifsc_code: response.data[0].bankifsc,
        bank_address: response.data[0].bankaddress,
        last_working_date: response.data[0].lastworkinddate,
        contract_activation_date: response.data[0].contractacti,
        contract_expiration_date: response.data[0].contractexpir,
        with_liebherr: response.data[0].withliebher
      });

      setIsEdit(true);

      if (response.data[0].country_id) {
        fetchregion(response.data[0].country_id);
      }
      if (response.data[0].region_id) {
        fetchState(response.data[0].region_id);
      }
      if (response.data[0].geostate_id) {
        fetchdistricts(response.data[0].geostate_id);
      }
      if (response.data[0].area_id) {
        fetchCity(response.data[0].area_id);
      }
      if (response.data[0].geocity_id) {
        fetchpincode(response.data[0].geocity_id);
      }

    } catch (error) {
      console.error("Error fetching Parentfranchise:", error);
    }
  };

  // End Fetch Child Franchise Deatils for populate

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
      // setFilteredUsers(response.data);
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
    fetchcountries();
    fetchUsers();
    fetchParentfranchise();

    if (childid && childid !== '0') {
      fetchchildfranchisepopulate(childid);
    }
  }, [childid]);

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



  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pfranchise_id) newErrors.pfranchise_id = "Parent Franchise selection is required.";
    if (!formData.title.trim()) newErrors.title = "Child Franchise Field is required.";
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

    // Add validations for new fields
    if (!formData.licare_code.trim()) newErrors.licare_code = "Licare Code is required.";
    if (!formData.partner_name.trim()) newErrors.partner_name = "Partner Name is required.";
    if (!formData.gst_number.trim()) newErrors.gst_number = "GST Number is required.";
    if (!formData.pan_number.trim()) newErrors.pan_number = "PAN Number is required.";
    if (!formData.bank_name.trim()) newErrors.bank_name = "Bank Name is required.";
    if (!formData.bank_account_number.trim()) newErrors.bank_account_number = "Bank Account Number is required.";
    if (!formData.bank_ifsc_code.trim()) newErrors.bank_ifsc_code = "Bank IFSC Code is required.";

    return newErrors;
  };


  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation Errors:", validationErrors);
      setErrors(validationErrors);
      return;
    }
    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        const hashedFormData = {
          ...formData,
          password: md5(formData.password) // Hash the password using MD5
        };
        if (isEdit) {
          await axios
          .put(`${Base_Url}/putchildfranchise`, { ...hashedFormData, created_by })
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
                address: "",
                licare_code: "",
                partner_name: "",
                website: "",
                gst_number: "",
                pan_number: "",
                bank_name: "",
                bank_account_number: "",
                bank_ifsc_code: "",
                bank_address: "",
                last_working_date: "",
                contract_activation_date: "",
                contract_expiration_date: "",
                with_liebherr: ""
              });
              fetchUsers();
              setIsEdit(false);
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Child Franchise already exists!"
                );
              }
            });
        } else {

          await axios.post(`${Base_Url}/postchildfranchise`, { ...hashedFormData, created_by })
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
                address: "",
                licare_code: "",
                partner_name: "",
                website: "",
                gst_number: "",
                pan_number: "",
                bank_name: "",
                bank_account_number: "",
                bank_ifsc_code: "",
                bank_address: "",
                last_working_date: "",
                contract_activation_date: "",
                contract_expiration_date: "",
                with_liebherr: ""
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Child Franchise already exists!"
                );
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };


  return (
    <div className="tab-content">
      <Franchisemaster />
      <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
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

                  <div className="col-md-3">
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

                  <div className="col-md-3">
                    <label className="input-field">Child Licare Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="licare_code"
                      value={formData.licare_code}
                      onChange={handleChange}
                      placeholder="Enter Licare Code"
                    />
                    {errors.licare_code && <small className="text-danger">{errors.licare_code}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field"> Child Franchise Master(Contact Person)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      placeholder="Enter Contact Person"
                    />
                    {errors.contact_person && <small className="text-danger">{errors.contact_person}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Franchise Master (Email)</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Franchise Master Email"
                    />
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Franchise Master (Mobile Number)</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number"
                      pattern="[0-9]{10}"
                      maxLength="15"
                    />
                    {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Partner Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="partner_name"
                      value={formData.partner_name}
                      onChange={handleChange}
                      placeholder="Enter Partner Name"
                    />
                    {errors.partner_name && <small className="text-danger">{errors.partner_name}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Franchise Master (Password)</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                    />
                    {errors.password && <small className="text-danger">{errors.password}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Country</label>
                    <select
                      name="country_id"
                      className="form-select"
                      value={formData.country_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>{country.title}</option>
                      ))}
                    </select>
                    {errors.country_id && <small className="text-danger">{errors.country_id}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Region</label>
                    <select
                      name="region_id"
                      className="form-select"
                      value={formData.region_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>{region.title}</option>
                      ))}
                    </select>
                    {errors.region_id && <small className="text-danger">{errors.region_id}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Geo State</label>
                    <select
                      name="state"
                      className="form-select"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      {state.map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                    {errors.state && <small className="text-danger">{errors.state}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">District</label>
                    <select
                      name="area"
                      className="form-select"
                      value={formData.area}
                      onChange={handleChange}
                    >
                      <option value="">Select District</option>
                      {area.map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                    {errors.area && <small className="text-danger">{errors.area}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Geo City</label>
                    <select
                      name="city"
                      className="form-select"
                      value={formData.city}
                      onChange={handleChange}
                    >
                      <option value="">Select City</option>
                      {city.map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                    {errors.city && <small className="text-danger">{errors.city}</small>}
                  </div>

                  <div className="col-md-3">
                    <label htmlFor="area" className="input-field">
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

                  <div className="col-md-3">
                    <label className="input-field">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Enter Website URL"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">GST Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleChange}
                      placeholder="Enter GST Number"
                    />
                    {errors.gst_number && <small className="text-danger">{errors.gst_number}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">PAN Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pan_number"
                      value={formData.pan_number}
                      onChange={handleChange}
                      placeholder="Enter PAN Number"
                    />
                    {errors.pan_number && <small className="text-danger">{errors.pan_number}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Bank Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      placeholder="Enter Bank Name"
                    />
                    {errors.bank_name && <small className="text-danger">{errors.bank_name}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Bank Account Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bank_account_number"
                      value={formData.bank_account_number}
                      onChange={handleChange}
                      placeholder="Enter Bank Account Number"
                    />
                    {errors.bank_account_number && <small className="text-danger">{errors.bank_account_number}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Bank IFSC Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bank_ifsc_code"
                      value={formData.bank_ifsc_code}
                      onChange={handleChange}
                      placeholder="Enter Bank IFSC Code"
                    />
                    {errors.bank_ifsc_code && <small className="text-danger">{errors.bank_ifsc_code}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Last Working Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="last_working_date"
                      value={formData.last_working_date ? formData.last_working_date.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Contract Activation Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="contract_activation_date"
                      value={formData.contract_activation_date ? formData.contract_activation_date.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Contract Expiration Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="contract_expiration_date"
                      value={formData.contract_expiration_date ? formData.contract_expiration_date.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">With Liebherr</label>
                    <input
                      type="date"
                      className="form-control"
                      name="with_liebherr"
                      value={formData.with_liebherr ? formData.with_liebherr.split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="input-field">Bank Address</label>
                    <textarea
                      className="form-control"
                      name="bank_address"
                      value={formData.bank_address}
                      onChange={handleChange}
                      placeholder="Enter Bank Address"
                      rows="3"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="input-field">Address</label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                      rows="3"
                    />
                    {errors.address && <small className="text-danger">{errors.address}</small>}
                  </div>

                  <div className="col-12 text-right">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Childfranchisemaster;