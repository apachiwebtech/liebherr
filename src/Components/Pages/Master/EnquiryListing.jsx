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
        navigate(`/quotation/${encrypted}`)
    };

    return (
        <div className="tab-content">

            <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='my-2'>
                                <button className='btn btn-primary' onClick={() =>{
                                    navigate('/addenquiry')
                                }}>Add Enquiry</button>
                            </div>


                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="13%">Quotation Number</th>
                                            <th width="7%">Ticket No.</th>
                                            <th width="10%">Ticket Date</th>
                                            <th width="20%">Engineer</th>
                                            <th width="10%">Customer Name</th>
                                            <th width="15%">ModelNumber</th>
                                            <th width="10%">Status</th>
                                            <th width="10%">Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enquirydata.map((item, index) => {
                                            // const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td >{index}</td>
                                                    <td>{item.quotationNumber}</td>
                                                    <td>{item.ticketId}</td>
                                                    <td>{formatDate(item.ticketdate)}</td>
                                                    <td>{item.assignedEngineer}</td>
                                                    <td>{item.CustomerName}</td>
                                                    <td>{item.ModelNumber}</td>
                                                    <td style={{ padding: '0px', textAlign: 'center' }}>
                                                        {item.status}
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
