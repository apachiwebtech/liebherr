import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


export function EnquiryListing(params) {

    const [enquirydata, setEnquirydata] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    async function getenquirydata(params) {
        axios.get(`${Base_Url}/getenquiry` , {
            headers :{
                Authorization : token
            }
        })
        .then((res) =>{
         setEnquirydata(res.data)
        })
        .catch((err) =>{
         console.log(err)
        })
    }


    useEffect(() =>{
        getenquirydata()
    },[])



    function formatDate(dateStr) {
        const dateObj = new Date(dateStr);

        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();

        return `${day}-${month}-${year}`;
    }


    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/enquiryListing/${encrypted}`)
    };

    return (
        <div className="tab-content">

            <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='my-2'>
                                <button className='btn btn-primary ' onClick={() =>{
                                    navigate('/addenquiry')
                                }}>Add Enquiry</button>
                            </div>


                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Customer Name</th>
                                            <th width="15%">Enquiry Date</th>
                                            <th width="10%">Mobile</th>
                                            <th width="15%">Customer Type</th>
                                            <th width="10%">Enquiry Type</th>
                                            <th width="15%">Priority</th>
                                            <th width="10%">Model Number</th>
                                            <th width="5%">Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enquirydata.map((item, index) => {
                                            // const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td >{index}</td>
                                                    <td>{item.customer_name}</td>
                                                    <td>{formatDate(item.enquiry_date)}</td>
                                                    <td>{item.mobile}</td>
                                                    <td>{item.customer_type}</td>
                                                    <td>{item.enquiry_type}</td>
                                                    <td>{item.priority}</td>
                                                    <td>
                                                        {item.modelnumber}
                                                    </td>
                                                    <td>

                                                        <button
                                                            className='btn'
                                                            onClick={() => sendtoedit(item.id)}
                                                            title="Edit"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                        // disabled={roleaccess > 3 ? false : true}
                                                        >
                                                            <FaPencilAlt />
                                                        </button>

                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <button
                                   
                                        style={{
                                            padding: '8px 15px',
                                            fontSize: '16px',
                                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                            backgroundColor: currentPage <= 1 ? '#ccc' : '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            transition: 'background-color 0.3s',
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        Page {''} of {''}
                                    </span>
                                    <button
                              
                                        style={{
                                            padding: '8px 15px',
                                            fontSize: '16px',
                                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                            backgroundColor: currentPage >= totalPages ? '#ccc' : '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            transition: 'background-color 0.3s',
                                        }}
                                    >
                                        Next
                                    </button>
                                </div> */}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
