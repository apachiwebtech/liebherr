import axios from "axios";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";
import { SyncLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import CryptoJS from 'crypto-js';
const Location = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [countries, setCountries] = useState([]);
  const [currentUsers, setCurrentUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    country_id: "",
  });

  const fetchCountries = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcountries`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setCountries(decryptedData);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getregionsr`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setUsers(decryptedData);
      setFilteredUsers(decryptedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) => user.title && user.title.toLowerCase().includes(value) ||
      user.country_title && user.country_title.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Region Field is required.";
    }
    if (!formData.country_id) {
      newErrors.country_id = "Country selection is required.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(formData),
      secretKey
    ).toString();

    setDuplicateError("");

    try {
      const confirmSubmission = window.confirm(
        "Do you want to submit the data?"
      );
      if (confirmSubmission) {
        if (isEdit) {
          await axios
            .post(`${Base_Url}/putregion`, {
              encryptedData,
            },
              {
                headers: {
                  Authorization: token, // Send token in headers
                },
              })
            .then((response) => {
              setFormData({ title: "", country_id: "" });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Region already exists!");
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postregion`, {
              encryptedData,

            },
              {
                headers: {
                  Authorization: token, // Send token in headers
                },
              })
            .then((response) => {
              setFormData({ title: "", country_id: "" });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError("Duplicate entry, Region already exists!");
              }
            });
        }
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const deleted = async (id) => {

    const confirm = window.confirm("Are you sure you want to delete ?");
    if (confirm) {
      try {
        await axiosInstance.post(`${Base_Url}/deleteregion`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        setFormData({ title: "", country_id: "" });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestregion/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      
      setFormData(response.data);
      setIsEdit(true);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      "Country": user.country_title,
      "Region": user.title,
      // Add fields you want to export
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Regionss");

    // Export the workbook
    XLSX.writeFile(workbook, "Region.xlsx");
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
    pageid: String(2)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  const indexOfLastUser = (currentPage + 1) * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const displayedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (

    <div className="tab-content">
      <LocationTabs />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
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
                    <div className="form-group">
                      <label
                        htmlFor="country"
                        className="form-label pb-0 dropdown-label"
                      >
                        Country<span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select dropdown-select"
                        name="country_id"
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
                        <small className="text-danger">{errors.country_id}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor="regionInput"
                        className="input-field"
                        style={{ marginBottom: "15px", fontSize: "18px" }}
                      >
                        Region<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        id="regionInput"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter Region"
                      />
                      {errors.title && (
                        <small className="text-danger">{errors.title}</small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                    </div>
                    {roleaccess > 2 ? <div className="text-right">
                      <button
                        className="btn btn-liebherr"
                        type="submit"
                        style={{ marginTop: "15px" }}
                      >
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

                  <table className="table table-bordered table-hover dt-responsive nowrap w-100">
                    <thead className="thead-light">
                      <tr>
                        <th width="10%" className="text-center">#</th>
                        <th width="30%" className="text-left">Country</th>
                        <th width="30%" className="text-left">Region</th>
                        {roleaccess > 3 ?<th width="15%" className="text-center">Edit</th> : null}
                        {roleaccess > 4 ?<th width="15%" className="text-center">Delete</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                          <td>{item.country_title}</td>
                          <td>{item.title}</td>
                          {roleaccess > 3 ?<td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
                             
                              title="Edit"
                            >
                              <FaPencilAlt />
                            </button>
                          </td> : null}
                          {roleaccess > 4 ?  <td className="text-center">
                           <button
                              className="btn btn-link text-danger"
                              onClick={() => deleted(item.id)}
                              
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td> : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div
                    className="d-flex justify-content-between"
                    style={{ marginTop: "10px" }}
                  >
                    <div >
                      <span>
                        Showing {indexOfFirstUser + 1} to{" "}
                        {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                        {filteredUsers.length} entries
                      </span>
                    </div>

                    <div className="pagination" style={{ marginLeft: "auto" }}>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={currentPage === 0}
                      >
                        &lt;
                      </button>
                      {Array.from(
                        {
                          length: Math.min(3, Math.ceil(filteredUsers.length / itemsPerPage)), // Limit to 3 buttons
                        },
                        (_, index) => {
                          const pageIndex = Math.max(0, currentPage - 1) + index; // Adjust index for sliding window
                          if (pageIndex >= Math.ceil(filteredUsers.length / itemsPerPage)) return null; // Skip invalid pages

                          return (
                            <button
                              key={pageIndex}
                              onClick={() => setCurrentPage(pageIndex)}
                              className={currentPage === pageIndex ? "active" : ""}
                            >
                              {pageIndex + 1}
                            </button>
                          );
                        }
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(filteredUsers.length / itemsPerPage) - 1
                            )
                          )
                        }
                        disabled={
                          currentPage >=
                          Math.ceil(filteredUsers.length / itemsPerPage) - 1
                        }
                      >
                        &gt;
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

export default Location;
