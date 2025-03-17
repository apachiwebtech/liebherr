import axios from "axios";
import * as XLSX from "xlsx";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Callstatuscodetabs from "./Callstatuscodetabs";

const SubCallstatus = () => {
    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();
    const [callstatus, setCallStatus] = useState([]);
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
        title: "",
        Callstatus_Id: "",
    });

    const fetchCallStatus = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getcallstatus`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            console.log(response.data);
            setCallStatus(response.data);
        } catch (error) {
            console.error("Error fetching callstatus :", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getsubcallstatus1`, {
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
        fetchCallStatus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = users.filter(
            (user) => user.SubCallstatus && user.SubCallstatus.toLowerCase().includes(value) 
        );
        setFilteredUsers(filtered);
        setCurrentPage(0);
    };

    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {}; // Initialize an empty error object

        // Check if SubCallstatus is a non-empty string
        if (!formData.SubCallstatus || typeof formData.SubCallstatus !== 'string' || !formData.SubCallstatus.trim()) {
            newErrors.SubCallstatus = "Subcallstatus Field is required."; // Set error message if title is empty or not a valid string
        }

        // Check if the Callstatus_Id is empty
        if (!formData.Callstatus_Id) {
            newErrors.Callstatus_Id = "Callstatus selection is required."; // Set error message if no country is selected
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
        const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(formData),
            secretKey
        ).toString();
        setDuplicateError(""); // Clear duplicate error before submitting

        try {
            const confirmSubmission = window.confirm(
                "Do you want to submit the data?"
            );
            if (confirmSubmission) {
                if (isEdit) {
                    // For update, include duplicate check
                    await axios
                        .post(`${Base_Url}/putsubcallstatus`, { encryptedData }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },
                        })
                        .then((response) => {
                            window.location.reload();
                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError(
                                    "Duplicate entry, Subcallstatus already exists!"
                                ); // Show duplicate error for update
                            }
                        });
                } else {
                    // For insert, include duplicate check
                    await axios
                        .post(`${Base_Url}/postsubcallstatus`, { encryptedData }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },
                        })
                        .then((response) => {
                            window.location.reload();
                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError(
                                    "Duplicate entry, subcallstatus already exists!"
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
        const confirm = window.confirm("Are you sure you want to delete ?");

        if (confirm) {
            try {
                const response = await axiosInstance.post(`${Base_Url}/deletesubcall`, { id }, {
                    headers: {
                        Authorization: token, // Send token in headers
                    },
                });

                window.location.reload();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const edit = async (id) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/requestsubcall/${id}`, {
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

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
            "CallStatus": user.Callstatus_title,
            "SubCallStatus": user.SubCallstatus

            // Add fields you want to export
        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sub Call Status");

        // Export the workbook
        XLSX.writeFile(workbook, "SubCallStatus.xlsx");
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
        pageid: String(51)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            <Callstatuscodetabs />
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
                                        {/* Step 2.1: Category Dropdown */}
                                        <div className="form-group">
                                            <label
                                                htmlFor="callstatus"
                                                className="form-label pb-0 dropdown-label"
                                            >
                                                Call Status <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select dropdown-select"
                                                name="Callstatus_Id"
                                                value={formData.Callstatus_Id}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select Call Status </option>
                                                {callstatus.map((Callstatus) => (
                                                    <option key={Callstatus.id} value={Callstatus.id}>
                                                        {Callstatus.Callstatus}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.Callstatus_Id && (
                                                <small className="text-danger">
                                                    {errors.Callstatus_Id}
                                                </small>
                                            )}{" "}
                                            {/* Show error for catgeoryselection */}
                                        </div>
                                        {/* Step 2.2: SubcategoryInput */}
                                        <div className="form-group">
                                            <label
                                                htmlFor="regionInput"
                                                className="input-field"
                                                style={{ marginBottom: "15px", fontSize: "18px" }}
                                            >
                                                Sub Call Status<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="SubCallstatus"
                                                id="subcallInput"
                                                value={formData.SubCallstatus}
                                                onChange={handleChange}
                                                placeholder="Enter Subcallstatus"
                                            />
                                            {errors.SubCallstatus && (
                                                <small className="text-danger">{errors.SubCallstatus}</small>
                                            )}
                                            {duplicateError && (
                                                <small className="text-danger">{duplicateError}</small>
                                            )}{" "}
                                            {/* Show duplicate error */}
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

                                    {/* Adjust table padding and spacing */}
                                    <table className="table table-bordered table-hover mt-4">
                                        <thead className="table-light">
                                            <tr>
                                                <th width="10%" className="text-center">#</th>
                                                <th width="30%" className="text-left">Call Status</th>
                                                <th width="30%" className="text-left">Sub Call Status</th>
                                                {roleaccess > 3 ? <th width="15%" className="text-center">Edit</th> : null}
                                                 {roleaccess > 4 ?<th width="15%" className="text-center">Delete</th> : null}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                                                    <td>{item.Callstatus_title}</td>
                                                    <td>{item.SubCallstatus}</td>
                                                    {roleaccess > 3 ?<td className="text-center">
                                                        <button
                                                            className="btn btn-link text-primary"
                                                            onClick={() => {
                                                                edit(item.id);
                                                            }}
                                                            title="Edit"
                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                    </td> : null}
                                                     {roleaccess > 4 ?<td className="text-center">
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

export default SubCallstatus;
