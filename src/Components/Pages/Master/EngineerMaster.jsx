import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Franchisemaster from '../Master/Franchisemaster';

const EngineerMaster = () => {
  // Step 1: Add this state to track errors
  const [Childfranchise, setChildfranchise] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateError, setDuplicateError] = useState('');


  const [formData, setFormData] = useState({
    title: '',
    cfranchise_id: '',
    password: '',
    email: '',
    mobile_no: '',
  });

  const fetchChildfranchise = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getchildfranchise`);
      console.log(response.data);
      setChildfranchise(response.data);
    } catch (error) {
      console.error('Error fetching Childfranchise:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Base_Url}/getengineer`);
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchChildfranchise();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    setDuplicateError(''); // Clear duplicate error before submitting

    try {
      const confirmSubmission = window.confirm("Do you want to submit the data?");
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include duplicate check
          await axios.put(`${Base_Url}/putengineer`, { ...formData })
            .then(response => {
              console.log(response.data)
              setFormData({
                title: '',
                cfranchise_id: '',
                password: '',
                email: '',
                mobile_no: ''
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
          await axios.post(`${Base_Url}/postengineer`, { ...formData })
            .then(response => {
              setFormData({
                title: '',
                cfranchise_id: '',
                password: '',
                email: '',
                mobile_no: ''
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
      const response = await axios.post(`${Base_Url}/deleteengineer`, { id });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
      setFormData(response.data)
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };


  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="tab-content">
      <Franchisemaster />
      <div className="row mp0" >
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className="row mp0">
                <div className="col-12">
                  <form onSubmit={handleSubmit} className="col-12">
                    {/* Step 2.1: Child Franchise Dropdown */}
                    <div className='row'>
                      <div className="col-md-3">
                        <label htmlFor="Child Franchise" className="form-label pb-0 dropdown-label">Child Franchise</label>
                        <select className='form-select dropdown-select' name='cfranchise_id' value={formData.cfranchise_id} onChange={handleChange} >
                          <option value="">Select Child Franchise</option>
                          {Childfranchise.map((pf) => (
                            <option key={pf.id} value={pf.id}>{pf.title}</option>
                          ))}
                        </select>
                        {errors.cfranchise_id && <small className="text-danger">{errors.cfranchise_id}</small>} {/* Show error for Child Franchise selection */}
                      </div>
                      {/* Step 2.2: Engineer Master Input */}
                      <div className="col-md-3">
                        <label htmlFor="EngineerNameInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}> Engineer Name</label>
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
                        <label htmlFor="passwordInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Password</label>
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
                        <label htmlFor="employeeCodeInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Employee Code</label>
                        <input
                          type="text"  // Changed to "text" for Employee Code
                          className="form-control"
                          name="employeeCode"
                          id="employeeCodeInput"
                          value={formData.employeeCode}  // Updated value to match "employeeCode"
                          onChange={handleChange}
                          placeholder="Enter Employee Code"
                        />
                        {errors.employeeCode && <small className="text-danger">{errors.employeeCode}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      
                      <div className="col-md-3">
                        <label htmlFor="emailInput" className="input-field" style={{ marginBottom: '15style={{ mapx', fontSize: '18px' }}>Engineer Email</label>
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
                        <label htmlFor="pemailInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Personal Email ID</label>
                        <input
                          type="email"  // Changed to "email" for Personal Email ID
                          className="form-control"
                          name="pemail"
                          id="pemailInput"
                          value={formData.pemail}  // Updated value to match "email"
                          onChange={handleChange}
                          placeholder="Enter Personal Email ID"
                        />
                        {errors.email && <small className="text-danger">{errors.pemail}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label
                          htmlFor="mobile_noInput"
                          className="input-field"
                          style={{ marginBottom: '15px', fontSize: '18px' }}
                        >
                          Engineer Mobile No
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="mobile_no"
                          id="mobile_noInput"
                          value={formData.mobile_no}
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
                          maxLength="15"
                        />
                        {formData.mobile_no.length > 0 && formData.mobile_no.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}

                      </div>
                      <div className="col-md-3">
                        <label htmlFor="mobileInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Personal Mobile Number</label>
                        <input
                          type="tel"  // Changed to "tel" for Personal Mobile Number
                          className="form-control"
                          name="mobile"
                          id="mobileInput"
                          value={formData.mobile}  // Updated value to match "mobile"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isNaN(value)) {
                              if (value.length <= 15) {
                                handleChange(e);
                              }
                            }
                          }}
                          placeholder="Enter Personal Mobile Number"
                          pattern="[0-9]{10}"  // Optional: Pattern to enforce 10-digit mobile number (adjust as needed)
                          maxLength="15"
                        />
                        {formData.mobile_no.length > 0 && formData.mobile_no.length < 10 && (
                          <small className="text-danger">Mobile number must be at least 10 digits</small>
                        )}
                        {errors.mobile && <small className="text-danger">{errors.mobile}</small>}

                      </div>

                      <div className="col-md-3">
                        <label htmlFor="dobInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Date of Birth</label>
                        <input
                          type="date"  // Changed to "date" for Date of Birth
                          className="form-control"
                          name="dob"
                          id="dobInput"
                          value={formData.dob}  // Updated value to match "dob"
                          onChange={handleChange}
                          placeholder="Enter Date of Birth"
                        />
                        {errors.dob && <small className="text-danger">{errors.dob}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="bloodGroupInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Blood Group</label>
                        <input
                          type="text"  // Changed to "text" for Blood Group
                          className="form-control"
                          name="bloodGroup"
                          id="bloodGroupInput"
                          value={formData.bloodGroup}  // Updated value to match "bloodGroup"
                          onChange={handleChange}
                          placeholder="Enter Blood Group"
                        />
                        {errors.bloodGroup && <small className="text-danger">{errors.bloodGroup}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="academicQualificationInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Academic Qualification</label>
                        <select
                          className="form-select"
                          name="academicQualification"
                          id="academicQualificationInput"
                          value={formData.academicQualification}  // Updated value to match "academicQualification"
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
                        {errors.academicQualification && <small className="text-danger">{errors.academicQualification}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="joiningDateInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Joining Date</label>
                        <input
                          type="date"  // Changed to "date" for Joining Date
                          className="form-control"
                          name="joiningDate"
                          id="joiningDateInput"
                          value={formData.joiningDate}  // Updated value to match "joiningDate"
                          onChange={handleChange}
                          placeholder="Enter Joining Date"
                        />
                        {errors.joiningDate && <small className="text-danger">{errors.joiningDate}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="passportPictureInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Passport Picture</label>
                        <input
                          type="file"  // Changed to "file" for uploading Passport Picture
                          className="form-control"
                          name="passportPicture"
                          id="passportPictureInput"
                          onChange={handleChange}
                          accept="image/*"  // Accept any image format (can restrict to jpg, png, etc.)
                        />
                        {errors.passportPicture && <small className="text-danger">{errors.passportPicture}</small>}
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
                          name="photoIdProof"
                          id="photoIdProofInput"
                          onChange={handleChange}
                          accept="image/*,application/pdf"  // Accept image files or PDF formats for ID proof (customize as needed)
                        />
                        {errors.photoIdProof && <small className="text-danger">{errors.photoIdProof}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="govAddressProofInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Govt. Address Proof</label>
                        <input
                          type="file"  // Changed to "file" for uploading Govt. Address Proof
                          className="form-control"
                          name="govAddressProof"
                          id="govAddressProofInput"
                          onChange={handleChange}
                          accept="image/*,application/pdf"  // Accepts image files and PDFs (e.g., utility bills, bank statements)
                        />
                        {errors.govAddressProof && <small className="text-danger">{errors.govAddressProof}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="permanentAddressInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Permanent Address</label>
                        <textarea
                          className="form-control"
                          name="permanentAddress"
                          id="permanentAddressInput"
                          value={formData.permanentAddress}  // Updated value to match "permanentAddress"
                          onChange={handleChange}
                          placeholder="Enter Permanent Address"
                          rows="4"  // Adjust the number of rows (height) as needed
                        />
                        {errors.permanentAddress && <small className="text-danger">{errors.permanentAddress}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="currentAddressInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Current Address</label>
                        <textarea
                          className="form-control"
                          name="currentAddress"
                          id="currentAddressInput"
                          value={formData.currentAddress}  // Updated value to match "permanentAddress"
                          onChange={handleChange}
                          placeholder="Enter Current Address"
                          rows="4"  // Adjust the number of rows (height) as needed
                        />
                        {errors.currentAddress && <small className="text-danger">{errors.currentAddress}</small>}
                        {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="btn btn-liebherr" type="submit" style={{ marginTop: '15px' }}>
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></div>
  );
};

export default EngineerMaster;
