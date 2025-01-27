import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useNavigate, useParams } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { error } from 'jquery';
import { IoArrowBack } from 'react-icons/io5';
import MyDocument8 from  '../Reports/MyDocument8';
import { pdf } from '@react-pdf/renderer';

const QuotationEdit = () => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    const { loaders, axiosInstance } = useAxiosLoader();
    const [spare, setSpare] = useState([])
    const [data, setData] = useState([])
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
        mobileno: '',
        email: '',
    })




    async function getquotedetails() {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getquotedetails`, { quotaion_id: qid }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setValue(res.data[0]);

            getquotespare(res.data[0].quotationNumber)



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
            setSpare(res.data);

        } catch (error) {
            console.error('Error fetching quote details:', error);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValue((prev) => ({
            ...prev,
            [name]: value, // Dynamically update the field based on the input's name
        }));
    };


    useEffect(() => {
        getquotedetails()

    }, [])


    const handleupdatedata = (e) => {
        e.preventDefault()

        const data = {
            quantity: value.quantity,
            price: value.price,
            status: value.status,
            qid: qid
        }

        axiosInstance.post(`${Base_Url}/updatequotation`, data, {
            headers: {
                Authorization: token, // Send token in headers
            },
        })
            .then((res) => {
                alert("Updated Successfully..")
                navigate('/quotationlist')
            })

    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // code for pdf 

    async function downloadPDF(id) {


        axios.post(`${Base_Url }/getprintinfo`, { id: id })
          .then((res) => {
            console.log(res.data[0], "DDD")
            setData(res.data[0])
    
            Blob(res.data[0])
    
          })
          .catch((err) => {
            console.log(err)
          })
      }

      
  const Blob = async (data) => {

    try {
   const blob = await pdf(<MyDocument8 data={data} />).toBlob();
      const url = URL.createObjectURL(blob);      
      window.open(url);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
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
                            <button type="submit" class="btn btn-primary mr-2"  style={{marginLeft:'82%'}} onClick={() => downloadPDF()}>Download Quotation Details </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mp0">
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
                                                    &nbsp;<span class="value"><b>{value.mobileno}</b></span>
                                                </li>
                                                <li class="py-1" style={{ flex: "1 1 33.33%", padding: "10px" }}>
                                                    <span class="lable">Email:</span>
                                                    &nbsp;<span class="value"><b>{value.email}</b></span>
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
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="serial_no"
                                                                        value={item.price}
                                                                        placeholder="Enter Quantity"
                                                                        style={{ fontSize: "14px", width: "100%" }}
                                                                    />
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
                    </div>
                    <div className="card mb-3 tab_box" style={{ padding: "0px 0px 0px 0px" }}>

                    </div>
                </div>
            </div></div>

    );
};

export default QuotationEdit;
