 import axios from "axios";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import ProMaster from "./ProMaster";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import Lhiusertabs from "./Lhiusertabs";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import EnquiryTabs from "./EnquiryTabs";

const AddEnquiry = () => {
  // Step 1: Add this state to track errors
  const token = localStorage.getItem("token");
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
  const createdBy = 1; // Static value for created_by
  const updatedBy = 2; // Static value for updated_by
  const { loaders, axiosInstance } = useAxiosLoader();
  const [formData, setFormData] = useState({
    title: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getenquiry`, {
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const newErrors = {}; // Initialize an empty error object
    
    // Check if 'name' is a string and trim it safely
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Name field is required.";
    }
  
    // Check if 'mobile_no' exists and is 10 digits long
    if (!formData.mobile_no || formData.mobile_no.length !== 10) {
      newErrors.mobile_no = "Mobile number must be 10 digits.";
    }
  
    // Check if 'email' is provided and has a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
  
    return newErrors; // Return the error object
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
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          // For update, include 'updated_by'
          await axios
            .post(`${Base_Url}/putenquiry`, {
              ...formData,
              updated_by: updatedBy,
            }, {
              headers: {
                Authorization: token,
              },
            })
            .then((response) => {
              window.location.reload();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Enquiry already exists!"); // Show duplicate error for update
              }
            });
        } else {
          // For insert, include 'created_by'
          await axios
            .post(`${Base_Url}/postenquiry`, {
              ...formData,
              created_by: createdBy,

            }, {
              headers: {
                Authorization: token,
              },
            }
            )
            .then((response) => {
              window.location.reload();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Enquiry already exists!"); // Show duplicate error for insert
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
      const response = await axiosInstance.post(`${Base_Url}/deleteenquiry`, { id }, {
        headers: {
          Authorization: token,
        },
      });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestenquiry/${id}`, {
        headers: {
          Authorization: token,
        },
      }
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

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(currentUsers.map(user => ({

      "Name": user.name,
      "MobileNumber": user.mobile_no,
      "Email": user.email,
      "Address": user.address,


    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiry");

    // Export the workbook
    XLSX.writeFile(workbook, "Enquiry.xlsx");
  };

  // export to excel end 

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
    pageid: String(40)
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
      <EnquiryTabs />
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mp0">
                <div className="col-6">
                  <form
                    onSubmit={handleSubmit}
                    style={{ width: "50%" }}
                    className="text-left"
                  >
                    <div className="mb-3">
                      <label htmlFor="nameInput" className="input-field">
                        Add Name<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        id="nameInput"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Name"
                      />
                      {errors.name && (
                        <small className="text-danger">{errors.name}</small>
                      )}
                     
                    </div>
                    <div className="mb-3">
                        <label htmlFor="MobileInput" className="input-field">
                          Mobile Number<span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="mobile_no"
                          id="MobileInput"
                          value={formData.mobile_no}
                          onChange={handleChange}
                          placeholder="Enter Mobile Number"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          minLength="10"
                        />


                        {errors.mobile_no && <small className="text-danger">{errors.mobile_no}</small>}
                        {/* Show duplicate error */}
                        {duplicateError && (
                          <small className="text-danger">{duplicateError}</small>
                        )}{" "}
                      </div>
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
                        
                        {/* Show duplicate error */}
                      </div>
                    <div className="mb-3">
                      <label htmlFor="AddressInput" className="input-field">
                        Address
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address "
                      />

                    </div>
                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit">
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
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
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
                    >
                      Export to Excel
                    </button>
                  </div>

                  {/* Adjust table padding and spacing */}
                  <table className="table table-bordered table-hover table-responsive mt-3">
                    <thead className="thead-light">
                      <tr>
                        <th width="10%" className="text-center">#</th>
                        <th width="60%" className="text-left">Name</th>
                        <th width="10%" className="text-center">Edit</th>
                        <th width="10%" className="text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                          <td>{item.name}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => {
                                edit(item.id);
                              }}
                              title="Edit"
                              disabled={roleaccess > 3 ? false : true}
                            >
                              <FaPencilAlt />
                            </button>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              title="Delete"
                              disabled={roleaccess > 4 ? false : true}
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
      </div> : null}
    </div>
  );
};

export default AddEnquiry;
