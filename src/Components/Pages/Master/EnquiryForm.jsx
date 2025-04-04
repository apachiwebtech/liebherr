import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { useNavigate, useParams } from "react-router-dom";
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


export function EnquiryForm(params) {

    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');
    const [remark, setRemarkdata] = useState([]);
    const [custinfo, setCustInfo] = useState([]);
    const [previousinfo, setCustPreviousInfo] = useState([]);
    const [uid, setUid] = useState([]);
    const navigate = useNavigate()
    const token = localStorage.getItem("token");
    const created_by = localStorage.getItem("licare_code");

    const [remarkdata, setRemarks] = useState({
        remark: "",
        leadconvert: ""
    })


    const [formData, setFormData] = useState({
        source: "",
        enquiry_date: new Date(),
        salutation: "",
        customer_name: "",
        email: "",
        mobile: "",
        mwhatsapp: 0,
        alt_mobile: "",
        awhatsapp: 0,
        request_mobile: "",
        customer_type: "",
        enquiry_type: "",
        address: "",
        pincode: "",
        state: "",
        district: "",
        city: "",
        interested: "",
        modelnumber: "",
        priority: "",
        notes: "",
        enquiry_no: ""
    });
    let { enquiryid } = useParams()

    try {
        enquiryid = enquiryid.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(enquiryid, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        enquiryid = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }

    function formatDate(dateStr) {
        const dateObj = new Date(dateStr);

        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();

        return `${day}-${month}-${year}`;
    }






    //Validattion

    const validate = () => {
        const newErrors = {};
        if (!formData.source) newErrors.source = "Source is required";
        if (!formData.enquiry_date) newErrors.enquiry_date = "Enquiry date is required";
        if (!formData.salutation) newErrors.salutation = "Salutation is required";
        if (!formData.customer_name) newErrors.customer_name = "Customer name is required";
        // Mobile number validation
        const mobileRegex = /^[0-9]{10}$/;
        if (!formData.mobile) {
            newErrors.mobile = "Mobile number is required";
        } else if (!mobileRegex.test(formData.mobile)) {
            newErrors.mobile = "Mobile number must be exactly 10 digits ";
        }
        if (!formData.customer_type) newErrors.customer_type = "Customer type is required";
        if (!formData.enquiry_type) newErrors.enquiry_type = "Enquiry type is required";
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.pincode) newErrors.pincode = "Pincode is required";
        if (!formData.interested) newErrors.interested = "Interested field is required";
        if (!formData.priority) newErrors.priority = "Priority is required";
        if (!formData.notes) newErrors.notes = "Notes are required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    async function requestenquiry(params) {
        axios.get(`${Base_Url}/requestenquiry/${enquiryid}`, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                setFormData(res.data)

                setUid(res.data)
                getremarks(res.data.enquiry_no)
            })
            .catch((err) => {
                console.log(err)
            })
    }


    async function getremarks(enquiry_no) {
        axios.post(`${Base_Url}/getenquiryremark`, { enquiry_no: enquiry_no }, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                setRemarkdata(res.data)
            })
            .catch((err) => {
                alert("Error")
            })
    }

    useEffect(() => {

        if (enquiryid != undefined) {
            requestenquiry()

        }

    }, [])

    const populatedata = () => {
        setFormData({
            ...formData, // Preserve existing data in case you need it
            ...custinfo, // Overwrite with values from `custinfo`
        })
    }


    const handlesearchenquiry = () => {
        axios.post(`${Base_Url}/searchenquiry`, { search: search }, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                console.log(res)
                setCustInfo(res.data.customerdetails)
                setCustPreviousInfo(res.data.previousrecords)
            })
            .catch((err) => {
                alert("Error")
            })
    }

    const handleKeyDown = (e) => {
        // Prevent '+' and '-' keys
        if (e.key === "-" || e.key === "+") {
            e.preventDefault();
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        });
    };

    const handleremarkchange = (e) => {
        const { name, value } = e.target;
        setRemarks({
            ...remarkdata,
            [name]: value,
        });
    };


    const handleDateChange = (date) => {
        // Format the date to YYYY-MM-DD HH:mm:ss
        const formattedDate = date.toISOString().split('T')[0] + ' ' + date.toISOString().split('T')[1].split('.')[0];
    
        setFormData((prevData) => ({
            ...prevData,
            enquiry_date: formattedDate,
        }));
    
        console.log(formattedDate);
    };
    
    

    console.log(formData , "sadssd")

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {

            if (uid.id) {
                // Append form values to FormData
                const data = {
                    source: formData.source || "",
                    enquiry_date: formData.enquiry_date || "",
                    salutation: formData.salutation || "",
                    customer_name: formData.customer_name || "",
                    email: formData.email || "",
                    mobile: formData.mobile || "",
                    alt_mobile: formData.alt_mobile || "",
                    request_mobile: formData.request_mobile || "",
                    customer_type: formData.customer_type || "",
                    enquiry_type: formData.enquiry_type || "",
                    address: formData.address || "",
                    pincode: String(formData.pincode) || "",
                    state: formData.state || "",
                    district: formData.district || "",
                    city: formData.city || "",
                    interested: formData.interested || "",
                    modelnumber: formData.modelnumber || "",
                    priority: formData.priority || "",
                    notes: formData.notes || "",
                    created_by: created_by || "", // Pass the logged-in user's ID
                    mwhatsapp: String(formData.mwhatsapp) || "0",
                    awhatsapp: String(formData.awhatsapp) || "0",
                    uid: String(uid.id)
                };

                // Submit formData via API
                axios
                    .post(`${Base_Url}/putenquiry`, data, {
                        headers: {
                            Authorization: token,
                        },
                    })
                    .then((response) => {
                        alert("Enquiry updated successfully!");
                        navigate('/enquiryListing')

                    })
                    .catch((error) => {
                        console.error("Error submitting enquiry:", error);
                        alert("Something went wrong. Please try again.");
                    });
            } else {
                // Append form values to FormData
                const data = {
                    source: formData.source || "",
                    enquiry_date: formData.enquiry_date || "",
                    salutation: formData.salutation || "",
                    customer_name: formData.customer_name || "",
                    email: formData.email || "",
                    mobile: formData.mobile || "",
                    alt_mobile: formData.alt_mobile || "",
                    request_mobile: formData.request_mobile || "",
                    customer_type: formData.customer_type || "",
                    enquiry_type: formData.enquiry_type || "",
                    address: formData.address || "",
                    pincode: String(formData.pincode) || "",
                    state: formData.state || "",
                    district: formData.district || "",
                    city: formData.city || "",
                    interested: formData.interested || "",
                    modelnumber: formData.modelnumber || "",
                    priority: formData.priority || "",
                    notes: formData.notes || "",
                    created_by: created_by || "", // Pass the logged-in user's ID
                    mwhatsapp: String(formData.mwhatsapp),
                    awhatsapp: String(formData.awhatsapp)

                };

                // Submit formData via API
                axios
                    .post(`${Base_Url}/postenquiry`, data, {
                        headers: {
                            Authorization: token,
                        },
                    })
                    .then((response) => {
                        alert("Enquiry submitted successfully!");
                        navigate('/enquiryListing')
                    })
                    .catch((error) => {
                        console.error("Error submitting enquiry:", error);
                        alert("Something went wrong. Please try again.");
                    });
            }





        } else {
            alert("Please fix the errors before submitting.");
        }
    };

    const remarksubmit = (e) => {
        e.preventDefault();

        const data = {
            remark: remarkdata.remark,
            leadconvert: remarkdata.leadconvert,
            enquiry_no: formData.enquiry_no,
            created_by: created_by
        }


        if (remarkdata.remark != '') {
            axios.post(`${Base_Url}/addenquiryremark`, data, {
                headers: {
                    Authorization: token
                }
            })
                .then((res) => {
                    alert("Remark Added")
                    getremarks(formData.enquiry_no)
                })
        } else {
            alert("Remark is required")
        }
    }

    //get remarks



    const fetchlocations = async (pincode) => {


        try {

            const response = await axios.get(
                `${Base_Url}/getdatafrompincode/${pincode}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            }
            );

            if (response.data && response.data[0]) {



                setFormData((prevData) => ({
                    ...prevData,
                    state: response.data[0].state,
                    city: response.data[0].city,
                    district: response.data[0].district,
                    pincode: response.data[0].pincode
                }));
                

            }


        } catch (error) {
            console.error("Error fetching ticket details:", error);
        }
    }

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
        pageid: String(55)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 




    return (
        <>

            {roleaccess > 1 ? < div className="p-3">

                <div className="row ">
                    <div className="complbread">
                        <div className="row">
                            <div className="col-md-3">
                                < label className="breadMain">Register New Enquiry</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-25">

                    {/* First Part Start  */}

                    <div className="col-3">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div>
                                    <p>Search by Mobile No./ Customer Name / Email Id</p>
                                    <div className="row g-3 align-items-center">
                                        <div className="col-8">
                                            <input
                                                required
                                                type="text"
                                                name="searchtext"
                                                id="searchtext"
                                                className="form-control"
                                                aria-describedby="passwordHelpInline"
                                                onChange={(e) => {
                                                    setSearch(e.target.value)
                                                }}

                                                placeholder="Enter Mobile / Email / Customer Name"
                                            />
                                        </div>
                                        <div className="col-4">
                                            <button
                                                id="inputSearch"
                                                name="inputSearch"
                                                type="submit"
                                                className="btn btn-liebherr"
                                                onClick={handlesearchenquiry}
                                               
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                        {custinfo.id ? <div id="searchResult" className="card">

                            <div className="card-body">



                                {/* Display addresses here */}
                                {/* <p style={{fontSize: '12px'}}>{searchdata.address}</p> */}
                                <div className="row">
                                    <div className="col-md-12">

                                        <p key="single-address" style={{ fontSize: '12px', }}></p>

                                    </div>
                                </div>

                                <>

                                    <div className="tab-content mb-3">
                                        <div className="tab-pane active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                            <table className="table table-striped">
                                                <tbody>


                                                    <tr>
                                                        <td>{custinfo.customer_name}</td>
                                                        <td>
                                                        {roleaccess > 2 ?<div className="text-right pb-2">
                                                                <button className="btn btn-sm btn-primary generateTicket" onClick={populatedata} >New Enquiry</button>
                                                            </div> : null}
                                                        </td> 
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>


                                <>
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Previous Enquiry</a>
                                        </li>
                                    </ul>

                                    <div className="tab-content">
                                        <div className="tab-pane active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <td>Enquiry No</td>
                                                        <td>Enquiry Date</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previousinfo.map((item, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div style={{ fontSize: "14px" }}>{item.enquiry_no}</div>
                                                                    <span style={{ fontSize: "14px" }}></span>
                                                                </td>
                                                                <td style={{ fontSize: "14px" }}>{formatDate(item.enquiry_date)}</td>

                                                            </tr>
                                                        )
                                                    })}


                                                </tbody>

                                            </table>
                                        </div>
                                    </div>
                                </>



                            </div>

                        </div> : <div className="card">
                           {roleaccess > 2 ? <div className="card-body">
                                {/* Only show "No Result Found" if a search was performed and no results were found */}
                                {previousinfo.length == 0 && <p className="text-danger ">No Result Found</p>}
                                <button className="btn btn-sm btn-primary">New Enquiry</button>
                            </div> : null}


                        </div>}









                    </div>

                    {/* First Part End  */}


                    {/* Middle Part Start  */}

                    <div className="col-6">
                        <div className="card" id="formInfo">
                            <div className="card-body">

                                <div className="row">
                                    <div className="col-md-12">
                                        <h3 className="mainheade">Enquiry <span id="compaintno">:</span></h3>
                                    </div>
                                </div>

                                <form className="row" onSubmit={handleSubmit} >



                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Source<span className="text-danger">*</span></label>
                                            <select className="form-control" name="source" value={formData.source} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option value="Call">Call</option>
                                                <option value="Website">Website</option>
                                                <option value="Call">Social Media</option>
                                                <option value="Call">E-mail</option>
                                                <option value="Call">SMS</option>
                                            </select>
                                            {errors.source && <span className="text-danger">{errors.source}</span>}

                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Enquiry Date<span className="text-danger">*</span></label>

                                            <DatePicker

                                                dateFormat="dd-MM-yyyy"
                                                placeholderText="DD-MM-YYYY"
                                                className='form-control'
                                                name="enquiry_date"
                                                aria-describedby="Anidate"
                                                selected={formData.enquiry_date}
                                                onChange={handleDateChange}

                                            />
                                            {errors.enquiry_date && (
                                                <span className="text-danger">{errors.enquiry_date}</span>
                                            )}

                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Salutation <span className="text-danger">*</span></label>
                                            <select className="form-control" name="salutation" value={formData.salutation} onChange={handleChange}>
                                                <option value="">Salutation</option>
                                                <option value="Mr">Mr</option>
                                                <option value="Mrs">Mrs</option>
                                                <option value="Miss">Miss</option>
                                                <option value="M.">M.</option>
                                                <option value="Lhi">Lhi</option>
                                                <option value="Dl">Dl</option>
                                            </select>
                                            {errors.salutation && (
                                                <span className="text-danger">{errors.salutation}</span>
                                            )}

                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Customer Name <span className="text-danger">*</span></label>
                                            <input type="text" name="customer_name" className="form-control" placeholder="Enter Customer Name" value={formData.customer_name} onChange={handleChange} />
                                            {errors.customer_name && (
                                                <span className="text-danger">{errors.customer_name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Email Id</label>
                                            <input type="email" name="email" className="form-control" placeholder="Enter Email Id" value={formData.email} onChange={handleChange} />

                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Mobile No.  <span className="text-danger">*</span>
                                                <input type="checkbox" name='mwhatsapp' onChange={handleChange} checked={formData.mwhatsapp === 1} />Whatsapp</label>
                                            <input type="number" name="mobile" onKeyDown={handleKeyDown} className="form-control" placeholder="Enter Mobile" value={formData.mobile} onChange={(e) => {
                                                if (e.target.value.length <= 10) {
                                                    handleChange(e);
                                                }
                                            }} />
                                            {errors.mobile && (
                                                <span className="text-danger">{errors.mobile}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Alt. Mobile No. <input type="checkbox" name="awhatsapp" checked={formData.awhatsapp === 1} onChange={handleChange} />Whatsapp</label>
                                            <input type="number" className="form-control" name="alt_mobile" placeholder="Enter Mobile" onChange={handleChange} value={formData.alt_mobile} />

                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Requested Mobile </label>
                                            <input type="text" className="form-control" name="request_mobile" placeholder="Enter Requested Mobile" value={formData.request_mobile} onChange={handleChange} />

                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Customer Type <span className="text-danger">*</span></label>
                                            <select className="form-control" name="customer_type" onChange={handleChange} value={formData.customer_type} >
                                                <option value="">Select</option>
                                                <option value="Customer">Customer</option>
                                                <option value="Dealer">Dealer</option>
                                            </select>
                                            {errors.customer_type && (
                                                <span className="text-danger">{errors.customer_type}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Enquiry Type <span className="text-danger">*</span></label>
                                            <select className="form-control" name="enquiry_type" value={formData.enquiry_type} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option value="Product">Product</option>
                                                <option value="Spare Parts">Spare Parts</option>
                                                <option value="Dealership">Dealership</option>
                                                <option value="Service Partner">Service Partner</option>
                                                <option value="Others">Others</option>
                                            </select>
                                            {errors.enquiry_type && (
                                                <span className="text-danger">{errors.enquiry_type}</span>
                                            )}
                                        </div>
                                    </div>



                                    <>
                                        <style>
                                            {`
                                                    .popup {
                                                        position: fixed;
                                                        top: 0;
                                                        left: 0;
                                                        right: 0;
                                                        bottom: 0;
                                                        background: rgba(0, 0, 0, 0.85);
                                                        display: flex;
                                                        justify-content: center;
                                                        align-items: center;
                                                        z-index: 1000;
                                                    }

                                                    .popup-content {
                                                        background: rgb(240, 240, 240);
                                                        padding: 20px;
                                                        border-radius: 10px;
                                                        width: 600px;
                                                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                                                    }

                                                    h3 {
                                                        font-size: 20px;
                                                        margin-bottom: 15px;
                                                        color: #007bff;
                                                        text-align: center;
                                                    }

                                                    select, textarea {
                                                        width: 100%;
                                                        height: 45px;
                                                        padding: 10px;
                                                        margin-bottom: 15px;
                                                        border: 1px solid black; /* Changed border color to black */
                                                        border-radius: 5px;
                                                        background: white;
                                                        color: #555;
                                                        font-size: 16px;
                                                    }

                                                    button {
                                                        background-color: #007bff;
                                                        color: white;
                                                        border: none;
                                                        padding: 10px 15px;
                                                        border-radius: 5px;
                                                        cursor: pointer;
                                                        transition: background-color 0.3s;
                                                    }

                                                    button:hover {
                                                        background-color: #0056b3;
                                                    }

                                                    .addressbtn {
                                                        background: none;
                                                        color: #222;
                                                        border: none;
                                                        padding: 0;
                                                        font-size: 13px;
                                                        margin-top: 5px !important;
                                                        text-align: right;
                                                        position: absolute;
                                                        right: 20px;
                                                    }

                                                    .addressbtn:hover {
                                                        color:blue;
                                                        background:none;

                                                    }
                                                `}
                                        </style>

                                    </>

                                    <>

                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Address <span className="text-danger">*</span></label>
                                                <textarea
                                                    className="form-control"
                                                    value={formData.address}
                                                    name="address"
                                                    onChange={handleChange}
                                                    placeholder="Enter Address"
                                                ></textarea>
                                                {errors.address && (
                                                    <span className="text-danger">{errors.address}</span>
                                                )}
                                            </div>
                                        </div>


                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">Pincode <span className="text-danger">*</span></label>
                                                <input type="number" className="form-control" onKeyDown={handleKeyDown} name="pincode" placeholder="" value={formData.pincode} onChange={(e) => {
                                                    if (e.target.value.length <= 6) {
                                                        handleChange(e);
                                                        fetchlocations(e.target.value)
                                                    }
                                                }} />
                                                {errors.pincode && (
                                                    <span className="text-danger">{errors.pincode}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">State</label>
                                                <input type="text" className="form-control" name="state" placeholder="" disabled value={formData.state} />

                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">District</label>
                                                <input type="text" className="form-control" name="district" placeholder="" disabled value={formData.district} />

                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label htmlFor="exampleFormControlInput1" className="form-label">City</label>
                                                <input type="text" className="form-control" name="city" placeholder="" disabled value={formData.city} />

                                            </div>
                                        </div>

                                    </>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Interested In<span className="text-danger">*</span></label>
                                            <select className="form-control" name="interested" value={formData.interested} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option value="Consumer">Consumer</option>
                                                <option value="Import">Import</option>
                                            </select>
                                            {errors.interested && (
                                                <span className="text-danger">{errors.interested}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Model Number</label>
                                            <input type="text" className="form-control" name="modelnumber" placeholder="" onChange={handleChange} value={formData.modelnumber} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Priority<span className="text-danger">*</span></label>
                                            <select defaultValue={'REGULAR'} className="form-control" name="priority" value={formData.priority} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option value="REGULAR" >Regular</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                            {errors.priority && (
                                                <span className="text-danger">{errors.priority}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput1" className="form-label">Notes <span className="text-danger">*</span></label>
                                            <textarea
                                                className="form-control"
                                                value={formData.notes}
                                                name="notes"
                                                onChange={handleChange}
                                                placeholder="Enter Notes"
                                            ></textarea>
                                            {errors.notes && (
                                                <span className="text-danger">{errors.notes}</span>
                                            )}
                                        </div>
                                    </div>



                                   {roleaccess > 2 ? <div className="col-md-12">
                                        <button style={{ float: "right" }} type="submit" className="btn btn-liebherr"
                                            >Submit</button>
                                    </div> : null}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Middle Part End  */}


                    {/* End Part Start  */}
                    {uid.id ? <div className="col-3">

                        <>
                            <div className="card mb-3" id="engineerInfo">
                                <form className="card-body" onSubmit={remarksubmit}>
                                    <h4 className="pname">Follow Up Remarks <span className="text-danger">*</span></h4>

                                    <div className="mb-3">
                                        <textarea
                                            className="form-control"
                                            name="remark"
                                            onChange={handleremarkchange}
                                            placeholder="Enter Fault Remarks..."
                                        ></textarea>

                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Lead Converted</label>
                                        <select className="form-control" name="leadconvert" onChange={handleremarkchange}>
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>

                                    </div>

                                    {roleaccess > 2 ?<div className="mb-3 text-right">
                                        <button type="submit" class="btn btn-sm btn-primary">Submit Remarks</button>
                                    </div> : null}
                                </form>
                            </div>

                            <div className="card mb-3" id="flwremarks">
                                <div className="card-body">
                                    <div class="mt-3"><h4 class="pname">Remark List</h4>

                                        <table class="table table-bordered" >
                                            <thead>
                                                {remark.map((item) => {
                                                    return (
                                                        <tr>
                                                            <td><p>{item.remark}<br></br><br /><span>Date : {formatDate(item.created_date)} by {item.title}</span></p></td>
                                                        </tr>
                                                    )
                                                })}
                                            </thead>
                                            <tbody>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </>

                    </div> : null}






                </div>



            </div> : null}

        </>
    )
}
