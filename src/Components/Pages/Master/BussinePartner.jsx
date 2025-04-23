import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Channelpartnertabs from './Channelpartnertabs';

export function BussinePartner(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [loading, setLoading] = useState(false);
    const [Feedbackdata, setFeedbackdata] = useState([]);
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem("licare_code");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchFeedBacklist(page); // Fetch data for the new page
    };

    const [formData, setFormData] = useState({
        Bp_code: '',
        partner_name: '',
        email: '',
        mobile_no: '',
        title: '',
        contact_person: '',
        address: '',
        webste: '',
        gstno: '',
        panno: '',
        bankname: '',
        bankacc: '',
        bankifsc: '',
        bankaddress: '',
        Licare_Ac_Id: '',
        licare_code: '',
        // Vendor_Name: '',
        withliebher: '',
        lastworkingdate: '',
        contractactive: '',
        contractexpire: '',
    });
    const [searchFilters, setSearchFilters] = useState({
        Bp_code: '',
        partner_name: '',
        email: '',
        mobile_no: '',
    });

    const fetchFeedBacklist = async (page) => {
        try {
            const params = new URLSearchParams();
            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size
            params.append('licare_code', licare_code); // Page size


            // Add all filters to params if they have values
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const response = await axiosInstance.get(`${Base_Url}/getbussinesspartner?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });

            // Decrypt the response data
            const encryptedData = response.data.encryptedData;
            const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

            setFeedbackdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Feedbackdata:', error);
            setFeedbackdata([]);
            setFilteredData([]);
        } finally {
            setLoading(false);  // Stop loader after data is loaded or in case of error
        }
    };

    const fetchFilteredData = async () => {
        try {
            const params = new URLSearchParams();

            // Add all filters to params
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });

            if (licare_code) {
                params.append('licare_code', licare_code);
            }

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getbussinesspartner?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setFeedbackdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setFilteredData([]);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const applyFilters = () => {
        console.log('Applying filters:', searchFilters); // Debug log
        fetchFilteredData();
    };


    useEffect(() => {
        fetchFeedBacklist();
    }, []);

    // export to excel 
    const exportToExcel = async () => {
        try {
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getbussinesspartner`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1, // Start from the first page
                },
            });
            const allBussinessdata = response.data.data;
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allBussinessdata.map(user => ({

                "Bp Code": user.Bp_code,
                "Title": user.title,
                "Partner name": user.partner_name,
                "Contact person": user.contact_person,
                "Email": user.email,
                "Mobile": user.mobile_no,
                "Address": user.address,
                "Website": user.webste,
                "Gst No": user.gstno,
                "Pan No": user.panno,
                "Bank name": user.bankname,
                "Bank Ac": user.bankacc,
                "Bank IFSC": user.bankifsc,
                "Bank Address": user.bankaddress,
                "Licare Id": user.Licare_Ac_Id,
                "Licare Code": user.Licare_code,
                "Vendor Name": user.Vendor_Name,
                "With Liebherr": user.withliebher,
                "Last Working Date": user.lastworkingdate,
                "Contract Active": user.contractactive,
                "Contract Expire": user.contractexpire,


            })));

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "BussinessPartner");

            // Export the workbook
            XLSX.writeFile(workbook, "BussinessPartner.xlsx");
        } catch (error) {
            console.error("Error exporting data to Excel:", error);
        }
    };

    // export to excel end 

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
        pageid: String(18)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    function formatDate(dateStr) {
        const dateObj = new Date(dateStr);

        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();

        return `${day}-${month}-${year}`;
    }

    return (
        <div className="tab-content">
            <Channelpartnertabs />
            {(loaders || loading) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders || loading} color="#FFFFFF" />
                </div>
            )}

            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className="row mb-3">

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>BP Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="Bp_code"
                                            value={searchFilters.Bp_code}
                                            placeholder="Search by Bp_code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>


                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Partner Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="partner_name"
                                            value={searchFilters.partner_name}
                                            placeholder="Search by Partner Name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="email"
                                            value={searchFilters.email}
                                            placeholder="Search by Email"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Mobile No.</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="mobile_no"
                                            value={searchFilters.mobile_no}
                                            placeholder="Search by Mobile No"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                    <div className="form-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={exportToExcel}
                                        >
                                            Export to Excel
                                        </button>
                                        <button
                                            className="btn btn-primary mr-2"
                                            onClick={applyFilters}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Search
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                window.location.reload()
                                            }}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Reset
                                        </button>
                                        {filteredData.length === 0 && (
                                            <div
                                                style={{
                                                    backgroundColor: '#f8d7da',
                                                    color: '#721c24',
                                                    padding: '5px 10px',
                                                    marginLeft: '10px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #f5c6cb',
                                                    fontSize: '14px',
                                                    display: 'inline-block'
                                                }}
                                            >
                                                No Record Found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="10%">Bp Code</th>
                                            <th width="10%">Title</th>
                                            <th width="10%">Partner name</th>
                                            <th width="10%">Contact person</th>
                                            <th width="10%">Email</th>
                                            <th width="10%">Mobile</th>
                                            <th width="10%">Address</th>
                                            <th width="10%">Web Site</th>
                                            <th width="10%">Gst No</th>
                                            <th width="10%">Pan No</th>
                                            <th width="10%">Bank name</th>
                                            <th width="10%">Bank Ac</th>
                                            <th width="10%">Bank Ifsc</th>
                                            <th width="10%">Bank Address</th>
                                            <th width="10%">Licare Id</th>
                                            <th width="10%">Licare Code</th>
                                            <th width="10%">Vendor Name</th>
                                            <th width="10%">With Liebherr</th>
                                            <th width="10%">Last Working Date</th>
                                            <th width="10%">Contract Active</th>
                                            <th width="10%">Contract Expire</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Feedbackdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td >{displayIndex}</td>
                                                    <td>{item.Bp_code}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.partner_name}</td>
                                                    <td>{item.contact_person}</td>
                                                    <td>{item.email}</td>
                                                    <td>{item.mobile_no}</td>
                                                    <td>{item.address}</td>
                                                    <td>{item.webste}</td>
                                                    <td>{item.gstno}</td>
                                                    <td>{item.panno}</td>
                                                    <td>{item.bankname}</td>
                                                    <td>{item.bankacc}</td>
                                                    <td>{item.bankifsc}</td>
                                                    <td>{item.bankaddress}</td>
                                                    <td>{item.Licare_Ac_Id}</td>
                                                    <td>{item.Licare_code}</td>
                                                    <td>{item.Vendor_Name}</td>
                                                    <td>{item.withliebher}</td>
                                                    <td>{formatDate(item.lastworkingdate)}</td>
                                                    <td>{item.contractactive}</td>
                                                    <td>{formatDate(item.contractexpire)}</td>

                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage <= 1}
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
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage >= totalPages}
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
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    )
}