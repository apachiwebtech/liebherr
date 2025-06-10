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
import DatePicker from 'react-datepicker';
const AddPostWarranty = () => {
    // Step 1: Add this state to track errors
    const { loaders, axiosInstance } = useAxiosLoader();
    const [text, setText] = useState("");
    const { postsaleid } = useParams();
    const navigate = useNavigate();
    const [Producttype, setProducttype] = useState([])
    const [ProductClass, setProductClass] = useState([])
    const [ProductLine, setProductLine] = useState([])
    const token = localStorage.getItem("token");
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [scheme_startdate, setStartDate] = useState('');
    const [scheme_enddate, setEndDate] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [duplicateError, setDuplicateError] = useState('');

    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
        const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
        return `${year}-${month}-${day}`;
    };

    try {
        postsaleid = postsaleid.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(postsaleid, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        postsaleid = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }


    const [formData, setFormData] = useState({
        Producttype: '',
        ProductLine: '',
        ProductClass: '',
        ServiceType: '',
        warranty_year: '',
        compressor_warranty: '',
        warranty_amount: '',
        is_scheme: '',
        scheme_name: '',
        scheme_startdate: '',
        scheme_enddate: '',
    });

    const fetchpostsalepopulate = async (postsaleid) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getpostsalepopulate/${postsaleid}`, {
                headers: {
                    Authorization: token,
                },
            });
            setStartDate(response.data[0].scheme_startdate)
            setEndDate(response.data[0].scheme_enddate)
            setFormData({
                ...response.data[0],
                Producttype: response.data[0].Producttype,
                ProductLine: response.data[0].ProductLine,
                ProductClass: response.data[0].ProductClass,
                ServiceType: response.data[0].ServiceType,
                warranty_year: response.data[0].warranty_year,
                compressor_warranty: response.data[0].compressor_warranty,
                warranty_amount: response.data[0].warranty_amount,
                is_scheme: response.data[0].is_scheme,
                scheme_name: response.data[0].scheme_name,
                scheme_startdate: response.data[0].scheme_startdate,
                scheme_enddate: response.data[0].scheme_enddate,
            });
            setIsEdit(true);

        } catch (error) {
            console.error("Error fetching Post Sale  Warrenty:", error);
        }
    };

    const handleDateChange = (date) => {


        if (date) {
            const formattedDate = formatDate(date);
            setStartDate(formattedDate)
        }

    };
    const handleDateChange2 = (date) => {


        if (date) {
            const formattedDate = formatDate(date);
            setEndDate(formattedDate)
        }

    };


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
            const response = await axiosInstance.get(`${Base_Url}/getpostsalewarrenty`, {
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
        getproducttype();
        getproductline();
        getproductClass();

        if (postsaleid != 0) {
            fetchpostsalepopulate(postsaleid);
        }

    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    };



    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {};

        if (!formData.ServiceType) {
            newErrors.ServiceType = "Service Type selection is required.";
        }
        if (!formData.Producttype) {
            newErrors.Producttype = "Product Type Selection is required.";
        }
        if (!formData.ProductLine) {
            newErrors.ProductLine = "Product Line Selection is required.";
        }
        if (!formData.ProductClass) {
            newErrors.ProductClass = "Product Class Selection is required.";
        }
        if (!formData.warranty_year) {
            newErrors.warranty_year = "Warranty Year  Field is required.";
        }
        if (!formData.compressor_warranty) {
            newErrors.compressor_warranty = "Compressor Warranty Field is required.";
        }
        if (!formData.warranty_amount) {
            newErrors.warranty_amount = "Warranty Amount is required.";
        }
        if (!formData.is_scheme) {
            newErrors.is_scheme = "IS Scheme  Field is required.";
        }
        if (!formData.scheme_name) {
            newErrors.scheme_name = "Scheme Name  Field is required.";
        }
        // if (!scheme_startdate.scheme_startdate) {
        //     newErrors.scheme_startdate = "Scheme Start Date  is required.";
        // }
        // if (!scheme_enddate.scheme_enddate) {
        //     newErrors.scheme_enddate = "Scheme End  Date  is required.";
        // }
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
            scheme_startdate: scheme_startdate, // from state
            scheme_enddate: scheme_enddate,     // from state
            created_by, // or whatever you use
        };

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
                    await axiosInstance.post(`${Base_Url}/putpostsale`, payload, {
                        headers: {
                            Authorization: token,
                        },
                    })
                        .then(response => {
                            alert("Post Sale  Warranty Updated")

                            setFormData({
                                ServiceType: '',
                                Producttype: '',
                                ProductLine: '',
                                ProductClass: '',
                                warranty_year: '',
                                compressor_warranty: '',
                                warranty_amount: '',
                                is_scheme: '',
                                scheme_name: '',
                                scheme_startdate: '',
                                scheme_enddate: '',
                            })
                            fetchUsers();
                            navigate('/post_sale_warrenty');
                        })
                        .catch(error => {
                            if (error.response && error.response.status === 409) {
                                setDuplicateError('Duplicate entry Product Type,Line And Class Credential already exists!'); // Show duplicate error for update
                            }
                        });
                } else {

                    await axiosInstance.post(`${Base_Url}/postpostsale`, payload
                        , {
                            headers: {
                                Authorization: token,
                            },
                        }
                    )
                        .then(response => {
                            alert("Post Sale  Warranty Added")
                            setFormData({
                                ServiceType: '',
                                Producttype: '',
                                ProductLine: '',
                                ProductClass: '',
                                warranty_year: '',
                                compressor_warranty: '',
                                warranty_amount: '',
                                is_scheme: '',
                                scheme_name: '',
                                scheme_startdate: '',
                                scheme_enddate: '',
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
        pageid: String(73)
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

                                            <div className="col-md-3">
                                                <label
                                                    htmlFor="Producttype"
                                                    className="form-label pb-0 dropdown-label"
                                                >
                                                    Product Type<span className='text-danger'>*</span>
                                                </label>
                                                <select
                                                    className="form-select dropdown-select"
                                                    name="Producttype"
                                                    value={formData.Producttype}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Product Type</option>

                                                    {Producttype.map((item) => {
                                                        return (
                                                            <option value={item.product_type}>{item.product_type}</option>
                                                        )
                                                    })}

                                                </select>
                                                {errors.Producttype && <small className="text-danger">{errors.Producttype}</small>}
                                                {duplicateError && <small className="text-danger">{duplicateError}</small>} {/* Show duplicate error */}

                                            </div>
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
                                                <label htmlFor="ServiceTypeInput" className="input-field" style={{ marginBottom: '15px', fontSize: '18px' }}>Service Type</label>
                                                <select
                                                    className="form-select"
                                                    name="ServiceType"
                                                    id="ServiceTypeInput"
                                                    value={formData.ServiceType}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Service  Type</option>
                                                    <option value="Out of Warranty">Out of Warranty</option>
                                                    <option value="AMC">AMC</option>
                                                    <option value="Ex-WARR">Ex-Warr</option>

                                                    {/* Add more options as necessary */}
                                                </select>
                                                {errors.ServiceType && <small className="text-danger">{errors.ServiceType}</small>}
                                            </div>



                                        </div>
                                        <div className='row'>


                                            <div className="col-md-3">
                                                <label className="input-field">Warranty Year<span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="warranty_year"
                                                    value={formData.warranty_year}
                                                    onChange={handleChange}
                                                    placeholder="Enter Warranty Year "
                                                />
                                                {errors.warranty_year && <small className="text-danger">{errors.warranty_year}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field">Compressor Warranty <span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="compressor_warranty"
                                                    value={formData.compressor_warranty}
                                                    onChange={handleChange}
                                                    placeholder="Enter Compressor Warranty "
                                                />
                                                {errors.compressor_warranty && <small className="text-danger">{errors.compressor_warranty}</small>}
                                            </div>
                                            <div className="col-md-3">
                                                <label className="input-field">Warranty Amount<span className="text-danger">*</span></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="warranty_amount"
                                                    value={formData.warranty_amount}
                                                    onChange={handleChange}
                                                    placeholder="Enter Warranty Amount"
                                                />
                                                {errors.warranty_amount && <small className="text-danger">{errors.warranty_amount}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field"> Is Scheme  <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="is_scheme"
                                                    value={formData.is_scheme}
                                                    onChange={handleChange}
                                                    placeholder="Enter Is Scheme "
                                                />
                                                {errors.is_scheme && <small className="text-danger">{errors.is_scheme}</small>}
                                            </div>



                                        </div>
                                        <div className='row' style={{ marginTop: '10px' }}>


                                            <div className="col-md-3">
                                                <label className="input-field"> Scheme Name  <span className="text-danger">*</span></label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="scheme_name"
                                                    value={formData.scheme_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter Scheme Name "
                                                />
                                                {errors.scheme_name && <small className="text-danger">{errors.scheme_name}</small>}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field d-block mb-1">
                                                    Scheme StartDate <span className="text-danger">*</span>
                                                </label>
                                                <DatePicker
                                                    selected={scheme_startdate}
                                                    onChange={handleDateChange}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholderText="DD-MM-YYYY"
                                                    className='form-control'
                                                    name="scheme_startdate"
                                                    aria-describedby="startdateinput"
                                                />
                                                {errors.scheme_startdate && (
                                                    <small className="text-danger">{errors.scheme_startdate}</small>
                                                )}
                                            </div>

                                            <div className="col-md-3">
                                                <label className="input-field d-block mb-1">
                                                    Scheme EndDate <span className="text-danger">*</span>
                                                </label>
                                                <DatePicker
                                                    selected={scheme_enddate}
                                                    onChange={handleDateChange2}
                                                    dateFormat="dd-MM-yyyy"
                                                    placeholderText="DD-MM-YYYY"
                                                    className='form-control'
                                                    name="scheme_enddate"
                                                    aria-describedby="startdateinput"
                                                />
                                                {errors.scheme_enddate && (
                                                    <small className="text-danger">{errors.scheme_enddate}</small>
                                                )}
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

export default AddPostWarranty;
