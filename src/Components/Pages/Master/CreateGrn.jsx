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
import { useNavigate } from "react-router-dom";


const CreateGrn = () => {


    const [selectedEngineerType, setSelectedEngineerType] = useState("LHI");;
    const [errors, setErrors] = useState({});
    const [spareerrors, setSpareErrors] = useState({});
    const [hide, setHide] = useState(false);
    const [hidelist, setHidelist] = useState(false);
    const [cspdata, setData] = useState([]);
    const [engineerdata, setEngineerdata] = useState([]);
    const [spare, setSpare] = useState([]);
    const [SpareId, setSpareId] = useState([]);
    const [selectedspare, setselectedSpare] = useState([]);
    const [productdata, setProduct] = useState([]);
    const [submithide, setsubmithide] = useState(false);
    const [selectcsp, setselectedCsp] = useState(null);
    const [selectengineer, setselectedEngineer] = useState(null);
    const [csp_no, setcsp_no] = useState(null);
    const [selectproduct, setselectedproduct] = useState(null);
    const [text, setText] = useState("");
    const [producttext, setProductText] = useState("");
    const token = localStorage.getItem("token"); // Get token from localStorage
    const created_by = localStorage.getItem("licare_code"); // Get token from localStorage
    const GRN_NO = localStorage.getItem("grn_no"); // Get token from localStorage
    const [formData, setFormData] = useState({
        received_from: "",
        invoice_number: "",
        invoice_date: "",
        spare: "",
        remark: ''
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

    const fetchengineer = async () => {
        try {
            const response = await axios.post(`${Base_Url}/getsearchengineer` ,{param: text},{
                headers: {
                    Authorization: token, // Send token in headers
                    },
            });
            setEngineerdata(response.data)
        }
            catch (error) {
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
    const fetchsparelist = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getgrnsparelist`, { grn_no: GRN_NO }, {
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

        if (!formData.invoice_date) {
            // Check if the invoice date is empty
            newErrors.invoice_date = "This is required."; // Set error message for invoice_date
        }

        if (!formData.invoice_number) {
            // Check if the invoice number is empty
            newErrors.invoice_number = "This is required."; // Set error message for invoice_no
        }

        // if (!selectcsp || ) {
        //     // Check if the CSP selection is empty
        //     newErrors.selectcsp = "This is required."; // Set error message for selectcsp
        // }

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
                spare_id: SpareId,
                grn_no: localStorage.getItem('grn_no'),
                created_by: created_by
            };

            try {
                const response = await axios.post(`${Base_Url}/addgrnspares`, JSON.stringify(data), {
                    headers: {
                        Authorization: token, // Send token in headers
                        "Content-Type": "application/json", // Explicitly set Content-Type
                        Authorization: token, // Send token in headers
                    },
                });
                setHide(true)
                fetchsparelist()

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
                invoice_number: formData.invoice_number,
                invoice_date: formData.invoice_date,
                csp_no: selectcsp?.id || 'LIEBHERR',
                csp_name: selectcsp?.title || 'LIEBHERR',
                created_by: created_by,
                remark: formData.remark
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
                        setsubmithide(true)
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
                grn_no: localStorage.getItem('grn_no')
            }));


            // Stringify the payload before sending
            const stringifiedPayload = JSON.stringify(payload);

            // Send stringified payload to the server
            const response = await axios.post(`${Base_Url}/updategrnspares`, stringifiedPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token, // Send token in headers
                }
            });


            if (response.status === 200) {
                alert("Data saved successfully!");
                navigate('/csp/grnlisting')
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



        try {
            const response = await axios.get(`${Base_Url}/getSpareParts/${newValue.item_code}`, {
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

    const handleEngineerInputChange = _debounce((newValue) => {
        console.log(newValue);

        setText(newValue);

        fetchengineer();
    },200);


    const handleSearchChange = (newValue) => {
        setselectedCsp(newValue);
        console.log("Selected:", newValue);
    };
    const handleSearchEngineerChange = (newValue) => {
        setselectedEngineer(newValue);
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
                                            onChange={handleEngineerTypeChange}
                                            checked={selectedEngineerType === "LHI"} // Set "checked" dynamically
                                        />
                                        <label className="form-check-label" htmlFor="lhi" style={{ fontSize: "14px" }}>
                                            LHI
                                        </label>
                                    </div>

                                    <div className="form-check me-3">
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
                                    <div className="form-check col-lg-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="engineer"
                                            name="engineer_type"
                                            value="Engineer"
                                            onChange={handleEngineerTypeChange}
                                            checked={selectedEngineerType === "Engineer"} // Set "checked" dynamically
                                        />
                                        <label className="form-check-label" htmlFor="engineer" style={{ fontSize: "14px" }}>
                                            ENGINEER
                                        </label>
                                    </div>

                                </div>


                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Received from <span className="text-danger">*</span>
                                    </label>
                                    {selectedEngineerType === "Franchisee" ? (
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
                                    ) : selectedEngineerType === "Engineer" ? (
                                        <Autocomplete
                                            size="small"
                                            disablePortal
                                            options={engineerdata}
                                            value={selectengineer}
                                            getOptionLabel={(option) => option.title}
                                            onChange={(e, newValue) => handleSearchEngineerChange(newValue)}
                                            onInputChange={(e, newInputValue) => handleInputChange(newInputValue)}
                                            renderInput={(params) => <TextField {...params} label="Enter.." variant="outlined" />}
                                        />
                                    ) : (
                                        <p>Liebherr</p>
                                    )}
                                    {errors.selectcsp && <span className="text-danger">{errors.selectcsp}</span>}

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
                                    {errors.invoice_number && <span className="text-danger">{errors.invoice_number}</span>}
                                    {/* Show duplicate error */}
                                </div>
                                <div className="mb-3 col-lg-3">
                                    <label htmlFor="EmailInput" className="input-field">
                                        Invoice Date  <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="invoice_date"
                                        value={formData.invoice_date}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split("T")[0]} // Set max to today's date
                                        placeholder="Enter Invoice No."
                                    />
                                    {errors.invoice_date && <span className="text-danger">{errors.invoice_date}</span>}


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

                             {submithide ?  null :<div className="">
                                    <button className="btn btn-primary" type="">Submit</button>
                                </div> }  
                            


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
                            <h5 style={{ fontSize: "15px", fontWeight: "800" }}>GRN NO : {localStorage.getItem('grn_no')}</h5>
                            <div className="row align-items-center">
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
                                    {spareerrors.selectproduct && <span className="text-danger">{spareerrors.selectproduct}</span>}
                                </div>
                                <div className="mb-3 col-lg-3">
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
                                </div>
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



            </div>
        </div>
    );
};

export default CreateGrn;
