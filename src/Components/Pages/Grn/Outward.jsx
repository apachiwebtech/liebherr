import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { useSelector } from 'react-redux';
import $ from 'jquery';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { Autocomplete, TextField } from "@mui/material";
import _debounce from 'lodash.debounce';
import { useNavigate } from "react-router-dom";
import Grntab from "./Grntab";


const Outward = () => {


    const [selectedEngineerType, setSelectedEngineerType] = useState("ENGINEER");;
    const [errors, setErrors] = useState({});
    const [spareerrors, setSpareErrors] = useState({});
    const [hide, setHide] = useState(false);
    const [hidelist, setHidelist] = useState(false);
    const [spare, setSpare] = useState([]);
    const [SpareId, setSpareId] = useState([]);
    const [selectedspare, setselectedSpare] = useState([]);
    const [productdata, setProduct] = useState([]);
    const [cspdata, setData] = useState([]);
    const [selectcsp, setselectedCsp] = useState(null);
    const [engdata, setEngData] = useState([]);
    const [csptext, setcspText] = useState("");
    const [selecteng, setselectedEng] = useState(null);
    const [csp_no, setcsp_no] = useState(null);
    const [cspalldata, setAllData] = useState([]);
    const [receivecsp, setreciveCsp] = useState(null);
    const [selectproduct, setselectedproduct] = useState(null);
    const [text, setText] = useState("");
    const [submithide, setsubmithide] = useState(false);
    const [engtext, setEngText] = useState("");
    const [producttext, setProductText] = useState("");
    const token = localStorage.getItem("token"); // Get token from localStorage
    const created_by = localStorage.getItem("licare_code"); // Get token from localStorage
    const Issue_No = localStorage.getItem("issue_no"); // Get token from localStorage
    const [formData, setFormData] = useState({
        issue_to: "",
        issue_date: "",
        spare: "",
        remark: ''
    });


    const fetchCspAll = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearchallcsp`, { param: csptext }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setAllData(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchCsp = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearchcsp`, { param: text, licare_code: receivecsp?.id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setData(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    const fetchEng = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearcheng`, { param: engtext, licare_code: receivecsp?.id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setEngData(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchproduct = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getcspspareparts`, { csp_code: receivecsp?.id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setProduct(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchsparelist = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getissuesparelist`, { Issue_No: Issue_No }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            const updatedSpare = response.data.map((item) => ({
                ...item,
            }));
            setselectedSpare(updatedSpare)

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    // Step 2: Add form validation function
    const validateForm = () => {
        const newErrors = {}; // Initialize an empty error object

        if (!formData.issue_date) {
            // Check if the invoice date is empty
            newErrors.issue_date = "This is required."; // Set error message for invoice_date
        }

        if (selectedEngineerType == 'ENGINEER' && !selecteng) {
            newErrors.selecteng = "This is required.";
        }

        if (selectedEngineerType == 'Franchisee' && !selectcsp) {
            newErrors.selectcsp = "This is required.";
        }

        if (!receivecsp) {
            // Check if the invoice number is empty
            newErrors.receivecsp = "This is required."; // Set error message for invoice_no
        }


        setErrors(newErrors)
        return newErrors; // Return the error object
    };
    const SparevalidateForm = () => {
        const newErrors = {}; // Initialize an empty error object

        if (!selectproduct) {
            // Check if the invoice date is empty
            newErrors.selectproduct = "This is required."; // Set error message for invoice_date
        }
        if (!SpareId) {
            // Check if the invoice date is empty
            newErrors.spare = "This is required."; // Set error message for invoice_date
        }


        setSpareErrors(newErrors)
        return newErrors; // Return the error object
    };



    const handleAddSpare = async () => {

        const serrors = SparevalidateForm(); // Call validateForm to get validation errors

        if (Object.keys(serrors).length === 0) {
            const data = {
                spare_id: String(SpareId),
                issue_no: localStorage.getItem('issue_no'),
                created_by: receivecsp?.id
            };

            try {
                const response = await axios.post(`${Base_Url}/addissuespares`, JSON.stringify(data), {
                    headers: {
                        Authorization: token, // Send token in headers
                        "Content-Type": "application/json", // Explicitly set Content-Type
                        Authorization: token, // Send token in headers
                    },
                });
                if (response.data.message == 'Spare Added') {
                    setHide(true)
                    alert(response.data.message)
                    fetchsparelist()
                } else {

                    alert(response.data.message)

                }



            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    };


    //handlesubmit form

    const handlesubmit = (e) => {
        e.preventDefault()

        const errors = validateForm(); // Call validateForm to get validation errors

        if (Object.keys(errors).length === 0) {
            const data = {
                issue_date: formData.issue_date,
                lhi_code: selectcsp?.id || selecteng?.id, // Safely access id
                lhi_name: selectcsp?.title || selecteng?.title, // Safely access title
                created_by: receivecsp?.id,
                remark: formData.remark,
                isEng: selecteng ? 'eng' : selectcsp ? 'csp' : ''
            };


            axios.post(`${Base_Url}/add_spareoutward`, data, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            })
                .then((res) => {
                    alert(res.data.message)

                    if (res.data.issue_no) {
                        localStorage.setItem('issue_no', res.data.issue_no)
                        localStorage.setItem('issue_to', res.data.issue_to)
                        localStorage.setItem('lhi_code', res.data.lhi_code)
                        setsubmithide(true)
                        fetchproduct()
                        setHidelist(true)
                    }

                })
                .catch((err) => {
                    alert(err.response.data.message)
                })
        }



    }
    const navigate = useNavigate()
    const handleSpareSend = async () => {
        try {
            // Map the `spare` array to construct the payload with additional `spare_qty`
            const payload = selectedspare.map((item) => ({
                id: String(item.id),
                article_code: item.spare_no,
                article_title: item.spare_title,
                quantity: String(item.quantity) || String(0), // Use the updated `spare_qty`, default to 0 if empty
                issue_no: localStorage.getItem('issue_no'),
                licare_code: receivecsp?.id,
                issue_to: localStorage.getItem('issue_to'),
                lhi_code: localStorage.getItem('lhi_code')
            }));


            // Stringify the payload before sending
            const stringifiedPayload = JSON.stringify(payload);

            // Send stringified payload to the server
            const response = await axios.post(`${Base_Url}/updateissuespares`, stringifiedPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token, // Send token in headers
                }
            });


            if (response.status === 200) {
                alert("Data saved successfully!");
                navigate('/grnadminoutlist');
            } else if (response.status === 400) {
                alert("Insufficient stock for one or more items.");
            } else {
                alert("Failed to save data.");
            }

        } catch (error) {
            alert("Insufficient stock");
        }
    };

    // Handle change for `spare_qty`
    const handleQuantityChange = (index, value) => {

        const updatedSpare = [...selectedspare];
        updatedSpare[index].quantity = value; // Update `spare_qty` for the specific item
        console.log(updatedSpare)
        setselectedSpare(updatedSpare); // Update the state
    };


    const handlespareChange = async (article_id) => {

        setSpareId(article_id)

        try {
            const response = await axios.post(`${Base_Url}/getselctedspare`, { article_id: article_id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });


        } catch (error) {
            console.error("Error fetching users:", error);
        }

    }





    //For product

    useEffect(() => {
        fetchproduct()
    }, [])




    // const handleProductSearchChange = async (newValue) => {
    //     setselectedproduct(newValue);
    //     console.log("Selected:", newValue);



    //     try {
    //         const response = await axios.get(`${Base_Url}/getSpareParts/${newValue.item_code}`, {
    //             headers: {
    //                 Authorization: token, // Send token in headers
    //             },
    //         });


    //         setSpare(response.data); // Update the state
    //     } catch (error) {
    //         console.error("Error fetching users:", error);
    //     }
    // };
    const handleProductSearchChange = async (newValue) => {
        setselectedproduct(newValue);
        console.log("Selected:", newValue);

        setSpareId(newValue.product_code)
    };



    const handleInputCsp = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setcspText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchCspAll();
    }, 100);
    //For csp 
    const handleInputChange = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchCsp();
    }, 100);

    const handleInputEngChange = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setEngText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchEng();
    }, 100);

    const handleSearchAllChange = (newValue) => {
        setreciveCsp(newValue);
        setData([]);
        setEngData([]);
        setselectedCsp(null)
        setselectedEng(null)
    };
    const handleSearchChange = (newValue) => {
        setselectedCsp(newValue);
        console.log("Selected:", newValue);
    };
    const handleSearchEngChange = (newValue) => {
        setselectedEng(newValue);
        console.log("Selected:", newValue);
    };

    const handleEngineerTypeChange = (event) => {
        setSelectedEngineerType(event.target.value);
        console.log("Selected Engineer Type:", event.target.value);
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
        pageid: String(70)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    return (
        <div className="tab-content">
            <Grntab />

            {roleaccess > 1 && <div className="row mp0">
                <div className="col-lg-12">
                    <div className="card mb-3 tab_box">
                        <div
                            className="card-body"
                            style={{ flex: "1 1 auto", padding: "13px 28px" }}
                        >

                            <form
                                onSubmit={handlesubmit}
                                className="row"
                            >
                                <div className="d-flex mb-3 col-lg-12">
                                    <div className="form-check me-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="engineer"
                                            name="engineer_type"
                                            value="ENGINEER"
                                            onChange={handleEngineerTypeChange}
                                            checked={selectedEngineerType === "ENGINEER"} // Set "checked" dynamically
                                        />
                                        <label className="form-check-label" htmlFor="ENGINEER" style={{ fontSize: "14px" }}>
                                            ENGINEER
                                        </label>
                                    </div>

                                    <div className="form-check col-lg-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="franchisee"
                                            name="engineer_type"
                                            value="Franchisee"
                                            onChange={handleEngineerTypeChange}
                                            checked={selectedEngineerType === "Franchisee"}
                                        />
                                        <label className="form-check-label" htmlFor="franchisee" style={{ fontSize: "14px" }}>
                                            Service Partner
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Issue From  <span className="text-danger">*</span>
                                    </label>
                                    <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={cspalldata}
                                        value={receivecsp}
                                        getOptionLabel={(option) =>
                                            option && typeof option === "object"
                                                ? `${option.title} - ${option.id}`
                                                : ""
                                        }

                                        onChange={(e, newValue) => handleSearchAllChange(newValue)}
                                        onInputChange={(e, newInputValue) => handleInputCsp(newInputValue)}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                {option.title} — {option.id}
                                            </li>
                                        )}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Select CSP" variant="outlined" />
                                        )}
                                    />

                                    {errors.receivecsp && <span className="text-danger">{errors.receivecsp}</span>}
                                </div>

                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Issue to <span className="text-danger">*</span>
                                    </label>
                                    {selectedEngineerType === "Franchisee" ? <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={cspdata}
                                        value={selectcsp}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(e, newValue) => handleSearchChange(newValue)}
                                        onInputChange={(e, newInputValue) => handleInputChange(newInputValue)}
                                        renderInput={(params) => <TextField {...params} label="Enter Partner Name.." variant="outlined" />}
                                    /> : <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={engdata}
                                        value={selecteng}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(e, newValue) => handleSearchEngChange(newValue)}
                                        onInputChange={(e, newInputValue) => handleInputEngChange(newInputValue)}
                                        renderInput={(params) => <TextField {...params} label="Enter Engineer.." variant="outlined" />}
                                    />}
                                    {errors.selectcsp && <span className="text-danger">{errors.selectcsp}</span>}
                                    {errors.selecteng && <span className="text-danger">{errors.selecteng}</span>}
                                </div>

                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Issue Date  <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        class="form-control"
                                        name="issue_date"
                                        value={formData.issue_date}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split("T")[0]} // Set max to today's date
                                        placeholder="Enter Invoice No."
                                    />
                                    {errors.issue_date && <span className="text-danger">{errors.issue_date}</span>}


                                </div>
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Remark
                                    </label>

                                    <textarea className="form-control"
                                        name="remark"
                                        value={formData.remark}
                                        onChange={handleChange}>

                                    </textarea>



                                </div>

                                {submithide ? null : <div className="">
                                    <button className="btn btn-primary" type="">Submit</button>
                                </div>
                                }

                            </form>



                        </div>

                    </div>
                </div>

                {hidelist ? <div className="col-lg-12">
                    <div className="card mb-3 tab_box">
                        <div
                            className="card-body"
                            style={{ flex: "1 1 auto", padding: "13px 28px" }}
                        >
                            <h5 style={{ fontSize: "15px", fontWeight: "800" }}>ISSUE NO : {localStorage.getItem('issue_no')}</h5>
                            <div className="row align-items-center">
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Spare <span className="text-danger">*</span>
                                    </label>
                                    <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={productdata}
                                        value={selectproduct}
                                        getOptionLabel={(option) =>
                                            option ? `${option.product_code} - ${option.productname}` : ""
                                        }
                                        onChange={(e, newValue) => handleProductSearchChange(newValue)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Enter.." variant="outlined" />
                                        )}
                                        renderOption={(props, option) => (
                                            <li {...props} key={option.id}>
                                                {option.product_code} - {option.productname}
                                            </li>
                                        )}
                                    />


                                    {spareerrors.selectproduct && <span className="text-danger">{spareerrors.selectproduct}</span>}
                                </div>
                                {/* <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Spare <span className="text-danger">*</span>
                                    </label>
                                    <select value={SpareId} name='spare' className="form-control" style={{ fontSize: "14px" }} onChange={(e) => handlespareChange(e.target.value)}>
                                        <option value="" >Select Spare</option>
                                        {spare.map((item) => {
                                            return (

                                                <option value={item.id}>{item.article_description}</option>
                                            )
                                        })}

                                    </select>
                                    {spareerrors.spare && <span className="text-danger">{spareerrors.spare}</span>}
                                </div> */}
                                <div className="mb-3 col-lg-3">
                                    <p></p>
                                    <button type="button" onClick={() => handleAddSpare()} className="btn btn-primary">Add Spare</button>
                                </div>

                                {hide ?
                                    <div className="col-lg-12">
                                        <table className="w-100 table table-striped table-bordered">
                                            <thead>
                                                <th className="py-2" width="20%" scope="col">#</th>
                                                <th className="py-2" width="30%" scope="col">Spare Code</th>
                                                <th className="py-2" width="30%" scope="col">Spare Name</th>
                                                <th className="py-2" width="20%" scope="col">Quantity</th>
                                            </thead>
                                            <tbody>
                                                {selectedspare.map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <td>{index + 1}</td>
                                                            <td>{item.spare_no}</td>
                                                            <td>{item.spare_title}</td>
                                                            <td>
                                                                <div className="">

                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Qty"
                                                                        value={item.quantity || ""} // Bind to `spare_qty`
                                                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                    />

                                                                    {/* Show duplicate error */}
                                                                </div>
                                                            </td>

                                                        </tr>
                                                    )
                                                })}

                                            </tbody>
                                        </table>
                                        <div className="">
                                            <button className="btn btn-primary" onClick={() => handleSpareSend()} type="">Save</button>
                                        </div>

                                    </div>
                                    : null}

                            </div>
                        </div>
                    </div>
                </div> : null}



            </div>}

        </div>
    );
};

export default Outward;
