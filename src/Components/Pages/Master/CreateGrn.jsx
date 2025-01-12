import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
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
import GrnTab from "./GrnTab";
import { Autocomplete, TextField } from "@mui/material";
import _debounce from 'lodash.debounce';


const CreateGrn = () => {



    const [errors, setErrors] = useState({});
    const [hide, setHide] = useState(false);
    const [hidelist, setHidelist] = useState(false);
    const [cspdata, setData] = useState([]);
    const [spare, setSpare] = useState([]);
    const [selectedspare, setselectedSpare] = useState([]);
    const [productdata, setProduct] = useState([]);
    const [selectcsp, setselectedCsp] = useState(null);
    const [csp_no, setcsp_no] = useState(null);
    const [selectproduct, setselectedproduct] = useState(null);
    const [text, setText] = useState("");
    const [producttext, setProductText] = useState("");
    const token = localStorage.getItem("token"); // Get token from localStorage
    const created_by = localStorage.getItem("licare_code"); // Get token from localStorage
    const [formData, setFormData] = useState({
        received_from: "",
        invoice_number: "",
        invoice_date: "",
        spare: ""
    });

    const fetchCsp = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearchcsp`, { param: text }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setData(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
    const fetchproduct = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearchproduct`, { param: producttext }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setProduct(response.data)
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
        if (!formData.title.trim()) {
            // Check if the title is empty
            newErrors.title = "Country Field is required."; // Set error message if title is empty
        }
        return newErrors; // Return the error object
    };

    //handlesubmit form

    const handlesubmit = (e) => {
        e.preventDefault()

        const data = {
            invoice_number: formData.invoice_number,
            invoice_date: formData.invoice_date,
            csp_no: selectcsp.id,
            csp_name: selectcsp.title,
            created_by: created_by
        }

        axios.post(`${Base_Url}/add_grn`, data, {
            headers: {
                Authorization: token, // Send token in headers
            },
        })
            .then((res) => {
                alert(res.data.message)

                if (res.data.grn_no) {
                    localStorage.setItem('grn_no', res.data.grn_no)

                    setHidelist(true)
                }

            })
            .catch((err) => {
                alert(err.response.data.message)
            })
    }

    const handleSpareSend = async () => {
        try {
            // Map the `spare` array to construct the payload with additional `spare_qty`
            const payload = spare.map((item) => ({
                id: String(item.id),
                article_code: item.article_code,
                article_title: item.article_description,
                spare_qty: String(item.spare_qty) || String(0), // Use the updated `spare_qty`, default to 0 if empty
                grn_no: localStorage.getItem('grn_no')
            }));


            // Stringify the payload before sending
            const stringifiedPayload = JSON.stringify(payload);

            // Send stringified payload to the server
            const response = await axios.post(`${Base_Url}/grnspares`, stringifiedPayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Response:", response.data);

            if (response.status === 200) {
                alert("Data saved successfully!");
            } else {
                alert("Failed to save data.");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert("An error occurred while saving data.");
        }
    };

    // Handle change for `spare_qty`
    const handleQuantityChange = (index, value) => {
        const updatedSpare = [...spare];
        updatedSpare[index].spare_qty = value; // Update `spare_qty` for the specific item
        setselectedSpare(updatedSpare); // Update the state
    };


    const handlespareChange = async (article_id) => {

        try {
            const response = await axios.post(`${Base_Url}/getselctedspare`, { article_id: article_id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            const updatedSpare = response.data.map((item) => ({
                ...item,
                spare_qty: "", // Initialize with an empty string or default value
            }));
            setselectedSpare(updatedSpare)
        } catch (error) {
            console.error("Error fetching users:", error);
        }

    }





    //For product

    const handleProductInputChange = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setProductText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchproduct();
    }, 200);


    const handleProductSearchChange = async (newValue) => {
        setselectedproduct(newValue);
        console.log("Selected:", newValue);

        setHide(true)

        try {
            const response = await axios.get(`${Base_Url}/getSpareParts/${newValue.item_description}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
  

            setSpare(response.data); // Update the state
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };




    //For csp 
    const handleInputChange = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchCsp();
    }, 200);


    const handleSearchChange = (newValue) => {
        setselectedCsp(newValue);
        console.log("Selected:", newValue);
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
        pageid: String(1)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    return (
        <div className="tab-content">
            <GrnTab />

            <div className="row mp0">
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
                                            id="lhi"
                                            name="engineer_type"
                                            value="LHI"

                                        />
                                        <label className="form-check-label" htmlFor="lhi" style={{ fontSize: "14px" }}>
                                            LHI
                                        </label>
                                    </div>

                                    <div className="form-check col-lg-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="franchisee"
                                            name="engineer_type"
                                            value="Franchisee"

                                        />
                                        <label className="form-check-label" htmlFor="franchisee" style={{ fontSize: "14px" }}>
                                            Service Partner
                                        </label>
                                    </div>

                                </div>
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Received from <span className="text-danger">*</span>
                                    </label>
                                    <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={cspdata}
                                        value={selectcsp}
                                        getOptionLabel={(option) => option.title}
                                        onChange={(e, newValue) => handleSearchChange(newValue)}
                                        onInputChange={(e, newInputValue) => handleInputChange(newInputValue)}
                                        renderInput={(params) => <TextField {...params} label="Enter.." variant="outlined" />}
                                    />
                                </div>
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Invoice Number  <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="invoice_number"
                                        value={formData.invoice_number}
                                        onChange={handleChange}
                                        placeholder="Enter Invoice No."
                                    />

                                    {/* Show duplicate error */}
                                </div>
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        invoice Date  <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="invoice_date"

                                        value={formData.invoice_date}
                                        onChange={handleChange}
                                        placeholder="Enter Invoice No."
                                    />

                                    {/* Show duplicate error */}
                                </div>

                                <div className="">
                                    <button className="btn btn-primary" type="">Submit</button>
                                </div>


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
                            <h5 style={{fontSize : "15px",fontWeight:"800"}}>GRN NO : {localStorage.getItem('grn_no')}</h5>
                            <div className="row">
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Product <span className="text-danger">*</span>
                                    </label>
                                    <Autocomplete
                                        size="small"
                                        disablePortal
                                        options={productdata}
                                        value={selectproduct}
                                        getOptionLabel={(option) => option.item_description}
                                        onChange={(e, newValue) => handleProductSearchChange(newValue)}
                                        onInputChange={(e, newInputValue) => handleProductInputChange(newInputValue)}
                                        renderInput={(params) => <TextField {...params} label="Enter.." variant="outlined" />}
                                    />
                                </div>
                                <div className="mb-3 col-lg-3">
                                <label htmlFor="EmailInput" className="input-field">
                                        Spare <span className="text-danger">*</span>
                                    </label>
                                    <select value={formData.spare} name='spare' className="form-control" style={{ fontSize: "14px" }} onChange={(e) =>handlespareChange(e.target.value)}>
                                        <option value="" >Select Spare</option>
                                        {spare.map((item) => {
                                            return (

                                                <option value={item.id}>{item.article_description}</option>
                                            )
                                        })}

                                    </select>
                                </div>

                                {hide ?
                                    <div className="col-lg-12">
                                        <table className="w-100 table table-striped table-bordered">
                                            <thead >
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
                                                            <td>{item.article_code}</td>
                                                            <td>{item.article_description}</td>
                                                            <td>
                                                                <div className="">

                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Enter Qty"
                                                                        value={item.spare_qty || ""} // Bind to `spare_qty`
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
                                        <div className="" onClick={() => window.location.reload()}>
                                            <button className="btn btn-primary" type="">Cancel</button>
                                        </div>
                                    </div>
                                    : null}

                            </div>
                        </div>
                    </div>
                </div> : null}



            </div>
        </div>
    );
};

export default CreateGrn;
