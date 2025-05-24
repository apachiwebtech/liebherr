import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { Navigate, useParams } from "react-router-dom";
import Servicecontracttabs from "./Servicecontracttabs";
import { Autocomplete, TextField } from "@mui/material";
import { SyncLoader } from 'react-spinners';
import _debounce from "lodash.debounce";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
import Productsparetabs from "./Productsparetabs";
import * as XLSX from "xlsx";
import Grntab from "../Grn/Grntab";
const AddMsl = () => {
    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();

    let { mslid } = useParams();
    const [text, setText] = useState("");
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [excelData, setExcelData] = useState([]);
    const [mspdata, setMspData] = useState([]);
    const [selectmsp, setSelectedMsp] = useState(null);
    const [cspdata, setCspData] = useState([]);
    const [selectcsp, setSelectedCsp] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [duplicateError, setDuplicateError] = useState(""); // State to track duplicate error
    const token = localStorage.getItem("token"); // Get token from localStorage
    const [successMessage, setSuccessMessage] = useState('');

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
        const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
        return `${year}-${month}-${day}`;
    };





    try {
        mslid = mslid.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(mslid, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        mslid = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }

    const [formData, setFormData] = useState({
        msp_code: "",
        msp_name: "",
        csp_code: "",
        csp_name: "",
        item: "",
        item_description: "",
        stock: ""

    });

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getmsl`, {
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
    const fetchmslpopulate = async (mslid) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getmslpopulate/${mslid}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            setFormData({
                ...response.data[0],
                msp_code: response.data[0].msp_code,
                msp_name: response.data[0].msp_name,
                csp_code: response.data[0].csp_code,
                csp_name: response.data[0].csp_name,
                item: response.data[0].item,
                item_description: response.data[0].item_description,
                stock: response.data[0].stock,
            });

            // ✅ Fixed this part: use response data, not mslid
            const selectedCsp = cspdata.find(csp => csp.licare_code == response.data[0].csp_code);

            const selectedMsp = mspdata.find(msp => msp.licarecode === response.data[0].msp_code);
            setSelectedMsp(selectedMsp || null);
            setSelectedCsp(response.data[0].csp_code);

            setIsEdit(true);
        } catch (error) {
            console.error('Error fetching Servicecontractdata:', error);
            setFormData([]);
        }
    };


    useEffect(() => {
        fetchUsers();


        if (mslid != 0) {
            fetchmslpopulate(mslid);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {}; // Initialize an empty error object

        const isEmpty = (value) => {
            return value === undefined || value === null || String(value).trim() === '';
        };

        // Text/Email/Number inputs validation
        if (isEmpty(formData.msp_code)) newErrors.msp_code = "Msp code Field is required.";
        if (isEmpty(formData.csp_code)) newErrors.csp_code = "Csp code is required.";
        if (isEmpty(formData.msp_name)) newErrors.msp_name = "Msp name is required.";
        if (isEmpty(formData.csp_name)) newErrors.csp_name = "Csp Name is required.";
        if (isEmpty(formData.item)) newErrors.item = "item Field is required.";
        if (isEmpty(formData.item_description)) newErrors.item_description = "Item Description is required.";
        if (isEmpty(formData.stock)) newErrors.stock = "Stock is required.";


        return newErrors; // Return the error object
    };

    const importexcel = (event) => {
        // If triggered by file input
        const file = event?.target?.files ? event.target.files[0] : null;

        // If triggered by button click, use the file uploaded
        if (!file) {
            alert("Please upload an Excel file first!");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
            setExcelData(jsonData);
            console.log("Excel Data Imported:", jsonData);
        };

        reader.readAsBinaryString(file);
    };

    const uploadexcel = () => {

        const transformData = (data) => {
            return data.map((item) => {
                return Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [key, value !== null ? String(value) : ""])
                );
            });
        };

        const data = {
            excelData: transformData(excelData), // Keeping JSON.stringify
            created_by: localStorage.getItem("licare_code"),
        };

        axiosInstance.post(`${Base_Url}/uplaodmslexcel`, data, {
            headers: {
                Authorization: token, // Send token in headers
            },
        })
            .then((res) => {
                if (res.data) {
                    alert("Uploaded")
                }
                console.log(res)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const fetchMsp = async () => {
        try {
            const response = await axiosInstance.post(
                `${Base_Url}/getmspdata`,
                { param: text },
                {
                    headers: { Authorization: token },
                }
            );

            const encryptedData = response.data.encryptedData;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setMspData(decryptedData);
        } catch (error) {
            console.error("Error fetching models:", error);
        }

    };

    const fetchCsp = async () => {
        try {
            const response = await axiosInstance.post(
                `${Base_Url}/getcspdata`,
                { param: text },
                {
                    headers: { Authorization: token },
                }
            );

            const encryptedData = response.data.encryptedData;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setCspData(decryptedData);
        } catch (error) {
            console.error("Error fetching models:", error);
        }

    };




    const handleInputChange = _debounce((newValue) => {
        setText(newValue);
        fetchMsp();
    }, 100);

    const handleSearchChangeCsp = (newValue) => {
        setSelectedCsp(newValue);
        // If an option is selected, update msp_code and msp_name
        if (newValue) {
            setFormData(prevState => ({
                ...prevState,
                csp_code: newValue.licare_code || "",
                csp_name: newValue.title || ""  // <-- Adjust property name if different
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                csp_code: "",
                csp_name: ""
            }));
        }
    };

    const handleInputChangeCsp = _debounce((newValue) => {
        setText(newValue);
        fetchCsp();
    }, 100);

    const handleSearchChange = (newValue) => {
        setSelectedMsp(newValue);

        // If an option is selected, update msp_code and msp_name
        if (newValue) {
            setFormData(prevState => ({
                ...prevState,
                msp_code: newValue.licarecode || "",
                msp_name: newValue.title || ""  // <-- Adjust property name if different
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                msp_code: "",
                msp_name: ""
            }));
        }
    };

    //handlesubmit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }


        const payload = Object.fromEntries(
            Object.entries({
                ...formData,
            }).map(([key, value]) => [key, String(value)])
        );
        console.log(payload, 'item_description,')
        const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(payload),
            secretKey
        ).toString();

        setDuplicateError(""); // Clear duplicate error before submitting

        try {
            const confirmSubmission = window.confirm(
                "Do you want to submit the data?"
            );
            if (confirmSubmission) {
                if (isEdit) {
                    // For update, include 'updated_by'
                    await axios
                        .post(`${Base_Url}/putmsl`, {
                            encryptedData,
                        }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },

                        })
                        .then((response) => {
                            //window.location.reload();
                            setSuccessMessage('Msl Updated Successfully!');
                            setTimeout(() => setSuccessMessage(''), 3000);

                            setFormData({
                                msp_code: "",
                                msp_name: "",
                                csp_code: "",
                                csp_name: "",
                                item: "",
                                item_description: "",
                                stock: "",
                            });

                            setSelectedMsp(null);
                            setSelectedCsp(null);
                            fetchUsers();
                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError(
                                    "Duplicate entry, Msl already exists!"
                                ); // Show duplicate error for update
                            }
                        });
                } else {
                    // For insert, include 'created_by'
                    await axios
                        .post(`${Base_Url}/postmsl`, {
                            encryptedData
                        }, {
                            headers: {
                                Authorization: token, // Send token in headers
                            },
                        })
                        .then((response) => {
                            // window.location.reload();
                            setFormData({
                                msp_code: "",
                                msp_name: "",
                                csp_code: "",
                                csp_name: "",
                                item: "",
                                item_description: "",
                                stock: "",
                            });
                            setSuccessMessage('Msl Updated Successfully!');
                            setSelectedMsp(null);
                            setSelectedCsp(null);
                            setTimeout(() => setSuccessMessage(''), 3000);
                            fetchUsers();

                        })
                        .catch((error) => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError(
                                    "Duplicate entry, Msl already exists!"
                                ); // Show duplicate error for insert
                            }
                        });
                }
            }
        } catch (error) {
            console.error("Error during form submission:", error);
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
        pageid: String(59)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    const indexOfLastUser = (currentPage + 1) * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div className="tab-content">
            <Grntab />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            {successMessage && (
                                <div className="alert alert-success text-center mb-3" role="alert">
                                    {successMessage}
                                </div>
                            )}
                            <div className="row">


                                <form
                                    onSubmit={handleSubmit}
                                >
                                    <div className="row">
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="mspcodeinput"
                                                className="input-field"
                                            >
                                                Msp Code<span className="text-danger">*</span>
                                            </label>
                                            <Autocomplete
                                                size="small"
                                                disablePortal
                                                options={mspdata}
                                                value={selectmsp}
                                                getOptionLabel={(option) => option?.licarecode || ""}
                                                onChange={(e, newValue) => setSelectedMsp(newValue)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Enter Msp Code"
                                                        variant="outlined"
                                                        error={!!errors.msp_code}
                                                        helperText={errors.msp_code}
                                                    />
                                                )}
                                            />

                                            {/* <input
                                                type="text"
                                                className="form-control"
                                                name="msp_code"
                                                id="mspcodeinput"
                                                value={formData.msp_code}
                                                onChange={handleChange}
                                                placeholder="EnterMsp Code "
                                            /> */}
                                            {errors.msp_code && (
                                                <small className="text-danger">
                                                    {errors.msp_code}
                                                </small>
                                            )}
                                            {duplicateError && (
                                                <small className="text-danger">{duplicateError}</small>
                                            )}{" "}
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="mspnameinput"
                                                className="input-field"
                                            >
                                                Msp Name<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="msp_name"
                                                id="mspnameinput"
                                                value={formData.msp_name}
                                                onChange={handleChange}
                                                placeholder="Enter Msp Name "
                                            />
                                            {errors.msp_name && (
                                                <small className="text-danger">
                                                    {errors.msp_name}
                                                </small>
                                            )}
                                        </div>
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="cspcodeinput"
                                                className="input-field"
                                            >
                                                Csp Code<span className="text-danger">*</span> </label>
                                            <Autocomplete
                                                size="small"
                                                disablePortal
                                                options={cspdata}
                                                value={selectcsp}
                                                getOptionLabel={(option) => option.licare_code || ""}
                                                onChange={(e, newValue) => handleSearchChangeCsp(newValue)}
                                                onInputChange={(e, newInputValue) => handleInputChangeCsp(newInputValue)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Enter Csp Code"
                                                        variant="outlined"
                                                        error={!!errors.csp_code}
                                                        helperText={errors.csp_code}
                                                    />
                                                )}
                                            />
                                            {/* <input
                                                type="tel"
                                                className="form-control"
                                                name="csp_code"
                                                id="cspcodeinput"
                                                value={formData.csp_code}
                                                onChange={handleChange}
                                                placeholder="Enter Csp Code "

                                            /> */}
                                            {errors.csp_code && (
                                                <small className="text-danger">
                                                    {errors.csp_code}
                                                </small>
                                            )}
                                            {duplicateError && (
                                                <small className="text-danger">{duplicateError}</small>
                                            )}{" "}
                                            {/* Show duplicate error */}
                                        </div>
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="cspnameinput"
                                                className="input-field"
                                            >
                                                Csp Name<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="csp_name"
                                                id="cspnameinput"
                                                value={formData.csp_name}
                                                onChange={handleChange}
                                                placeholder="Enter Csp Name "
                                            />
                                            {errors.csp_name && (
                                                <small className="text-danger">
                                                    {errors.csp_name}
                                                </small>
                                            )}

                                        </div>

                                    </div>
                                    <div className="row">
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="iteminput"
                                                className="input-field"
                                            >
                                                Item<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="item"
                                                id="iteminput"
                                                value={formData.item}
                                                onChange={handleChange}
                                                placeholder="EnterItem "
                                            />
                                            {errors.item && (
                                                <small className="text-danger">
                                                    {errors.item}
                                                </small>
                                            )}
                                            {duplicateError && (
                                                <small className="text-danger">{duplicateError}</small>
                                            )}{" "}
                                            {/* Show duplicate error */}
                                        </div>


                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="itemdescription"
                                                className="input-field"
                                            >
                                                Item Description <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="item_description"
                                                id="itemdescription"
                                                value={formData.item_description}
                                                onChange={handleChange}
                                                placeholder="Enter Item Description  "
                                            />
                                            {errors.item_description && (
                                                <small className="text-danger">
                                                    {errors.item_description}
                                                </small>
                                            )}
                                        </div>
                                        <div className="col-3 mb-3">
                                            <label
                                                htmlFor="stockinput"
                                                className="input-field"
                                            >
                                                Stock <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="stock"
                                                id="stockinput"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="Enter Stock  "
                                            />
                                            {errors.stock && (
                                                <small className="text-danger">
                                                    {errors.stock}
                                                </small>
                                            )}
                                        </div>


                                    </div>

                                    {roleaccess > 2 ? <div className="text-right">
                                        <button className="btn btn-liebherr" type="submit">
                                            {isEdit ? "Update" : "Submit"}
                                        </button>
                                    </div> : null}
                                </form>


                            </div>
                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    );
};

export default AddMsl;
