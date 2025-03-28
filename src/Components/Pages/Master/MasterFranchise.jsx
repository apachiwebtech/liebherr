import axios from "axios";
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { useParams } from "react-router-dom";
import Franchisemaster from '../Master/Franchisemaster';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import md5 from 'js-md5';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { IoArrowBack } from "react-icons/io5";


const MasterFranchise = (params) => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  let { masterid } = useParams();
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
  const navigate = useNavigate();
  const [locations, setlocations] = useState({
    country: '',
    region: '',
    state: '',
    district: '',
    city: '',
  });
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


  try {
    masterid = masterid.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(masterid, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    masterid = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getfranchisedata`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setUsers(decryptedData);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching Franchise Master:", error);
    }
  };

  const fetchData = async (url, setStateFunction, errorMessage) => {
    try {
      const response = await axiosInstance.get(url);
      setStateFunction(response.data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };


  const fetchFranchisemasterpopulate = async (masterid) => {

    try {
      const response = await axiosInstance.get(`${Base_Url}/getmasterfranchisepopulate/${masterid}`, {
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

      setlocations({
        country: response.data[0].country_id,
        region: response.data[0].region_id,
        state: response.data[0].geostate_id,
        district: response.data[0].area_id,
        city: response.data[0].geocity_id
      });


      setIsEdit(true);


    } catch (error) {
      console.error('Error fetching franchisemasterdata:', error);
      setFormData([]);
    }
  };

  useEffect(() => {
    fetchUsers();

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
      case "pincode_id":
        fetchlocations(value);
        break;
      default:
        break;
    }

  };


  const fetchlocations = async (pincode) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/getdatafrompincode/${pincode}`, {
        headers: {
          Authorization: token,
        },
      }
      );

      if (response.data && response.data[0]) {
        // Update locations display state
        setlocations({
          region: response.data[0].region,
          state: response.data[0].state,
          district: response.data[0].district,
          city: response.data[0].city,
          country: response.data[0].country
        });

        // Update formData with the new location values
        setFormData(prevState => ({
          ...prevState,
          country_id: response.data[0].country,
          region_id: response.data[0].region,
          state: response.data[0].state,
          area: response.data[0].district,
          city: response.data[0].city,
        }));
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error);
    }
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
            .post(`${Base_Url}/putfranchisedata`, { ...hashedFormData, created_by }, {
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
            .post(`${Base_Url}/postfranchisedata`, { ...formData, created_by }, {
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
    pageid: String(19)
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
      {roleaccess > 1 ? <div className="row mt-1 mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body">
              <IoArrowBack onClick={() => navigate(-1)} style={{ fontSize: "25px", cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div> : null}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <h2 className="pname" style={{ fontSize: "20px" }}>Master Service Partner Details :</h2>
                <hr></hr>

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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                    <div className="col-md-3" hidden>
                      <label className="input-field">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locations.country}
                        name="country_id"
                        onChange={handleChange}
                        placeholder="Country"
                        readOnly
                      />
                      {errors.country_id && <small className="text-danger">{errors.country_id}</small>}
                    </div>
                    <div className="col-md-3">
                      <label className="input-field">Region</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locations.region}
                        name="region_id"
                        onChange={handleChange}
                        placeholder="Region"
                        readOnly
                      />
                      {errors.region_id && <small className="text-danger">{errors.region_id}</small>}
                    </div>

                    {/* Geo State Dropdown */}
                    <div className="col-md-3">
                      <label className="input-field">Geo State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locations.state}
                        name="state"
                        onChange={handleChange}
                        placeholder="State"
                        readOnly
                      />
                      {errors.state && <small className="text-danger">{errors.state}</small>}
                    </div>

                    {/* Geo District Dropdown **/}
                    <div className="col-md-3">
                      <label className="input-field">District</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locations.district}
                        name="area"
                        onChange={handleChange}
                        placeholder="District"
                        readOnly
                      />
                      {errors.state && <small className="text-danger">{errors.state}</small>}
                    </div>

                    {/* Geo City Dropdown */}
                    <div className="col-md-3">
                      <label className="input-field">Geo City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={locations.city}
                        name="city"
                        onChange={handleChange}
                        placeholder="City"
                        readOnly
                      />
                      {errors.city && <small className="text-danger">{errors.city}</small>}
                    </div>


                    {/* Pincode Dropdown */}
                    <div className="col-md-3">
                      <label htmlFor="area" className="input-field">
                        Pincode<span className="text-danger">*</span>

                      </label>

                      <input type="text" className="form-control" value={formData.pincode_id} name="pincode_id" onChange={handleChange} placeholder="Enter Pincode" readOnly />
                      {errors.pincode_id && (
                        <small className="text-danger">{errors.pincode_id}</small>
                      )}
                    </div>
                    <div className="col-3">
                      <label htmlFor="WebsiteInput" className="input-field">
                        Website
                      </label>
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <input disabled
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
                      <textarea disabled
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
                      <textarea disabled
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



                    {roleaccess > 2 ? <div className="text-right">
                      <button hidden
                        className="btn btn-liebherr"
                        type="submit"
                        style={{ marginTop: "15px" }}
                      >
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
                  </div>
                </form>



              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default MasterFranchise;
