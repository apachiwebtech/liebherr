import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import md5 from "js-md5";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { Autocomplete, TextField } from "@mui/material";
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import _debounce from "lodash.debounce";
import { getRoleData } from "../../Store/Role/role-action";
import "react-datepicker/dist/react-datepicker.css";
import Ratecardtabs from './Ratecardtabs';
const AddRatecard = () => {
    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();
    const [text, setText] = useState("");
    const { rateid } = useParams();
    const navigate = useNavigate();
    const [ProductType, setProducttype] = useState([])
    const [ProductClass, setProductClass] = useState([])
    const [ProductLine, setProductLine] = useState([])
    const [csp_code, setCspcode] = useState([]);
    const token = localStorage.getItem("token");
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectcsp, setSelectedCsp] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [duplicateError, setDuplicateError] = useState('');

    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

    try {
        rateid = rateid.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(rateid, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        rateid = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }


    const [formData, setFormData] = useState({
        csp_code: '',
        call_type: '',
        class_city: '',
        ProductType: '',
        ProductLine: '',
        ProductClass: '',
        Within_24_Hours: '',
        Within_48_Hours: '',
        Within_96_Hours: '',
        MoreThan96_Hours: '',
        gas_charging: '',
        transportation: '',
    });

    const fetchratecardpopulate = async (rateid) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getratecardpopulate/${rateid}`, {
                headers: {
                    Authorization: token,
                },
            });
            setFormData({
                ...response.data[0],
                csp_code: response.data[0].csp_code,
                call_type: response.data[0].call_type,
                class_city: response.data[0].class_city,
                ProductType: response.data[0].ProductType,
                ProductLine: response.data[0].ProductLine,
                ProductClass: response.data[0].ProductClass,
                Within_24_Hours: response.data[0].Within_24_Hours,
                Within_48_Hours: response.data[0].Within_48_Hours,
                Within_96_Hours: response.data[0].Within_96_Hours,
                MoreThan96_Hours: response.data[0].MoreThan96_Hours,
                gas_charging: response.data[0].gas_charging,
                transportation: response.data[0].transportation
            });
            setIsEdit(true);

        } catch (error) {
            console.error("Error fetching Rate Card:", error);
        }
    };




    const fetchCspcode = async () => {
        try {
            const response = await axiosInstance.post(`${Base_Url}/getcspdata`,
                { param: text }, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setCspcode(decryptedData);
        } catch (error) {
            console.error("Error fetching csp_code:", error);
        }
    };
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
        fetchCspcode();
    }, 100);

    async function getproducttype() {
        axiosInstance.get(`${Base_Url}/product_type`
            , {
                headers: {
                    Authorization: token, // Send token in headers
                },
            })
            .then((res) => {
                setProducttype(res.data)
            })
    }
    async function getproductline() {
        axiosInstance.get(`${Base_Url}/fetchproductline`
            , {
                headers: {
                    Authorization: token, // Send token in headers
                },
            })
            .then((res) => {
                setProductLine(res.data)
            })
    }
    async function getproductClass() {
        axiosInstance.get(`${Base_Url}/fetchproductclass`
            , {
                headers: {
                    Authorization: token, // Send token in headers
                },
            })
            .then((res) => {
                setProductClass(res.data)
            })
    }


    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getratedata`, {
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
        fetchCspcode();
        getproducttype();
        getproductline();
        getproductClass();

        if (rateid != 0) {
            fetchratecardpopulate(rateid);
        }

    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    };



    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {};

        // Check if the cfranchise_id is empty
        if (!formData.csp_code) {
            newErrors.csp_code = "Csp Code selection is required.";
        }
        if (!formData.call_type) {
            newErrors.call_type = "Call Type selection is required.";
        }
        if (!formData.class_city) {
            newErrors.class_city = "Class City  selection is required.";
        }
        if (!formData.ProductType) {
            newErrors.ProductType = "Product Type Selection is required.";
        }
        if (!formData.ProductLine) {
            newErrors.ProductLine = "Product Line Selection is required.";
        }
        if (!formData.ProductClass) {
            newErrors.ProductClass = "Product Class Selection is required.";
        }
        if (!formData.Within_24_Hours) {
            newErrors.Within_24_Hours = "Within 24 Hours Field is required.";
        }
        if (!formData.Within_48_Hours) {
            newErrors.Within_48_Hours = "Within 48 Hours Field is required.";
        }
        if (!formData.Within_96_Hours) {
            newErrors.Within_96_Hours = "Within 96 Hours Field is required.";
        }
        if (!formData.MoreThan96_Hours) {
            newErrors.MoreThan96_Hours = "More Than 96 Hours Field is required.";
        }
        if (!formData.gas_charging) {
            newErrors.gas_charging = "Gas Charging Field is required.";
        }
        if (!formData.transportation) {
            newErrors.transportation = "Transportation Field is required.";
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
            created_by,
        }

        console.log(payload, "TTT")


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
                    await axiosInstance.post(`${Base_Url}/putratecard`, { formData, created_by }, {
                        headers: {
                            Authorization: token,
                        },
                    })
                        .then(response => {
                            alert("Rate Card Updated")

                            setFormData({
                                csp_code: '',
                                call_type: '',
                                class_city: '',
                                ProductType: '',
                                ProductLine: '',
                                ProductClass: '',
                                Within_24_Hours: '',
                                Within_48_Hours: '',
                                Within_96_Hours: '',
                                MoreThan96_Hours: '',
                                gas_charging: '',
                                transportation: '',
                            })
                            fetchUsers();
                            navigate('/ratecard');
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry Product Type,Line And Class Credential already exists!'); // Show duplicate error for update
                            }
                        });
                } else {

                    await axiosInstance.post(`${Base_Url}/postratecard`, { formData, created_by }
                        , {
                            headers: {
                                Authorization: token,
                            },
                        }
                    )
                        .then(response => {
                            alert("Rate Card Added")
                            setFormData({
                                csp_code: '',
                                call_type: '',
                                class_city: '',
                                ProductType: '',
                                ProductLine: '',
                                ProductClass: '',
                                Within_24_Hours: '',
                                Within_48_Hours: '',
                                Within_96_Hours: '',
                                MoreThan96_Hours: '',
                                gas_charging: '',
                                transportation: '',
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
        pageid: String(66)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    return (
        <div className="tab-content">
            <Ratecardtabs />
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
                                            <div className="col-3 mb-3">
                                                <label
                                                    htmlFor="cspcodeinput"
                                                    className="input-field"
                                                >
                                                    Csp Code<span className="text-danger">*</span>
                                                    {isEdit && formData.csp_code && (
                                                        <span className="ms-2 text-primary"> Current-({formData.csp_code})</span>
                                                    )} </label>
                                                <Autocomplete
                                                    size="small"
                                                    disablePortal
                                                    options={csp_code}
                                                    value={selectcsp}
                                                    getOptionLabel={(option) => option.licare_code || ""}
                                                    onChange={(e, newValue) => handleSearchChangeCsp(newValue)}
                                                    onInputChange={(e, newInputValue) => handleInputChangeCsp(newInputValue)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Enter Csp Code"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                />
                                                {errors.csp_code && (
                                                    <small className="text-danger">
                                                        {errors.csp_code}
                                                    </small>
                                                )}

                                            </div>
                                            <div className="col-md-3">
                                                <label htmlFor="callTypeInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Call Type</label>
                                                <select
                                                    className="form-select"
                                                    name="call_type"
                                                    id="callTypeInput"
                                                    value={formData.call_type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Call Type</option>
                                                    <option value="VISIT">VISIT</option>
                                                    <option value="BREAKDOWN">BREAKDOWN</option>
                                                    <option value="DEMO">DEMO</option>
                                                    <option value="INSTALLATION">INSTALLATION</option>
                                                    <option value="HELPDESK">HELPDESK</option>
                                                    <option value="MAINTENANCE">MAINTENANCE</option>

                                                    {/* Add more options as necessary */}
                                                </select>
                                                {errors.call_type && <small className="text-danger">{errors.call_type}</small>}
                                            </div>
                                            <div className="col-md-3">
                                                <label htmlFor="classcityInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Class City</label>
                                                <select
                                                    className="form-select"
                                                    name="class_city"
                                                    id="classcityInput"
                                                    value={formData.class_city}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Class City </option>
                                                    <option value="LOCAL">LOCAL</option>
                                                    <option value="UPCOUNTRY">UPCOUNTRY</option>

                                                    {/* Add more options as necessary */}
                                                </select>
                                                {errors.class_city && <small className="text-danger">{errors.class_city}</small>}

                                            </div>

                                            <div className="col-md-3">
                                                <label
                                                    htmlFor="ProductType"
                                                    className="form-label pb-0 dropdown-label"
                                                >
                                                    Product Type<span className='text-danger'>*</span>
                                                </label>
                                                <select
                                                    className="form-select dropdown-select"
                                                    name="ProductType"
                                                    value={formData.ProductType}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Product Type</option>

                                                    {ProductType.map((item) => {
                                                        return (
                                                            <option value={item.product_type}>{item.product_type}</option>
                                                        )
                                                    })}

                                                </select>
                                                {errors.ProductType && <small className="text-danger">{errors.ProductType}</small>}
                                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}

                                            </div>



                                        </div>
                                        <div className='row'>

                                            <div className="col-md-3">
                                                <label
                                                    htmlFor="ProductLine"
                                                    className="form-label pb-0 dropdown-label"
                                                >
                                                    Product Line<span className='text-danger'>*</span>
                                                </label>
                                                <select
                                                    className="form-select dropdown-select"
                                                    name="ProductLine"
                                                    value={formData.ProductLine}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Product Line</option>

                                                    {ProductLine.map((item) => {
                                                        return (
                                                            <option value={item.product_line}>{item.product_line}</option>
                                                        )
                                                    })}

                                                </select>
                                                {errors.ProductLine && <small className="text-danger">{errors.ProductLine}</small>}
                                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}

                                            </div>

                                            <div className="col-md-3">
                                                <label
                                                    htmlFor="ProductClass"
                                                    className="form-label pb-0 dropdown-label"
                                                >
                                                    Product Class<span className='text-danger'>*</span>
                                                </label>
                                                <select
                                                    className="form-select dropdown-select"
                                                    name="ProductClass"
                                                    value={formData.ProductClass}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Product Class</option>

                                                    {ProductClass.map((item) => {
                                                        return (
                                                            <option value={item.product_class}>{item.product_class}</option>
                                                        )
                                                    })}

                                                </select>
                                                {errors.ProductClass && <small className="text-danger">{errors.ProductClass}</small>}
                                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}

                                            </div>
                                            <div className="col-md-3">
                                                <label className="input-field">Within 24 Hours<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="Within_24_Hours"
                                                    value={formData.Within_24_Hours}
                                                    onChange={handleChange}
                                                    placeholder="Enter Within 24 Hours "
                                                />
                                                {errors.Within_24_Hours && <small className="text-danger">{errors.Within_24_Hours}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field">Within 48 Hours<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="Within_48_Hours"
                                                    value={formData.Within_48_Hours}
                                                    onChange={handleChange}
                                                    placeholder="Enter Within 48 Hours"
                                                />
                                                {errors.Within_48_Hours && <small className="text-danger">{errors.Within_48_Hours}</small>}
                                            </div>



                                        </div>
                                        <div className='row' style={{ marginTop: '10px' }}>
                                            <div className="col-md-3">
                                                <label className="input-field">Within 96 Hours<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="Within_96_Hours"
                                                    value={formData.Within_96_Hours}
                                                    onChange={handleChange}
                                                    placeholder="Enter Within 96 Hours"
                                                />
                                                {errors.Within_96_Hours && <small className="text-danger">{errors.Within_96_Hours}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field"> More Than 96 Hours <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="MoreThan96_Hours"
                                                    value={formData.MoreThan96_Hours}
                                                    onChange={handleChange}
                                                    placeholder="Enter More Than 96 Hours"
                                                />
                                                {errors.MoreThan96_Hours && <small className="text-danger">{errors.MoreThan96_Hours}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field"> Gas Charging  <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="gas_charging"
                                                    value={formData.gas_charging}
                                                    onChange={handleChange}
                                                    placeholder="Enter Gas Charging "
                                                />
                                                {errors.gas_charging && <small className="text-danger">{errors.gas_charging}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field"> Transportation <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="transportation"
                                                    value={formData.transportation}
                                                    onChange={handleChange}
                                                    placeholder="Enter Transportation"
                                                />
                                                {errors.transportation && <small className="text-danger">{errors.transportation}</small>}
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

export default AddRatecard;
