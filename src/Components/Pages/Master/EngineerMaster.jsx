import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import Franchisemaster from '../Master/Franchisemaster';
import md5 from "js-md5";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const EngineerMaster = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const { engineerid } = useParams();
  const [Childfranchise, setChildfranchise] = useState([]);
  const [Parentfranchise, setParentfranchise] = useState([]);
  const token = localStorage.getItem("token");
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [joining_date, setJoiningDate] = useState('');
  const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
  const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

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
      setJoiningDate(formattedDate)
    }

  };

  const [formData, setFormData] = useState({
    title: '',
    cfranchise_id: '',
    mfranchise_id: '',
    password: '',
    email: '',
    mobile_no: '',
    employee_code: '',
    personal_email: '',
    personal_mobile: '',
    dob: '',
    blood_group: '',
    academic_qualification: '',
    joining_date: '',
    passport_picture: '',
    resume: '',
    photo_proof: '',
    address_proof: '',
    permanent_address: '',
    current_address: ''
  });

  const fetchEngineerpopulate = async (engineerid) => {

    try {
      const response = await axiosInstance.get(`${Base_Url}/getengineerpopulate/${engineerid}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      setSelectedDate(response.data[0].dob)
      setJoiningDate(response.data[0].joining_date)
      setFormData({
        ...response.data[0],
        // Rename keys to match your formData structure
        title: response.data[0].title,
        mfranchise_id: response.data[0].mfranchise_id,
        cfranchise_id: response.data[0].cfranchise_id,
        mobile_no: response.data[0].mobile_no,
        password: response.data[0].password,
        email: response.data[0].email,
        employee_code: response.data[0].employee_code,
        personal_email: response.data[0].personal_email,
        personal_mobile: response.data[0].personal_mobile,
        dob: response.data[0].dob,
        blood_group: response.data[0].blood_group,
        academic_qualification: response.data[0].academic_qualification,
        joining_date: response.data[0].joining_date,
        passport_picture: response.data[0].passport_picture,
        resume: response.data[0].resume,
        photo_proof: response.data[0].photo_proof,
        address_proof: response.data[0].address_proof,
        permanent_address: response.data[0].permanent_address,
        current_address: response.data[0].current_address
      });


      setIsEdit(true);

      if (response.data[0].mfranchise_id) {
        fetchParentfranchise(response.data[0].mfranchise_id);
      }
      if (response.data[0].cfranchise_id) {
        fetchChildfranchise(response.data[0].cfranchise_id);
      }



    } catch (error) {
      console.error('Error fetching Enginnerdata:', error);
      setFormData([]);
    }
  };


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

  const fetchChildfranchise = async (mfranchise_id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getchildfranchise/${mfranchise_id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setChildfranchise(response.data);
    } catch (error) {
      console.error('Error fetching Childfranchise:', error);
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getengineer`, {
        headers: {
          Authorization: token,
        },
      }
      );
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setUsers(decryptedData);
      setFilteredUsers(decryptedData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchParentfranchise();

    if (engineerid != 0) {
      fetchEngineerpopulate(engineerid);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    switch (name) {
      case "mfranchise_id":
        fetchChildfranchise(value);
        break;
      default:
        break;
    }
  };
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      user.title && user.title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };


  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Engineer Name Field is required.";
    }

    // Check if the cfranchise_id is empty
    if (!formData.cfranchise_id) {
      newErrors.cfranchise_id = "Child Franchise selection is required.";
    }
    if (!formData.mfranchise_id) {
      newErrors.mfranchise_id = "Main Franchise selection is required.";
    }
    if (!formData.email) {
      newErrors.email = "Engineer Email Field is required.";
    }
    if (!formData.mobile_no) {
      newErrors.mobile_no = "Engineer Mobile No Field is required.";
    }
    if (!formData.password) {
      newErrors.password = "Engineer Password Field is required.";
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
    const payload = {
      ...formData,
      joining_date: joining_date,
      dob: selectedDate,
      password: md5(formData.password),
      created_by,
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
          await axiosInstance.post(`${Base_Url}/putengineer`, { encryptedData }
            , {
              headers: {
                Authorization: token,
              },
            })
            .then(response => {
              console.log(response.data)
              setFormData({
                title: '',
                mfranchise_id: '',
                cfranchise_id: '',
                password: '',
                email: '',
                mobile_no: '',
                employee_code: '',
                personal_email: '',
                personal_mobile: '',
                dob: '',
                blood_group: '',
                academic_qualification: '',
                joining_date: '',
                passport_picture: '',
                resume: '',
                photo_proof: '',
                address_proof: '',
                permanent_address: '',
                current_address: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include duplicate check
          await axiosInstance.post(`${Base_Url}/postengineer`, { encryptedData }
            , {
              headers: {
                Authorization: token,
              },
            }
          )
            .then(response => {
              setFormData({
                title: '',
                mfranchise_id: '',
                cfranchise_id: '',
                password: '',
                email: '',
                mobile_no: '',
                employee_code: '',
                personal_email: '',
                personal_mobile: '',
                dob: '',
                blood_group: '',
                academic_qualification: '',
                joining_date: '',
                passport_picture: '',
                resume: '',
                photo_proof: '',
                address_proof: '',
                permanent_address: '',
                current_address: ''
              })
              fetchUsers();
            })
            .catch(error => {
              if (error.response && error.response.status === 409) {
                setDuplicateError('Duplicate entry,Email and Mobile No Credential already exists!'); // Show duplicate error for insert
              }
            });
        }
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };


  const deleted = async (id) => {
    try {
      const response = await axiosInstance.post(`${Base_Url}/deleteengineer`, { id }
        , {
          headers: {
            Authorization: token,
          },
        }
      );

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestengineer/${id}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setFormData(response.data)
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };


  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
    pageid: String(23)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End

  return (
    <div className="tab-content">
      <Franchisemaster />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0" >
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className="row mp0">
                <div className="col-12">
                  <form onSubmit={handleSubmit} className="col-12">
                    <div className='row'>
                      <div className="col-md-3">
                        <label htmlFor="Master  Franchise" className="form-label pb-0 dropdown-label">Master Service Partner<span className="text-danger">*</span></label>
                        <select className='form-select dropdown-select' name='mfranchise_id' value={formData.mfranchise_id} onChange={handleChange} >
                          <option value="">Select Master Service Partner</option>
                          {Parentfranchise.map((pf) => (
                            <option key={pf.id} value={pf.licarecode}>{pf.title}</option>
                          ))}
                        </select>
                        {errors.mfranchise_id && <small className="text-danger">{errors.mfranchise_id}</small>} {/* Show error for Child Franchise selection */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">Child Service Partner<span className="text-danger">*</span></label>
                        <select className='form-select dropdown-select' name='cfranchise_id' value={formData.cfranchise_id} onChange={handleChange} >
                          <option value="">Select Child Service Partner</option>
                          {Childfranchise.map((pf) => (
                            <option key={pf.id} value={pf.licare_code}>{pf.title}</option>
                          ))}
                        </select>
                        {errors.cfranchise_id && <small className="text-danger">{errors.cfranchise_id}</small>} {/* Show error for Child Franchise selection */}
                      </div>
                      {/* Step 2.2: Engineer Master Input */}
                      <div className="col-md-3">
                        <label htmlFor="EngineerNameInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}> Engineer Name<span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          id="EngineerNameInput"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter Engineer Name"
                        />
                        {errors.title && <small className="text-danger">{errors.title}</small>}

                      </div>

                      <div className="col-md-3">
                        <label htmlFor="passwordInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Password<span className="text-danger">*</span></label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          id="passwordInput"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter Engineer Password"
                        />
                        {errors.password && <small className="text-danger">{errors.password}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="employeeCodeInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Employee Code<span className="text-danger">*</span></label>
                        <input
                          type="text"  // Changed to "text" for Employee Code
                          className="form-control"
                          name="employee_code"
                          id="employeeCodeInput"
                          value={formData.employee_code}  // Updated value to match "employeeCode"
                          onChange={handleChange}
                          placeholder="Enter Employee Code"
                        />
                        {errors.employee_code && <small className="text-danger">{errors.employee_code}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="emailInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Email<span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          id="emailInput"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter Engineer Email"
                        />
                        {errors.email && <small className="text-danger">{errors.email}</small>}

                      </div>
                      <div className="col-md-3">
                        <label htmlFor="pemailInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>PAN CARD/AADHAAR CARD</label>
                        <input
                          type="text"  // Changed to "email" for Personal Email ID
                          className="form-control"
                          name="personal_email"
                          id="pemailInput"
                          value={formData.personal_email}  // Updated value to match "email"
                          onChange={handleChange}
                          placeholder="Enter PAN OR AADHAAR Number"
                        />
                        {errors.personal_email && <small className="text-danger">{errors.personal_email}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label
                          htmlFor="mobile_noInput"
                          className="input-field"
                          style={{ marginBottom: '15px', fontSize: '18px' }}
                        >
                          Engineer Mobile No<span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="mobile_no"
                          id="mobile_noInput"
                          value={formData.mobile_no || ''}  // Add default empty string
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isNaN(value)) {
                              if (value.length <= 15) {
                                handleChange(e);
                              }
                            }
                          }}
                          placeholder="Enter Engineer Mobile No"
                          pattern="[0-9]*"
                          maxLength="10"
                        />
                        {formData.mobile_no && formData.mobile_no.length > 0 && formData.mobile_no.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="mobileInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>
                          Personal Mobile Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="personal_mobile"
                          id="mobileInput"
                          value={formData.personal_mobile || ''} // Add default empty string
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isNaN(value)) {
                              if (value.length <= 15) {
                                handleChange(e);
                              }
                            }
                          }}
                          placeholder="Enter Personal Mobile Number"
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                        {formData.personal_mobile && formData.personal_mobile.length > 0 && formData.personal_mobile.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.personal_mobile && <small className="text-danger">{errors.personal_mobile}</small>}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="dobInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Date of Birth</label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDateChange}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="dob"
                          aria-describedby="dbirth"
                        />
                        {/* <input
                          type="date"  // Changed to "date" for Date of Birth
                          className="form-control"
                          name="dob"
                          id="dobInput"
                          value={formData.dob}  // Updated value to match "dob"
                          onChange={handleChange}
                          placeholder="Enter Date of Birth"
                        /> */}
                        {errors.dob && <small className="text-danger">{errors.dob}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="bloodGroupInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Blood Group</label>
                        <input
                          type="text"  // Changed to "text" for Blood Group
                          className="form-control"
                          name="blood_group"
                          id="bloodGroupInput"
                          value={formData.blood_group}  // Updated value to match "bloodGroup"
                          onChange={handleChange}
                          placeholder="Enter Blood Group"
                        />
                        {errors.blood_group && <small className="text-danger">{errors.blood_group}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="academicQualificationInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Academic Qualification</label>
                        <select
                          className="form-select"
                          name="academic_qualification"
                          id="academicQualificationInput"
                          value={formData.academic_qualification}  // Updated value to match "academicQualification"
                          onChange={handleChange}
                        >
                          <option value="">Select Academic Qualification</option>  // Placeholder option
                          <option value="Ssc">SSC</option>
                          <option value="Hsc">HSC</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Iti">ITI</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Other">Other</option>

                          {/* Add more options as necessary */}
                        </select>
                        {errors.academic_qualification && <small className="text-danger">{errors.academic_qualification}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="joiningDateInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Joining Date</label>
                        <DatePicker
                          selected={joining_date}
                          onChange={handleDateChange2}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="DD-MM-YYYY"
                          className='form-control'
                          name="joining_date"
                          aria-describedby="joiningDateInput"
                        />
                        {/* <input
                          type="date"  // Changed to "date" for Joining Date
                          className="form-control"
                          name="joining_date"
                          id="joiningDateInput"
                          value={formData.joining_date}  // Updated value to match "joiningDate"
                          onChange={handleChange}
                          placeholder="Enter Joining Date"
                        /> */}
                        {errors.joining_date && <small className="text-danger">{errors.joining_date}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="passportPictureInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Passport Picture</label>
                        <input
                          type="file"  // Changed to "file" for uploading Passport Picture
                          className="form-control"
                          name="passport_picture"
                          id="passportPictureInput"
                          onChange={handleChange}
                          accept="image/*"  // Accept any image format (can restrict to jpg, png, etc.)
                        />
                        {errors.passport_picture && <small className="text-danger">{errors.passport_picture}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="resumeInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Resume</label>
                        <input
                          type="file"  // Changed to "file" for uploading a Resume
                          className="form-control"
                          name="resume"
                          id="resumeInput"
                          onChange={handleChange}
                          accept=".pdf,.doc,.docx"  // Accept PDF, DOC, and DOCX formats for resumes (you can adjust as needed)
                        />
                        {errors.resume && <small className="text-danger">{errors.resume}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="photoIdProofInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Photo ID Proof</label>
                        <input
                          type="file"  // Changed to "file" for uploading Photo ID Proof
                          className="form-control"
                          name="photo_proof"
                          id="photoIdProofInput"
                          onChange={handleChange}
                          accept="image/*,application/pdf"  // Accept image files or PDF formats for ID proof (customize as needed)
                        />
                        {errors.photo_proof && <small className="text-danger">{errors.photo_proof}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="govAddressProofInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Govt. Address Proof</label>
                        <input
                          type="file"  // Changed to "file" for uploading Govt. Address Proof
                          className="form-control"
                          name="address_proof"
                          id="govAddressProofInput"
                          onChange={handleChange}
                          accept="image/*,application/pdf"  // Accepts image files and PDFs (e.g., utility bills, bank statements)
                        />
                        {errors.address_proof && <small className="text-danger">{errors.address_proof}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="permanentAddressInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Permanent Address</label>
                        <textarea
                          className="form-control"
                          name="permanent_address"
                          id="permanentAddressInput"
                          value={formData.permanent_address}  // Updated value to match "permanentAddress"
                          onChange={handleChange}
                          placeholder="Enter Permanent Address"
                          rows="2"  // Adjust the number of rows (height) as needed
                        />
                        {errors.permanent_address && <small className="text-danger">{errors.permanent_address}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-5">
                        <label htmlFor="currentAddressInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Current Address</label>
                        <textarea
                          className="form-control"
                          name="current_address"
                          id="currentAddressInput"
                          value={formData.current_address}  // Updated value to match "permanentAddress"
                          onChange={handleChange}
                          placeholder="Enter Current Address"
                          rows="2"  // Adjust the number of rows (height) as needed
                        />
                        {errors.current_address && <small className="text-danger">{errors.current_address}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                    </div>
                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit" style={{ marginTop: '15px' }}>
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
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

export default EngineerMaster;
