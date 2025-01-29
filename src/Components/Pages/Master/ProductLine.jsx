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
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

const ProductLine = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const token = localStorage.getItem("token"); // Get token from localStorage

  const [formData, setFormData] = useState({
    pline_code: "",
    product_line: "",
    created_by: "1",
    updated_by: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getproductline`, {
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
      (user) => user.pline_code && user.pline_code.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
    setCurrentPage(0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.pline_code.trim()) {
      newErrors.pline_code = "Product Line Code field is required.";
    }
    if (!formData.product_line.trim()) {
      newErrors.product_line = "Product Line field is required.";
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
            .post(`${Base_Url}/putproductlinedata`, {
              encryptedData,
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              setFormData({
                pline_code: "",
                product_line: "",
              });
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Product Line Code already exists!"
                );
              }
            });
        } else {
          await axios
            .post(`${Base_Url}/postdataproductline`, {
              encryptedData,
            }, {
              headers: {
                Authorization: token, // Send token in headers
              },
            })
            .then((response) => {
              setFormData({
                pline_code: "",
                product_line: "",
                created_by: "1",
              });
              
              fetchUsers();
            })
            .catch((error) => {
              if (error.response && error.response.status === 409) {
                setDuplicateError(
                  "Duplicate entry, Product Line Code already exists!"
                );
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
        const response = await axiosInstance.post(`${Base_Url}/deleteproductlinedata`, {
          id,
        }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        setFormData({
          pline_code: "",
          product_line: "",
        });
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(
        `${Base_Url}/requestdataproductline/${id}`
        , {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
      setFormData(response.data);
      setFormData((prev) => ({
        ...prev,
        updated_by:"2",
      }));
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
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      "PLine Code": user.pline_code,
      "Product Line": user.product_line,

      // Add fields you want to export
    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductLine");

    // Export the workbook
    XLSX.writeFile(workbook, "ProductLine.xlsx");
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
    pageid: String(10)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      <ProMaster />
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
                <div className="col-4">
                  <form
                    onSubmit={handleSubmit}
                    style={{ width: "50%" }}
                    className="text-left"
                  >
                    <div className="mb-3">
                      <label htmlFor="PlineCodeInput" className="input-field">
                        Product Line Code<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="pline_code"
                        id="PlineCodeInput"
                        value={formData.pline_code}
                        onChange={handleChange}
                        placeholder="Enter Product Line Code"
                        maxLength={6}
                      />
                      {errors.pline_code && (
                        <small className="text-danger">{errors.pline_code}</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="ProductLineInput" className="input-field">
                        Product Line<span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="product_line"
                        id="ProductLineInput"
                        value={formData.product_line}
                        onChange={handleChange}
                        placeholder="Enter Product Line"
                      />
                      {errors.product_line && (
                        <small className="text-danger">
                          {errors.product_line}
                        </small>
                      )}
                      {duplicateError && (
                        <small className="text-danger">{duplicateError}</small>
                      )}
                    </div>

                    {roleaccess > 2 ? <div className="text-right">
                      <button className="btn btn-liebherr" type="submit">
                        {isEdit ? "Update" : "Submit"}
                      </button>
                    </div> : null}
                  </form>
                </div>

                <div className="col-md-8">
                  {/* Table and search functionality */}
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

                  <table className="table table-bordered table-hover table-responsive mt-3">
                    <thead className="thead-light">
                      <tr>
                        <th width="10%" className="text-center">#</th>
                        <th width="20%" className="text-left">Pline Code</th>
                        <th width="40%" className="text-left">Product Line</th>
                        <th width="15%" className="text-center">Edit</th>
                        <th width="15%" className="text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                          <td>{item.pline_code}</td>
                          <td>{item.product_line}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-link text-primary"
                              onClick={() => edit(item.id)}
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
                  <div className="d-flex justify-content-between align-items-center mb-3">
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

export default ProductLine;
