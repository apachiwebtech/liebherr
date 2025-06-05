import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Franchisemaster from '../Master/Franchisemaster';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from "react-router-dom";
import md5 from "js-md5";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const Childfranchisemaster = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  let { childid } = useParams();
  let { licare_code } = useParams();
  const token = localStorage.getItem("token");
  const [Parentfranchise, setParentfranchise] = useState([]);
  const [address, setAddress] = useState([]);
  const [errors, setErrors] = useState({});
  const [errors1, setErrors1] = useState({});
  const [users, setUsers] = useState([]);
  const [updateid, setEditid] = useState('');
  const [locations, setlocations] = useState({
    country: '',
    region: '',
    state: '',
    district: '',
    city: '',
  });
  const [duplicateError, setDuplicateError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [edit, setedit] = useState(false);
  const [open, setOpen] = useState(false);
  const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
  const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage


  try {
    childid = childid.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(childid, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    childid = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }

  try {
    licare_code = licare_code.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(licare_code, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    licare_code = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }


  const handleopen = () => {
    setOpen(true);

  }

  const handleClose = () => {
    setOpen(false);
  };


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
    address_code: "",
  });

  const [formData1, setFormData1] = useState({
    address_code: "",
    address: "",
  });

  const fetchchildfranchisepopulate = async (childid) => {
    try {

      const response = await axiosInstance.get(`${Base_Url}/getchildfranchisepopulate/${childid}`, {
        headers: {
          Authorization: token,
        },
      });
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
        with_liebherr: response.data[0].withliebher,
        address_code: response.data[0].address_code

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
      console.error("Error fetching Parentfranchise:", error);
    }
  };

  // End Fetch Child Franchise Deatils for populate
  const fetchParentfranchise = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getparentfranchise`, {
        headers: {
          Authorization: token,
        },
      }
      );
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setParentfranchise(decryptedData);
    } catch (error) {
      console.error("Error fetching Parentfranchise:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getchildFranchiseDetails`, {
        headers: {
          Authorization: token,
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setUsers(decryptedData);
      // setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  //This is for State Dropdown


  useEffect(() => {

    fetchUsers();
    fetchParentfranchise();
    fetchaddress(licare_code);



    if (childid && childid !== '0') {
      fetchchildfranchisepopulate(childid);
    }
  }, [childid]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for date fields to ensure current date is used
    if (['with_liebherr', 'contract_activation_date', 'contract_expiration_date', 'last_working_date'].includes(name)) {
      setFormData(prevState => ({
        ...prevState,
        [name]: value ? new Date(value).toISOString().split('T')[0] : ''
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

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

    const requiredFields = {
      pfranchise_id: "Parent Franchise selection is required.",
      title: "Child Franchise Field is required.",
      contact_person: "Contact Person is required.",
      email: "Email is required.",
      mobile_no: "Mobile Number is required.",
      password: "Password is required.",
      address: "Address is required.",
      partner_name: "Partner Name is required.",
      address_code: "Address Code is Required"
    };

    for (const key in requiredFields) {
      if (!formData[key] || !formData[key].toString().trim()) {
        newErrors[key] = requiredFields[key];
      }
    }

    return newErrors;
  };

  const validateForm1 = () => {
    const newErrors = {};

    const requiredFields = {
      address_code: "Address Code  is required.",
      address: "Address is required.",
    };

    for (const key in requiredFields) {
      if (!formData1[key] || !formData1[key].toString().trim()) {
        newErrors[key] = requiredFields[key];
      }
    }

    return newErrors;
  };


  const navigate = useNavigate()


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
        // const hashedFormData = {
        //   ...formData,
        //   password: md5(formData.password) // Hash the password using MD5
        // };

        const hashedFormData = Object.fromEntries(
          Object.entries({
            ...formData,
            password: md5(formData.password || '') // Ensure password is not null before hashing
          }).map(([key, value]) => [key, value == null ? '' : String(value)])
        );



        if (isEdit) {
          await axios
            .post(`${Base_Url}/putchildfranchise`, { ...hashedFormData, created_by }, {
              headers: {
                Authorization: token,
              },
            })
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
                with_liebherr: "",
                address_code: "",
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

          await axiosInstance.post(`${Base_Url}/postchildfranchise`, { ...hashedFormData, created_by }, {
            headers: {
              Authorization: token,
            },
          })
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
                with_liebherr: "",
                address_code: "",
              });
              navigate('/Childfranchiselist')
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

  // Add Address Start
  const fetchaddress = async () => {
    try {
      const response = await axios.post(
        `${Base_Url}/getaddress`,
        { childid: String(childid) },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const encryptedData = response.data.encryptedData;

      // Decrypt data
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setAddress(decryptedData);

    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleaddressSubmit = async (e) => {
    e.preventDefault();
    const validationErrors1 = validateForm1();
    if (Object.keys(validationErrors1).length > 0) {
      console.log("Validation Errors:", validationErrors1);
      setErrors1(validationErrors1);
      return;
    }
    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (edit) {
          await axios
            .post(`${Base_Url}/putaddress`, { ...formData1, created_by, updateid:String(updateid) }, {
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {

              setFormData1({
                address_code: "",
                address: "",
              });
              fetchaddress();
              setedit(false);
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Address Code already exists!"
                );
              }
            });
        } else {

          await axiosInstance.post(`${Base_Url}/postaddaddress`, { ...formData1, created_by, childid:String(childid) }, {
            headers: {
              Authorization: token,
            },
          })
            .then((response) => {


              setFormData1({
                address_code: "",
                address: ""
              });
              fetchaddress();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Address Code already exists!"
                );
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const handleChange1 = (e) => {
    const { name, value } = e.target;

    setFormData1(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDeleteAddress = async (deleteid) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) {
      return; // User canceled
    }

    try {
      const response = await axios.post(`${Base_Url}/deleteaddress`, {
        deleteid:String(deleteid),
      }, {
        headers: {
          Authorization: token,
        },
      });

      alert(response.data.message);
      fetchaddress(); // Refresh the list
      fetchchildfranchisepopulate(childid);

    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete address.");
    }
  };


  const requestaddress = async (editid) => {

    setEditid(editid)
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestaddress/${editid}`, {
        headers: { Authorization: token },
      });

      console.log("Response from API:", response.data); // Check structure
      setFormData1(response.data);
      setedit(true);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  const handleSetDefault = async (defaultid) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(`${Base_Url}/setdefaultaddress`, { defaultid:String(defaultid) }, {
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 200) {
        fetchaddress(); // Refresh list
        fetchchildfranchisepopulate(childid);
      } else {
        console.error("Failed to set default address");
      }
    } catch (error) {
      console.error("Error while setting default address:", error);
    }
  };













  // Add Address End

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
    pageid: String(22)
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
      <Franchisemaster />
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <label htmlFor="Parent Franchise" className="form-label pb-0 dropdown-label">
                      Master Service Partner
                    </label>
                    <select
                      className="form-select dropdown-select"
                      name="pfranchise_id"
                      value={formData.pfranchise_id}
                      onChange={handleChange}
                      style={{ fontSize: "18px" }}
                    >
                      <option value="">Select Master Service Partner</option>
                      {Parentfranchise.map((pf) => (
                        <option key={pf.id} value={pf.licarecode}>
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
                      Child Service Partner <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      id="ChildFranchiseMasterInput"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter Child Service Partner "
                      style={{ fontSize: "18px" }}
                    />
                    {errors.title && (
                      <small className="text-danger">{errors.title}</small>
                    )}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Licare Code</label>
                    <input
                      type="text" disabled
                      className="form-control"
                      name="licare_code"
                      value={formData.licare_code}
                      onChange={handleChange}
                      placeholder="Enter Licare Code"
                    />
                    {errors.licare_code && <small className="text-danger">{errors.licare_code}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field"> Child Service Partner(Contact Person)<span className="text-danger">*</span></label>
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
                    <label className="input-field">Child Service Partner (Email)<span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter  Email"
                    />
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </div>

                  <div className="col-md-3">
                    <label className="input-field">Child Service Partner (Mobile Number)<span className="text-danger">*</span></label>
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
                    <label className="input-field">Child Partner Name<span className="text-danger">*</span></label>
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
                    <label className="input-field">Child Service Partner (Password)<span className="text-danger">*</span></label>
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

                  <div className="col-md-3">
                    <label htmlFor="area" className="input-field">
                      Pincode<span className="text-danger">*</span>

                    </label>

                    <input type="text" className="form-control" value={formData.pincode_id} name="pincode_id" onChange={handleChange} placeholder="Enter Pincode" />
                    {/* <select
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
                    </select> */}
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
                    <label className="input-field">With Liebherr<span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      name="with_liebherr"
                      value={formData.with_liebherr ? formData.with_liebherr.split('T')[0] : ''}
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
                    <label className="input-field">Address Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address_code"
                      value={formData.address_code}
                      onChange={handleChange}
                      disabled={isEdit}
                      placeholder="Enter Address Code"
                    />
                    {errors.address_code && <small className="text-danger">{errors.address_code}</small>}
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
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="input-field">Address<span className="text-danger">*</span></label>
                      {isEdit && (
                        <span
                          className="text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={handleopen}
                        >
                          Add Address +
                        </span>
                      )}

                    </div>
                    <textarea
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isEdit}
                      placeholder="Enter Address"
                      rows="3"
                    />
                    {errors.address && <small className="text-danger">{errors.address}</small>}
                  </div>

                  {roleaccess > 2 ? <div className="col-12 text-right">
                    <button
                      className="btn btn-liebherr"
                      type="submit"
                      style={{ marginTop: "15px" }}
                    >
                      {isEdit ? "Update" : "Submit"}
                    </button>
                  </div> : null}
                </div>
              </form>

              <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                maxWidth="lg"
              >
                <DialogTitle id="alert-dialog-title">Add Address</DialogTitle>
                <DialogContent style={{ width: "100%" }}>
                  <div className="row">
                    {/* Form Section */}

                    <div className="col-md-4 mb-3">
                      <div className="row">
                        <div className="col-md-12 mb-2">
                          <label className="input-field">Address Code <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            name="address_code"
                            value={formData1.address_code}
                            onChange={handleChange1}
                            placeholder="Enter Address Code"
                          />
                          {errors1.address_code && (
                            <small className="text-danger">{errors1.address_code}</small>
                          )}
                        </div>
                        <div className="col-md-12 mb-2">
                          <label className="input-field">
                            Address <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            name="address"
                            value={formData1.address}
                            onChange={handleChange1}
                            placeholder="Enter Address"
                            rows="3"
                          />
                          {errors1.address && (
                            <small className="text-danger">{errors1.address}</small>
                          )}
                        </div>
                        <div className="col-md-12 text-right">

                          <button
                            className="btn btn-sm btn-danger"
                            style={{ marginRight: '5px' }}
                            onClick={() => {
                              setFormData1({
                                address_code: "",
                                address: "",
                                // reset other fields here
                              });
                              setedit(false)
                            }}
                          >
                            Clear
                          </button>

                          {edit ? <button className="btn btn-sm btn-primary" onClick={handleaddressSubmit}> Update</button>
                            : <button className="btn btn-sm btn-primary" onClick={handleaddressSubmit}> Submit</button>}


                        </div>
                      </div>


                    </div>
                    {/* Table Section */}
                    <div className="col-md-8 mb-3">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Address Code</th>
                            <th>Address</th>
                            <th>Edit</th>
                            <th>Delete</th>
                            <th>Default Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {address.map((item) => {
                            return (
                              <tr key={item.id}>
                                <td>{item.address_code}</td>
                                <td>{item.address}</td>
                                <td>
                                  <button className="btn btn-sm btn-primary" onClick={() => requestaddress(item.id)}>Edit</button>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAddress(item.id)}> Delete</button>
                                </td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${item.default_address === 1 ? 'btn-secondary' : 'btn-success'}`}
                                    disabled={item.default_address === 1}
                                    onClick={() => handleSetDefault(item.id)}
                                  >
                                    {item.default_address === 1 ? "Default" : "Set as Default"}
                                  </button>

                                </td>

                              </tr>
                            )
                          })}
                          {/* Add more rows dynamically if needed */}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} autoFocus>
                    Close
                  </Button>
                </DialogActions>
              </Dialog>

            </div>
          </div>
        </div>
      </div > : null}
    </div >
  );
};

export default Childfranchisemaster;
