import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { error } from 'jquery';
import { IoArrowBack } from 'react-icons/io5';

const Sparedetailpage = () => {

    const token = localStorage.getItem("token"); // Get token from localStorage
    const { loaders, axiosInstance } = useAxiosLoader();
    const [selectedspare, setselectedSpare] = useState([]);
    const [spare, setSpare] = useState([])
    const navigate = useNavigate()
    let { issue_no } = useParams()

    try {
        // Replace custom characters to make the string Base64-compatible
        issue_no = issue_no.replace(/-/g, '+').replace(/_/g, '/');

        // Decrypt the value using CryptoJS
        const bytes = CryptoJS.AES.decrypt(issue_no, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // Assign the decrypted value directly without converting it to an integer
        issue_no = decrypted;
    } catch (error) {
        console.error("Decryption Error:", error.message);
    }




    const [value, setValue] = useState({
        issue_no: '',
        invoice_date: '',
        invoice_no: '',
        status: ''
    })




    async function getgrndetails() {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getissuedetails`, { issue_no: issue_no }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setValue(res.data[0]);



        } catch (error) {
            console.error('Error fetching quote details:', error);
        }
    }

    const fetchsparelist = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getissuesparelist`, { Issue_No: issue_no }, {
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








    useEffect(() => {
        fetchsparelist()
        getgrndetails()

    }, [])



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };


    const handleQuantityChange = (index, value) => {
        const updatedSpare = [...selectedspare];
        updatedSpare[index].quantity = value; // Update `quantity` for the specific item

        // Update `pending_quantity` if actual_received is already defined
        updatedSpare[index].pending_quantity =
            updatedSpare[index].actual_received !== undefined
                ? value - updatedSpare[index].actual_received
                : value;

        setselectedSpare(updatedSpare); // Update the state
    };

    const handleActualQtyChange = (index, value) => {
        const updatedSpare = [...selectedspare];
        updatedSpare[index].actual_received = value; // Update `actual_received` for the specific item

        // Compute and update `pending_quantity`
        updatedSpare[index].pending_quantity = updatedSpare[index].quantity - value;

        setselectedSpare(updatedSpare); // Update the state
    };


    // const handlePendingChange = (index, value) => {

    //     const updatedSpare = [...selectedspare];
    //     updatedSpare[index].pending_quantity = value; // Update `spare_qty` for the specific item
    //     setselectedSpare(updatedSpare); // Update the state

    // };


    const handleSpareSend = async () => {
        try {
            // Map the `spare` array to construct the payload with additional `spare_qty`
            const payload = selectedspare.map((item) => ({
                id: String(item.id),
                article_code: item.spare_no,
                article_title: item.spare_title,
                quantity: String(item.quantity) || String(0),
                actual_received: String(item.actual_received) || String(0),
                pending_quantity: String(item.pending_quantity) || String(0),
                issue_no: value.issue_no
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


    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <div className="row mt-1 mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">
                            <IoArrowBack onClick={() => navigate(-1)} style={{ fontSize: "25px" }} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">

                            <div className="row mp0">
                                <h2 className="pname" style={{ fontSize: "20px" }}>GRN Details:</h2>
                                <hr></hr>
                                <div className="col-lg-12">
                                    <div class="card " style={{ backgroundColor: "#F5F5DC" }}>
                                        <div class="card-head">
                                            <div class="card-head-label" style={{ paddingLeft: "1" }}>
                                                <h3
                                                    class="card-head-title"
                                                    style={{ fontSize: "1.1rem", marginTop: '5px' }}
                                                >

                                                </h3>
                                            </div>
                                        </div>

                                        <div class="card-body" style={{ paddingTop: 0 }}>
                                            <ul
                                                class="list-stats"
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    paddingLeft: 0,
                                                    listStyle: "none",
                                                    margin: 0,
                                                }}
                                            >
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">GRN No:</span>
                                                    &nbsp;<span class="value"><b>{value.issue_no}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Invoice Date:</span>
                                                    &nbsp;<span class="value"><b>{formatDate(value.issue_date)}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Received To:</span>
                                                    &nbsp;<span class="value"><b>{value.lhi_name}</b></span>
                                                </li>

                                            </ul>
                                        </div>


                                    </div>
                                </div>
                                <div style={{ paddingBottom: '15px' }}>
                                    <div className="col-lg-12">
                                        <table className="w-100 table table-striped table-bordered">
                                            <thead>
                                                <th className="py-2" width="5%" scope="col">#</th>
                                                <th className="py-2" width="15%" scope="col">Spare Code</th>
                                                <th className="py-2" width="20%" scope="col">Spare Name</th>
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
                                                                        type="number"
                                                                        className="form-control"
                                                                        placeholder="Enter Qty"
                                                                        disabled={value.status == '1' ? true : false}
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

                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                    <div className="card mb-3 tab_box" style={{ padding: "0px 0px 0px 0px" }}>

                    </div>
                </div>
            </div></div>

    );
};

export default Sparedetailpage;
