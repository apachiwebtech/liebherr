import axios from "axios";
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
import CspAddtab from "./CspAddtab";

const CspRoleright = () => {
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
        description: "",
    });

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getcsprole`, {
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
        if (!formData.title.trim()) {
            // Check if the title is empty
            newErrors.title = "Role Field is required."; // Set error message if title is empty
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
                        .post(`${Base_Url}/putcsprole`, {
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
                                setDuplicateError("Duplicate entry, Role already exists!"); // Show duplicate error for update
                            }
                        });
                } else {
                    // For insert, include 'created_by'
                    await axios
                        .post(`${Base_Url}/postcsprole`, {
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
                                setDuplicateError("Duplicate entry, Role already exists!"); // Show duplicate error for insert
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
            const response = await axiosInstance.post(`${Base_Url}/deletecsprole`, { id }, {
                headers: {
                    Authorization: token,
                },
            });
            window.location.reload();
        } catch (error) {
            console.error("Error deleting role:", error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/requestcsprole/${id}`, {
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
        pageid: String(28)
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
            <CspAddtab />
            <div className="row mp0">
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
                                            <label htmlFor="RolerightInput" className="input-field">
                                                Add Role<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                id="RolerightInput"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="Enter Role"
                                            />
                                            {errors.title && (
                                                <small className="text-danger">{errors.title}</small>
                                            )}
                                            {duplicateError && (
                                                <small className="text-danger">{duplicateError}</small>
                                            )}{" "}
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="DescriptionInput" className="input-field">
                                                Description
                                            </label>
                                            <textarea
                                                type="text"
                                                className="form-control"
                                                name="description"
                                                id="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Enter Description "
                                            />

                                        </div>
                                        <div className="text-right">
                                            <button className="btn btn-liebherr" type="submit">
                                                {isEdit ? "Update" : "Submit"}
                                            </button>
                                        </div>
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
                                    </div>

                                    {/* Adjust table padding and spacing */}
                                    <table className="table table-bordered table-hover table-responsive mt-3">
                                        <thead className="thead-light">
                                            <tr>
                                                <th width="10%" className="text-center">#</th>
                                                <th width="60%" className="text-left">Roles</th>
                                                <th width="10%" className="text-center">Edit</th>
                                                <th width="10%" className="text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="text-center">{index + 1 + indexOfFirstUser}</td>
                                                    <td>{item.title}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-link text-primary"
                                                            onClick={() => {
                                                                edit(item.id);
                                                            }}
                                                            title="Edit"

                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-link text-danger"
                                                            onClick={() => deleted(item.id)}
                                                            title="Delete"

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
            </div>
        </div>
    );
};

export default CspRoleright;
