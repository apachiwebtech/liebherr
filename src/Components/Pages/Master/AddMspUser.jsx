import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import LocationTabs from "./LocationTabs";
import { useSelector } from 'react-redux';
import $ from 'jquery';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import CspAddtab from "./CspAddtab";


const AddMspUser = () => {


    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
    const token = localStorage.getItem("token"); // Get token from localStorage

    const [formData, setFormData] = useState({
        title: "",
    });

    const fetchUsers = async () => {

        const data = {
            licare_code : localStorage.getItem("licare_code")
        }
        try {
            const response = await axiosInstance.post(`${Base_Url}/getmspusers`, data, {
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
            newErrors.title = "Country Field is required."; // Set error message if title is empty
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
                    // For update, include duplicate check
                    await axios
                        .post(`${Base_Url}/putdata`, { ...formData }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },
                        })
                        .then((response) => {
                            setFormData({
                                title: "",
                            });
                            fetchUsers();
                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError("Duplicate entry, Country already exists!"); // Show duplicate error for update
                            }
                        });
                } else {
                    // For insert, include duplicate check
                    await axios
                        .post(`${Base_Url}/postdata`, { ...formData }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },
                        })
                        .then((response) => {
                            setFormData({
                                title: "",
                            });
                            fetchUsers();
                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError("Duplicate entry, Country already exists!"); // Show duplicate error for insert
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
            const response = await axiosInstance.post(`${Base_Url}/deletedata`, { id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setFormData({
                title: "",
            });
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/requestdata/${id}`, {
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

    useEffect(() => {
        if (currentUsers.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                lengthChange: false,
                autoWidth: false,
                responsive: true,
                fixedHeader: true,
                fixedColumns: {
                    left: 5,
                },
                keys: true,
                select: true,
                dom: '<"d-flex justify-content-between"<"table-title"><"search-box"f>>t<"d-flex justify-content-between"ip>',
                language: {
                    search: '', // Remove the "Search:" label
                    searchPlaceholder: 'Search...', // Add placeholder text
                },

            });

            // Cleanup: Destroy DataTable instance before reinitializing when Productdata changes
            return () => {
                table.destroy();
            };
        }
    }, [currentUsers]);
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
        pageid: String(1)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    return (
        <div className="tab-content">
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
                                            <label htmlFor="countryInput" className="input-field">
                                                Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                id="countryInput"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="Enter country"
                                            />
                                         
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="EmailInput" className="input-field">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="title"
                                                id="emailInput"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter Email"
                                            />
                                         
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="EmailInput" className="input-field">
                                                Password <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="email"
                                                id="email"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter Password"
                                            />
                                         
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="EmailInput" className="input-field">
                                                Mobile Number <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="email"
                                                id="email"
                                                value={formData.mobile_no}
                                                onChange={handleChange}
                                                placeholder="Enter Mobile Number"
                                                pattern="[0-9]{10}"
                                                maxLength="15"
                                            />
                                         
                                            {/* Show duplicate error */}
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
                                    </div>

                                    {/* Adjust table padding and spacing */}
                                    <table className="table table-bordered table-hover dt-responsive nowrap w-100">
                                        <thead className="thead-light">
                                            <tr>
                                                <th scope="col" width="10%" className="text-center">
                                                    #
                                                </th>
                                                <th scope="col" width="60%" className="text-left">
                                                    Title
                                                </th>
                                                <th scope="col" width="15%" className="text-center">
                                                    Edit
                                                </th>
                                                <th scope="col" width="15%" className="text-center">
                                                    Delete
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="text-center align-middle">
                                                        {index + 1 + indexOfFirstUser}
                                                    </td>
                                                    <td className="align-middle">{item.title}</td>
                                                    <td className="text-center align-middle">
                                                        <button
                                                            className="btn btn-link text-primary"
                                                            onClick={() => {
                                                                edit(item.id);
                                                            }}
                                                            disabled={roleaccess > 3 ? false : true}
                                                            title="Edit"
                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                    </td>
                                                    <td className="text-center align-middle">
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
            </div>
        </div>
    );
};

export default AddMspUser;
