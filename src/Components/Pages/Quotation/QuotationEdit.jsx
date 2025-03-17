import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { error } from 'jquery';
import { IoArrowBack } from 'react-icons/io5';
import MyDocument8 from '../Reports/MyDocument8';
import { pdf } from '@react-pdf/renderer';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

const QuotationEdit = () => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    const { loaders, axiosInstance } = useAxiosLoader();
    const [spare, setSpare] = useState([])
    const [csp, setCsp] = useState([])
    let { qid } = useParams()

    try {
        qid = qid.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(qid, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        qid = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }

    const navigate = useNavigate()

    const [value, setValue] = useState({
        ticketId: '',
        ticketdate: '',
        quotationNumber: '',
        CustomerName: '',
        state: '',
        city: '',
        assignedEngineer: '',
        status: '',
        customer_id: '',
        ModelNumber: '',
        title: '',
        quantity: '',
        price: '',
        address: '',
        customer_mobile: '',
        customer_email: '',
    })




    async function getquotedetails() {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getquotedetails`, { quotaion_id: qid }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setValue(decryptedData[0]);

            getquotespare(decryptedData[0].quotationNumber)

            getcspformticket(decryptedData[0].ticketId)

        } catch (error) {
            console.error('Error fetching quote details:', error);
        }
    }

    async function getquotespare(quote_id) {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getquotationspare`, { quote_id: quote_id }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setSpare(decryptedData);

        } catch (error) {
            console.error('Error fetching quote details:', error);
        }
    }

    async function getcspformticket(ticketId) {

        axiosInstance.post(`${Base_Url}/getcspformticket`, { ticket_no: ticketId }, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                // Decrypt the response data
                const encryptedData = res.data.encryptedData; // Assuming response contains { encryptedData }
                const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
                const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
                setCsp(decryptedData)
            })
            .catch((err) => {
                console.log(err)
            })
    }



    useEffect(() => {
        getquotedetails()

    }, [])




    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // code for pdf

    async function downloadPDF(id) {
        Blob(value)
    }




    const Blob = async (data) => {

        try {
            const blob = await pdf(<MyDocument8 data={value} spare={spare} csp={csp} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
    };


    const ApproveQuotation = (price) => {

        axios.post(`${Base_Url}/approvequotation`, { Qno: value.quotationNumber, data: spare }, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                alert("Quotation  Approved")
                getquotedetails()
            })
    }

    const handlePriceChange = (index, newPrice) => {
        const updatedSpare = [...spare];
        updatedSpare[index].price = newPrice;
        setSpare(updatedSpare);
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
        pageid: String(45)
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
            {roleaccess > 1 ?<div className="row mt-1 mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">
                            <IoArrowBack onClick={() => navigate(-1)} style={{ fontSize: "25px" }} />
                            <button type="submit" class="btn btn-primary mr-2" style={{ marginLeft: '82%' }} onClick={() => downloadPDF()}>Download Quotation Details </button>
                        </div>
                    </div>
                </div>
            </div> : null}
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body">

                            <div className="row mp0">
                                <h2 className="pname" style={{ fontSize: "20px" }}>Quotation Details:</h2>
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
                                                    <span class="lable">Quotation No:</span>
                                                    &nbsp;<span class="value"><b>{value.quotationNumber}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Customer Name:</span>
                                                    &nbsp;<span class="value"><b>{value.CustomerName}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Ticket ID:</span>
                                                    &nbsp;<span class="value"><b>{value.ticketId}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Ticket Date:</span>
                                                    &nbsp;<span class="value"><b>{formatDate(value.ticketdate)}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Model Number:</span>
                                                    &nbsp;<span class="value"><b>{value.ModelNumber}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Engineer Name:</span>
                                                    &nbsp;<span class="value"><b>{value.assignedEngineer}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Customer Address:</span>
                                                    &nbsp;<span class="value"><b>{value.address}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Mobile Number:</span>
                                                    &nbsp;<span class="value"><b>{value.customer_mobile}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Email:</span>
                                                    &nbsp;<span class="value"><b>{value.customer_email}</b></span>
                                                </li>

                                            </ul>
                                        </div>


                                    </div>
                                </div>
                                <div style={{ paddingBottom: '15px' }}>

                                </div>

                                <div className='row'>

                                    <div className="col-lg-4" style={{ flex: "1 1 auto", }}>
                                        {/* Search Filters */}
                                        <div className="gridbox">

                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Spare Id</th>
                                                        <th>Spare Name</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {spare.map((item, index) => {

                                                        return (
                                                            <tr >
                                                                <td>{index + 1}</td>
                                                                <td>{item.article_code}</td>
                                                                <td>{item.article_description}</td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="serial_no"
                                                                        value={item.quantity}
                                                                        placeholder="Enter Quantity"
                                                                        style={{ fontSize: "14px", width: "100%" }}
                                                                        className='form-control'
                                                                        disabled 
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="price"
                                                                        value={item.price}
                                                                        placeholder="Enter Price"
                                                                        style={{ fontSize: "14px", width: "100%" }}
                                                                        className="form-control"
                                                                        onChange={(e) =>
                                                                            handlePriceChange(index, e.target.value)
                                                                        }
                                                                        disabled={roleaccess > 3 ? false : true}
                                                                    />
                                                                </td>

                                                            </tr>
                                                        )

                                                    })}


                                                </tbody>
                                            </table>

                                            {roleaccess > 3 ?<div>
                                                <button className='btn btn-sm btn-primary float-end' disabled={value.status == 'Approved' ? true : false} onClick={() => ApproveQuotation()}>{value.status == 'Approved' ? 'Approved' : 'Approve quotation'}</button>
                                            </div> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-3 tab_box" style={{ padding: "0px 0px 0px 0px" }}>

                    </div>
                </div>
            </div> : null }
            </div>

    );
};

export default QuotationEdit;
