import axios from "axios";
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import { useParams } from "react-router-dom";
import Franchisemaster from '../Master/Franchisemaster';
import { useNavigate } from "react-router-dom";
import md5 from 'js-md5';

const MasterFranchise = (params) => {
  // Step 1: Add this state to track errors
  const { masterid } = useParams();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [Franchisemasterdata, setFranchisemasterdata] = useState([]);
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
  const token = localStorage.getItem("token"); // Get token from localStorage
  const created_by = localStorage.getItem("id");
  const [formData, setFormData] = useState({
    title: "",
    password: "",
    contact_person: '',
    email: "",
    mobile_no: '',
    address: '',
    country_id: '',
    region_id: '',
    state: '',
    area: '',
    city: '',
    pincode_id: '',
    website: '',
    gst_no: '',
    panno: '',
    bank_name: '',
    bank_acc: '',
    bank_ifsc: '',
    withliebher: '',
    lastworkinddate: '' || '',
    contract_acti: '',
    contract_expir: '',
    bank_address: '',
    licarecode: '',
    partner_name: '',



  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getfranchisedata`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
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
      const response = await axios.get(`${Base_Url}/getcountries`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setCountries(response.data);
    } catch (error) {
      console.error("Error fetching Countries:", error);
    }
  };

  //region
  const fetchregion = async (country_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getregionscity/${country_id}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching Regions:", error);
    }
  };

  //geostate
  const fetchState = async (region_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeostatescity/${region_id}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setState(response.data);
    } catch (error) {
      console.error("Error fetching Geo State:", error);
    }
  };

  const fetchdistricts = async (geostateID) => {
    try {
      const response = await axios.get(`${Base_Url}/getdistrictcity/${geostateID}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setdistricts(response.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchCity = async (area_id) => {
    try {
      const response = await axios.get(`${Base_Url}/getgeocities_p/${area_id}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setCity(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  const fetchpincode = async (cityid) => {
    try {
      const response = await axios.get(`${Base_Url}/getpincodebyid/${cityid}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setPincode(response.data);
    } catch (error) {
      console.error("Error fetching pincode:", error);
    }
  };

  const fetchFranchisemasterpopulate = async (masterid) => {

    try {
      const response = await axios.get(`${Base_Url}/getmasterfranchisepopulate/${masterid}`,{
        headers: {
           Authorization: token, // Send token in headers
         }, 
       });
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
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
        gst_no: response.data[0].gstno,
        panno: response.data[0].panno,
        bank_name: response.data[0].bankname,
        bank_acc: response.data[0].bankacc,
        bank_ifsc: response.data[0].bankifsc,
        bank_address: response.data[0].bankaddress,
        lastworkinddate: response.data[0].lastworkinddate,
        contract_acti: response.data[0].contractacti,
        contract_expir: response.data[0].contractexpir,
        withliebher: response.data[0].withliebher
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
      console.error('Error fetching franchisemasterdata:', error);
      setFormData([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchcountries();

    if (masterid != 0) {
      fetchFranchisemasterpopulate(masterid);
    }



  }, []);

  const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prevState => ({
    ...prevState,
    [name]: value
  }));

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

    // Helper function to safely check empty values
    const isEmpty = (value) => {
      return value === undefined || value === null || String(value).trim() === '';
    };

    // Text/Email/Number inputs validation
    if (isEmpty(formData.title)) newErrors.title = "Franchise Master Field is required.";
    if (isEmpty(formData.licarecode)) newErrors.licarecode = "Licare Code is required.";
    if (isEmpty(formData.contact_person)) newErrors.contact_person = "Contact Person is required.";
    if (isEmpty(formData.email)) newErrors.email = "Email is required.";
    if (isEmpty(formData.mobile_no)) newErrors.mobile_no = "Mobile Number is required.";
    if (isEmpty(formData.partner_name)) newErrors.partner_name = "Partner Name is required.";
    if (isEmpty(formData.password || !formData.passwordmd5)) newErrors.password = "Password is required.";
    // if (isEmpty(formData.website)) newErrors.website = "Website is required.";
    // if (isEmpty(formData.gst_no)) newErrors.gst_no = "GST Number is required.";
    // if (isEmpty(formData.panno)) newErrors.panno = "PAN Number is required.";
    // if (isEmpty(formData.bank_name)) newErrors.bank_name = "Bank Name is required.";
    // if (isEmpty(formData.bank_acc)) newErrors.bank_acc = "Bank Account Number is required.";
    // if (isEmpty(formData.bank_ifsc)) newErrors.bank_ifsc = "Bank IFSC Code is required.";

    // Date inputs validation
    if (!formData.withliebher) newErrors.withliebher = "With Liebherr date is required.";
    // if (!formData.lastworkinddate) newErrors.lastworkinddate = "Last Working Date is required.";
    //if (!formData.contract_acti) newErrors.contract_acti = "Contract Activation Date is required.";
    //if (!formData.contract_expir) newErrors.contract_expir = "Contract Expiration Date is required.";

    // Dropdown validations
    if (!formData.country_id) newErrors.country_id = "Country is required.";
    if (!formData.region_id) newErrors.region_id = "Region is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.area) newErrors.area = "District is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.pincode_id) newErrors.pincode_id = "Pincode is required.";

    // Textarea validations
    // if (isEmpty(formData.bank_address)) newErrors.bank_address = "Bank Address is required.";
    if (isEmpty(formData.address)) newErrors.address = "Address is required.";

    return newErrors;
  };
  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();


    const validationErrors = validateForm();
    const newErrors = {};
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
        const hashedFormData = {
          ...formData,
          password: md5(formData.password) // Hash the password using MD5
        };
        if (isEdit) {
          // For update, include duplicate check
          await axios
            .put(`${Base_Url}/putfranchisedata`, { ...hashedFormData, created_by },{
              headers: {
                 Authorization: token, // Send token in headers
               }, 
             })
            .then((response) => {
              setFormData({
                title: "",
                password: "",
                contact_person: '',
                email: "",
                mobile_no: '',
                address: '',
                country_id: '',
                region_id: '',
                state: '',
                area: '',
                city: '',
                pincode_id: '',
                website: '',
                gst_no: '',
                panno: '',
                bank_name: '',
                bank_acc: '',
                bank_ifsc: '',
                withliebher: '',
                lastworkinddate: '' || '',
                contract_acti: '',
                contract_expir: '',
                bank_address: '',
                licarecode: '',
                partner_name: '',


              });
              fetchUsers();
              setIsEdit(false);
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
            .post(`${Base_Url}/postfranchisedata`, { ...formData, created_by },{
              headers: {
                 Authorization: token, // Send token in headers
               }, 
             })
            .then((response) => {
              //const newpassword = md5(formData.password)

              setFormData({
                title: "",
                password: '',
                contact_person: '',
                email: "",
                mobile_no: '',
                address: '',
                country_id: '',
                region_id: '',
                state: '',
                area: '',
                city: '',
                pincode_id: '',
                website: '',
                gst_no: '',
                panno: '',
                bank_name: '',
                bank_acc: '',
                bank_ifsc: '',
                withliebher: '',
                lastworkinddate: '',
                contract_acti: '',
                contract_expir: '',
                bank_address: '',
                licarecode: '',
                partner_name: '',

              });
              fetchUsers();
              setIsEdit(false);
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
      },{
        headers: {
           Authorization: token, // Send token in headers
         }, 
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
        ,{
          headers: {
             Authorization: token, // Send token in headers
           }, 
         });
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

                  className="col-12"
                >
                  <div className="row">
                    <div className="col-3">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Master Service Partner  <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        id="MasterFranchiseInput"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Master Service Partner"
                      />
                      {errors.title && (
                        <small className="text-danger">{errors.title}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="LicareInput" className="input-field">
                        Licare Code<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="licarecode"
                        id="LicareInput"
                        value={formData.licarecode}
                        onChange={handleChange}
                        placeholder="Enter Licare Code"
                      />
                      {errors.licarecode && (
                        <small className="text-danger">{errors.licarecode}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>

                    <div className="col-3">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Master Service Partner(Contact Person)<span className="text-danger">*</span>
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
                    <div className="col-3">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Master Service Partner (Email)<span className="text-danger">*</span>
                      </label>
                      <input
                        type="email" // Changed type to 'email'
                        className="form-control"
                        name="email"
                        id="MasterFranchiseInput"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter  Email"
                      />
                      {errors.email && (
                        <small className="text-danger">{errors.email}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label
                        htmlFor="MasterFranchiseInput"
                        className="input-field"
                      >
                        Master Service Partner (Mobile Number)<span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel" // Changed type to 'tel' for mobile number input
                        className="form-control"
                        name="mobile_no"
                        id="MasterFranchiseInput"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        placeholder="Enter  Mobile Number"
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
                    <div className="col-3">
                      <label htmlFor="PartnerNameInput" className="input-field">
                        Partner Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="partner_name"
                        id="PartnerNameInput"
                        value={formData.partner_name}
                        onChange={handleChange}
                        placeholder="Enter Partner Name"
                      />
                      {errors.partner_name && (
                        <small className="text-danger">{errors.partner_name}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error  */}
                    </div>

                    <div className="col-3">
                      <label
                        htmlFor="PassInput"
                        className="input-field"
                      >
                        Master Service Partner (Password)<span className="text-danger">*</span>
                      </label>
                      <input
                        type="password" // Changed type to 'password' for secure text input
                        className="form-control"
                        name="password"
                        id="MasterFranchiseInput"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter Password"
                      />
                      {errors.password && (
                        <small className="text-danger">{errors.password}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="country" className="input-field">
                        Country<span className="text-danger">*</span>
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
                      <label htmlFor="region" className="input-field">
                        Region<span className="text-danger">*</span>
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
                      <label htmlFor="geostate" className="input-field">
                        Geo State<span className="text-danger">*</span>
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
                      <label htmlFor="area" className="input-field">
                        District<span className="text-danger">*</span>
                      </label>

                      <select className="form-select" onChange={handleChange} name="area" value={formData.area}>
                        <option value="">Select District</option>
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
                      <label htmlFor="geocity" className="input-field">
                        Geo City<span className="text-danger">*</span>
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
                      <label htmlFor="area" className="input-field">
                        Pincode<span className="text-danger">*</span>
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
                    <div className="col-3">
                      <label htmlFor="WebsiteInput" className="input-field">
                        Website
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="website"
                        id="WebsiteInput"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Enter Website URL"
                      />
                      {errors.website && (
                        <small className="text-danger">{errors.website}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>

                    <div className="col-3">
                      <label htmlFor="GSTNoInput" className="input-field">
                        GST Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="gst_no"
                        id="GSTNoInput"
                        value={formData.gst_no}
                        onChange={handleChange}
                        placeholder="Enter GST Number"
                      />
                      {errors.gst_no && (
                        <small className="text-danger">{errors.gst_no}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="PannoInput" className="input-field">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="panno"
                        id="PannoInput"
                        value={formData.panno}
                        onChange={handleChange}
                        placeholder="Enter PAN Number"
                      />
                      {errors.panno && (
                        <small className="text-danger">{errors.panno}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="BankNameInput" className="input-field">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="bank_name"
                        id="BankNameInput"
                        value={formData.bank_name}
                        onChange={handleChange}
                        placeholder="Enter Bank Name"
                      />
                      {errors.bank_name && (
                        <small className="text-danger">{errors.bank_name}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="BankAccInput" className="input-field">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="bank_acc"
                        id="BankAccInput"
                        value={formData.bank_acc}
                        onChange={handleChange}
                        placeholder="Enter Bank Account Number"
                      />
                      {errors.bank_acc && (
                        <small className="text-danger">{errors.bank_acc}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="BankIfscInput" className="input-field">
                        Bank IFSC Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="bank_ifsc"
                        id="BankIfscInput"
                        value={formData.bank_ifsc}
                        onChange={handleChange}
                        placeholder="Enter Bank IFSC Code"
                      />
                      {errors.bank_ifsc && (
                        <small className="text-danger">{errors.bank_ifsc}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="WithLiebherrInput" className="input-field">
                        With Liebherr<span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="withliebher"
                        id="WithLiebherrInput"
                        value={formData.withliebher ? formData.withliebher.split('T')[0] : ''}
                        onChange={handleChange}
                        placeholder="Enter With Liebherr"
                      />
                      {errors.withliebher && (
                        <small className="text-danger">{errors.withliebher}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="LastWorkingDateInput" className="input-field">
                        Last Working Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="lastworkinddate"
                        id="LastWorkingDateInput"
                        value={formData.lastworkinddate ? formData.lastworkinddate.split('T')[0] : ''}
                        onChange={handleChange}
                        placeholder="Select Last Working Date"
                      />
                      {errors.lastworkinddate && (
                        <small className="text-danger">{errors.lastworkinddate}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="ContractActiInput" className="input-field">
                        Contract Activation Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="contract_acti"
                        id="ContractActiInput"
                        value={formData.contract_acti ? formData.contract_acti.split('T')[0] : ''}
                        onChange={handleChange}
                        placeholder="Select Contract Activation Date"
                      />
                      {errors.contract_acti && (
                        <small className="text-danger">{errors.contract_acti}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                    <div className="col-3">
                      <label htmlFor="ContractExpirInput" className="input-field">
                        Contract Expiration Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="contract_expir"
                        id="ContractExpirInput"
                        value={formData.contract_expir ? formData.contract_expir.split('T')[0] : ''}
                        onChange={handleChange}
                        placeholder="Select Contract Expiration Date"
                      />
                      {errors.contract_expir && (
                        <small className="text-danger">{errors.contract_expir}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                      {/* Show duplicate error */}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <label htmlFor="BankAddressInput" className="input-field">
                        Bank Address
                      </label>
                      <textarea
                        className="form-control"
                        name="bank_address"
                        id="BankAddressInput"
                        value={formData.bank_address}
                        onChange={handleChange}
                        placeholder="Enter Bank Address"
                        rows="3"
                      />
                      {errors.bank_address && (
                        <small className="text-danger">{errors.bank_address}</small>
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
                        Address<span className="text-danger">*</span>
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
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default MasterFranchise;
