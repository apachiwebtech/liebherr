import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Customer = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  let { customerid } = useParams();
  const [customerData, setCustomerData] = useState([]);
  const token = localStorage.getItem("token");
  const [errors, setErrors] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [anniversary_date, setAnniversaryDate] = useState(null);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setSelectedDate(formattedDate)
    }

  };
  const handleDateChange2 = (date) => {


    if (date) {
      const formattedDate = formatDate(date);
      setAnniversaryDate(formattedDate)
    }

  };

  try {
    customerid = customerid.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = CryptoJS.AES.decrypt(customerid, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    customerid = parseInt(decrypted, 10)
  } catch (error) {
    console.log("Error".error)
  }

  const [formData, setFormData] = useState({
    customer_fname: '',
    // customer_lname: '',
    customer_type: '',
    customer_classification: '',
    mobileno: '',
    alt_mobileno: '',
    dateofbirth: '',
    anniversary_date: '',
    email: '',
    salutation: '',
    customer_id: ''
  });

  const fetchCustomerData = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcustomer`, {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      setCustomerData(response.data);
    } catch (error) {
      console.error('Error fetching CustomerData:', error);
    }
  };

  const fetchCustomerpopulate = async (customerid) => {

    try {
      const response = await axiosInstance.get(`${Base_Url}/getcustomerpopulate/${customerid}`, {
        headers: {
          Authorization: token,
        },
      });

      setSelectedDate(response.data[0].dateofbirth)
      setAnniversaryDate(response.data[0].anniversary_date)
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
        customer_fname: response.data[0].customer_fname,
        email: response.data[0].email,
        customer_type: response.data[0].customer_type,
        customer_classification: response.data[0].customer_classification,
        mobileno: response.data[0].mobileno,
        dateofbirth: response.data[0].dateofbirth,
        alt_mobileno: response.data[0].alt_mobileno,
        anniversary_date: response.data[0].anniversary_date,
        salutation: response.data[0].salutation,
        customer_id: response.data[0].customer_id
      });


      setIsEdit(true);




    } catch (error) {
      console.error('Error fetching customerdata:', error);
      setFormData([]);
    }
  };



  useEffect(() => {

    fetchCustomerData();
    if (customerid != 0) {
      fetchCustomerpopulate(customerid);
    }


  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_fname?.trim()) {
      newErrors.customer_fname = "Customer First Name Field is required.";
    }

    if (!formData.customer_type || formData.customer_type === 'selected') {
      newErrors.customer_type = "Customer Type Dropdown is required.";
    }

    if (!formData.customer_classification || formData.customer_classification === 'selected') {
      newErrors.customer_classification = "Customer Classification Dropdown is required.";
    }

    if (!formData.mobileno?.trim()) {
      newErrors.mobileno = "Mobile Number Field is required.";
    }


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

    const payload ={
      ...formData,
      anniversary_date: anniversary_date,
      dateofbirth :selectedDate
    }

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();


    setDuplicateError(''); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include duplicate check
          await axiosInstance.post(`${Base_Url}/putcustomer`, {
            encryptedData
          }, {
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then(response => {
              setFormData({
                customer_fname: '',
                // customer_lname: '',
                customer_type: '',
                customer_classification: '',
                mobileno: '',
                alt_mobileno: '',
                dateofbirth: '',
                anniversary_date: '',
                email: '',
                salutation: '',
                customer_id: '',
              });
              setSuccessMessage('Customer Updated Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerData();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Customer already exists!'); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include duplicate check
          await axiosInstance.post(`${Base_Url}/postcustomer`, {
            encryptedData
          }, {
            headers: {
              Authorization: token, // Send token in headers
            },
          })
            .then(response => {
              setFormData({
                customer_fname: '',
                // customer_lname: '',
                customer_type: '',
                customer_classification: '',
                mobileno: '',
                alt_mobileno: '',
                dateofbirth: '',
                anniversary_date: '',
                email: '',
                salutation: '',
                customer_id: '',
              });
              setSuccessMessage('Customer Submitted Successfully!');
              setTimeout(() => setSuccessMessage(''), 3000);
              fetchCustomerData();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry, Customer already exists!'); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };




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
    pageid: String(15)
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
                <div className="col-12">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-2 mb-3">
                        <label htmlFor="Salutation" className="form-label">Salutation</label>
                        <select
                          type="text"
                          className="form-select"
                          id="salutation"
                          aria-describedby="salutation"
                          name="salutation"
                          value={formData.salutation}
                          onChange={handleChange}
                        >
                          <option value="">Select Salutation</option>
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Miss">Miss</option>
                          <option value="M.">M.</option>
                          <option value="Lhi">Lhi</option>
                          <option value="Dl">Dl</option>
                        </select>
                        {errors.salutation && (
                          <small className="text-danger">{errors.salutation}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Customerfname" className="form-label">Customer  Name<span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerfname"
                          aria-describedby="Customerfname"
                          name="customer_fname"
                          placeholder='Enter Customer Name'
                          value={formData.customer_fname}
                          onChange={handleChange}
                        />
                        {errors.customer_fname && (
                          <small className="text-danger">{errors.customer_fname}</small>
                        )}
                      </div>
                      {/* <div className="col-md-3 mb-3">
                        <label htmlFor="Customerlname" className="form-label">Customer Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerlname"
                          aria-describedby="Customerlname"
                          name="customer_lname"
                          placeholder='Enter Customer Last Name'
                          onChange={handleChange}
                          value={formData.customer_lname}
                        />
                        {errors.customer_lname && (
                          <small className="text-danger">{errors.customer_lname}</small>
                        )}
                      </div> */}
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Customerid" className="form-label">Customer ID</label>
                        <input
                          type="text"
                          className="form-control"
                          id="Customerid"
                          aria-describedby="Customerid"
                          name="customer_id"
                          placeholder='Enter  Customer ID'
                          onChange={handleChange}
                          value={formData.customer_id}
                          disabled
                        />
                        {errors.customer_lname && (
                          <small className="text-danger">{errors.customer_id}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="emailid" className="form-label">Email ID</label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailid"
                          aria-describedby="emailid"
                          name="email"
                          placeholder='Enter Customer Email'
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>

                      <div className="col-md-2 mb-3">
                        <label htmlFor="cclassification" className="form-label">Customer Classification<span className="text-danger">*</span></label>
                        <select id="cclassification" name="customer_classification" className="form-select" aria-label=".form-select-lg example" value={formData.customer_classification} onChange={handleChange} >
                          <option value="selected">Select Customer Classification</option>
                          <option value="IMPORT">IMPORT</option>
                          <option value="CONSUMER">CONSUMER</option>
                        </select>
                        {errors.customer_classification && (
                          <small className="text-danger">{errors.customer_classification}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="custype" className="form-label">Customer Type<span className="text-danger">*</span></label>
                        <select id="custype" className="form-select" aria-label=".form-select-lg example" name="customer_type" value={formData.customer_type} onChange={handleChange} >
                          <option value="selected">Select Customer Type</option>
                          <option value="END CUSTOMER">END CUSTOMER</option>
                          <option value="DISPLAY / EVENTS">DISPLAY / EVENTS</option>
                          <option value="SERVICE PARTNER">SERVICE PARTNER</option>
                          <option value="WAREHOUSE">WAREHOUSE</option>
                          <option value="LHI DISPLAY/WH">LHI DISPLAY/WH</option>
                          <option value="SUB-DEALER">SUB-DEALER</option>
                        </select>
                        {errors.customer_type && (
                          <small className="text-danger">{errors.customer_type}</small>
                        )}
                      </div>

                      <div className="col-md-3 mb-3">
                        <label htmlFor="mobilenumber" className="form-label">Mobile No.<span className="text-danger">*</span> <input type="checkbox" />Whatsapp </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="mobilenumber"
                          aria-describedby="mobilenumber"
                          name="mobileno"
                          placeholder='Enter Mobile Number'
                          value={formData.mobileno}
                          onChange={handleChange}
                          pattern="[0-9]{10}"
                          maxLength="10"
                          minLength="10"
                        />
                        {errors.mobileno && (
                          <small className="text-danger">{errors.mobileno}</small>
                        )}
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="Altnumber" className="form-label">Alternate Mobile No.  <input type="checkbox" />Whatsapp</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="Altnumber"
                          aria-describedby="Altnumber"
                          name="alt_mobileno"
                          placeholder='Enter Alternate Mobile No.'
                          value={formData.alt_mobileno}
                          onChange={handleChange}
                          pattern="[0-9]{10}"
                          maxLength="10"
                          minLength="10"
                        />
                        {errors.alt_mobileno && (
                          <small className="text-danger">{errors.alt_mobileno}</small>
                        )}
                      </div>
                      <div className="col-md-2 mb-3">
                        <label htmlFor="dbirth" className="form-label">Date of Birth</label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="dateofbirth"
                          aria-describedby="dbirth"
                        />
                        {/* <input
                            type="date"
                            className="form-control"
                            id="dbirth"
                            aria-describedby="dbirth"
                            name="dateofbirth"
                            value={formData.dateofbirth}
                            onChange={handleChange}
                          /> */}
                        {errors.dateofbirth && (
                          <small className="text-danger">{errors.dateofbirth}</small>
                        )}
                      </div>
                      <div className="col-md-2 mb-3">
                        <label htmlFor="Anidate" className="form-label">Anniversary Date</label>
                        <DatePicker
                          selected={anniversary_date}
                          onChange={handleDateChange2}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="anniversary_date"
                          aria-describedby="Anidate"
                        />
                        {/* <input
                          type="date"
                          className="form-control"
                          id="Anidate"
                          aria-describedby="Anidate"
                          name="anniversary_date"
                          value={formData.anniversary_date}
                          onChange={handleChange}
                        /> */}
                        {errors.anniversary_date && (
                          <small className="text-danger">{errors.anniversary_date}</small>
                        )}
                      </div>

                      {roleaccess > 2 ? <div className="col-md-12 text-right">
                        <button type="submit" className="btn btn-liebherr">{isEdit ? "Update" : "Submit"}</button>
                      </div> : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>

  );
};

export default Customer;
