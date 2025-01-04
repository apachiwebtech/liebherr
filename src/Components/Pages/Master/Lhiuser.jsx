import CryptoJS from 'crypto-js';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash, FaEye } from "react-icons/fa";
import { Base_Url } from "../../Utils/Base_Url";
import { Navigate } from "react-router-dom";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import Lhiusertabs from './Lhiusertabs';

const Lhiuser = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by

  const [formData, setFormData] = useState({
    Lhiuser: "",
    Usercode: "",
    passwordmd5: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getlhidata`,{
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      console.log(response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // If the field is Password, hash the value
    if (name === 'Password') {
      // Hash the password before setting the state
      const hashedPassword = CryptoJS.MD5(value).toString();
      setFormData({
        ...formData,
        [name]: value,  // Update the password field itself
        passwordmd5: hashedPassword,  // Update the hashed password
      });
    } else {
      // Update other fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) => user.Lhiuser && user.Lhiuser.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  // Step 2: Add form validation function
  const validateForm = () => {
    const newErrors = {};  // Initialize the errors object

    if (!formData.Lhiuser || !formData.Lhiuser.trim()) {
      newErrors.Lhiuser = "Lhiuser Field is required.";
    }
    if (!formData.Usercode || !formData.Usercode.trim()) {
      newErrors.Usercode = "Usercode Field is required.";
    }
    if (!formData.Password || !formData.passwordmd5.trim()) {
      newErrors.Password = "Password Field is required.";
    }
    if (!formData.mobile_no || !formData.mobile_no.trim()) {
      newErrors.mobile_no = "Mobile Number Field is required.";
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email Field is required.";
    }




    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      return true;  // If no errors, form is valid
    } else {
      return false;  // If there are errors, form is invalid
    }
  };


  //handlesubmit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {


      setDuplicateError(""); // Clear duplicate error before submitting

      try {
        const confirmSubmission = window.confirm(
          "Do you want to submit the data?"
        );
        if (confirmSubmission) {
          if (isEdit) {
            // For update, include 'updated_by'
            await axios
              .post(`${Base_Url}/putlhidata`, {
                ...formData,
                updated_by: updatedBy,
              },
              {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
              .then((response) => {
                setFormData({
                  Lhiuser: "",
                });
                fetchUsers();
              })
              .catch((error) => {
                if (error.response && error.response.status === 409) {
                  setDuplicateError("Duplicate entry, Lhiuser already exists!"); // Show duplicate error for update
                }
              });
          } else {
            // For insert, include 'created_by'
            await axios
              .post(`${Base_Url}/postlhidata`, {
                ...formData,
                created_by: createdBy,
              },
              {
                headers: {
                  Authorization: token, // Send token in headers
                },
              })
              .then((response) => {
                setFormData({
                  Lhiuser: "",
                  Usercode: "",
                  Password: "",
                  mobile_no: "",
                  email: "",
                  status: "",
                  remarks: "",
                });
                fetchUsers();

              })
              .catch((error) => {
                if (error.response && error.response.status === 409) {
                  setDuplicateError("Duplicate entry, Lhiuser already exists!"); // Show duplicate error for insert
                }
              });
          }
        }
      } catch (error) {
        console.error("Error during form submission:", error);
      }
    }
  };

  const deleted = async (id) => {
    try {
      const response = await axiosInstance.post(`${Base_Url}/deletelhidata`, { id },{
        headers: {
           Authorization: token, // Send token in headers
         },
       });

      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestlhidata/${id}`,{
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

  const handleChangestatus = (e) => {
    try {
      const dataId = e.target.getAttribute('data-id');

      const response = axiosInstance.post(`${Base_Url}/updatestatus`, { dataId: dataId },{
        headers: {
           Authorization: token, // Send token in headers
         },
       });

    } catch (error) {
      console.error("Error editing user:", error);
    }

  };

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="tab-content">
    <div className="row mp0">
          {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <Lhiusertabs />
      <div className="col-12">
        <div className="card mb-3 tab_box">
          <div
            className="card-body"
            style={{ flex: "1 1 auto", padding: "13px 28px" }}
          >
            <div className="row mp0">
              <form
                onSubmit={handleSubmit}

                className="text-left col-md-5"
              >
                <div className="row ">
 {/*  */}
                  <div className="col-4">


                    <div className="mb-3">
                      <label htmlFor="LhiuserInput" className="input-field">
                        FullName<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="Lhiuser"
                        id="LhiuserInput"
                        value={formData.Lhiuser}
                        onChange={handleChange}
                        placeholder="Enter FullName "
                      />
                      {errors.Lhiuser && (
                        <small className="text-danger">{errors.Lhiuser}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>

                  </div>
                  <div className="col-4">
                    <div className="mb-3">
                      <label htmlFor="UsercodeInput" className="input-field">
                        User Code<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="Usercode"
                        id="UsercodeInput"
                        value={formData.Usercode}
                        onChange={handleChange}
                        placeholder="Enter User Code"
                      />
                      {errors.Usercode && (
                        <small className="text-danger">{errors.Usercode}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                  </div>

                  <div className="col-4">
                    <div className="mb-3">
                      <label htmlFor="PassInput" className="input-field">
                        Password<span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="Password"
                        id="PassInput"
                        value={formData.Password}
                        onChange={handleChange}
                        placeholder="Enter Password "
                      />
                      {errors.Password && (
                        <small className="text-danger">{errors.Password}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                  </div>
                </div>

                <div className="row ">
                  <div className="col-4">
                    <div className="mb-3">
                      <label htmlFor="MobileInput" className="input-field">
                        Mobile Number<span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="mobile_no"
                        id="MobileInput"
                        value={formData.mobile_no}
                        onChange={handleChange}
                        placeholder="Enter Mobile Number"
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />


                      {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                      {/* Show duplicate error */}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="mb-3">
                      <label htmlFor="EmailInput" className="input-field">
                        Email Address<span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        id="EmailInput"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter Email Address"
                      />
                      {errors.email && (
                        <small className="text-danger">{errors.email}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}{" "}
                      {/* Show duplicate error */}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="mb-3">
                      <label htmlFor="StatusInput" className="input-field">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="StatusInput"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value=''>Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row ">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="RemarksInput" className="input-field">
                        Remarks
                      </label>
                      <textarea
                        className="form-control"
                        id="RemarksInput"
                        name="remarks"
                        rows="2"
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Enter remarks here"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button className="btn btn-liebherr" type="submit">
                    {isEdit ? "Update" : "Submit"}
                  </button>
                </div>
              </form>






              <div className="col-md-7">
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
                <table
                  className="table table-bordered table dt-responsive nowrap w-100 table-css"
                  style={{ marginTop: "20px", tableLayout: "fixed" }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        #
                      </th>
                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        Usercode
                      </th>

                      <th style={{ padding: "12px 15px", textAlign: "center" }}>
                        Full Name
                      </th>

                      <th style={{ padding: "12px 0px", textAlign: "center" }}>
                        Status
                      </th>
                      <th style={{ padding: "12px 0px", textAlign: "center" }}>
                        Activation date
                      </th>


                      <th style={{ padding: "12px 0px", textAlign: "center" }}>
                        Edit
                      </th>

                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: "2px", textAlign: "center" }}>
                          {index + 1 + indexOfFirstUser}
                        </td>

                        <td style={{ padding: "10px" }}>{item.Usercode}</td>

                        <td style={{ padding: "10px" }}>{item.Lhiuser}</td>

                        <td style={{ padding: "10px" }}>
                          <label class="switch">
                            <input
                              type="checkbox"
                              onChange={handleChangestatus}
                              data-id={item.id}
                              checked={item.status === 1}  // Check if status is 1 (checked)
                              className="status"
                            />


                            <span class="slider round"></span>
                          </label>

                        </td>
                        <td style={{ padding: "10px" }}>{item.Lhiuser}</td>


                        <td style={{ padding: "0px", textAlign: "center" }}>
                          <button
                            className="btn"
                            onClick={() => {
                              // alert(item.id)
                              edit(item.id);
                            }}
                            Lhiuser="Edit"
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "blue",
                              fontSize: "20px",
                            }}
                          >
                            <FaPencilAlt />
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
    </div>
    </div>
  );
};

export default Lhiuser;
