import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


const EnquiryListing = () => {

    const [enquirydata, setEnquirydata] = useState([]);
    const { loaders, axiosInstance } = useAxiosLoader();
    const [loader, setLoader] = useState(false);
    const token = localStorage.getItem("token");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        getenquirydata(page); // Fetch data for the new page
    };
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        enquiry_no: '',
        customer_name: '',
        mobile: '',
        customer_type: '',
        enquiry_type: '',
        priority: '',
        modelnumber: '',
    });
    const [searchFilters, setSearchFilters] = useState({
        enquiry_no: '',
        customer_name: '',
        mobile: '',
        customer_type: '',
        enquiry_type: '',
        priority: '',
        modelnumber: '',
        fromDate: '',
        toDate: '',
        customer_id: '',
        interested: '',
        alt_mobileno: '',
        email: '',
        state: '',
        city: '',
        lead_converted: '',
        mother_branch: '',

    });

    const getenquirydata = async (page) => {
        try {
            const params = new URLSearchParams();
            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size


            // Add all filters to params if they have values
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const response = await axiosInstance.get(`${Base_Url}/getenquiry?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });

            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setEnquirydata(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);

        } catch (error) {
            console.error('Error fetching Quotationdata:', error);
            setEnquirydata([]);
            setFilteredData([]);
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

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getenquiry?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setEnquirydata(decryptedData);
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
        getenquirydata()
    }, [])



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

    // export to excel 

    const exportEnquiryToExcel = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/downloadenquiryexcel`, {
                headers: { Authorization: token },
                responseType: 'blob', // Important to handle file
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Enquiry.xlsx'); // File name
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading Enquiry Excel:', error);
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
        pageid: String(54)
    }
    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);
    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            {(loaders || loader) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders || loader} color="#FFFFFF" />
                </div>
            )}

            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <div className="searchFilter" onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault(); // Prevent form submission if inside a form
                                        applyFilters();
                                    }
                                }}>

                                    <div className="m-3">
                                        {roleaccess > 2 ? <div className='my-2 text-end'>
                                            <button className='btn btn-primary ' onClick={() => {
                                                navigate('/addenquiry')
                                            }}>Add Enquiry</button>
                                        </div> : null}

                                        <div className="row mb-3">

                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>From Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="fromDate"
                                                        value={searchFilters.fromDate}
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>To Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        name="toDate"
                                                        value={searchFilters.toDate}
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>


                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Enquiry No</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="enquiry_no"
                                                        value={searchFilters.enquiry_no}
                                                        placeholder="Search by Enquiry No"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>


                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Customer Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="customer_name"
                                                        value={searchFilters.customer_name}
                                                        placeholder="Search by Customer Name"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Mobile Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="mobile"
                                                        value={searchFilters.mobile}
                                                        placeholder="Search by Mobile Number"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Customer Type</label>
                                                    <select
                                                        className="form-control"
                                                        name="customer_type"
                                                        value={searchFilters.customer_type}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value=""> SELECT</option>
                                                        <option value="Customer">CUSTOMER</option>
                                                        <option value="Dealer">DEALER</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Enquiry Type</label>
                                                    <select
                                                        className="form-control"
                                                        name="enquiry_type"
                                                        value={searchFilters.enquiry_type}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value=""> SELECT</option>
                                                        <option value="Product">PRODUCT</option>
                                                        <option value="Spare Parts">SPARE PARTS</option>
                                                        <option value="Dealership">DEALERSHIP</option>
                                                        <option value="Service Partner">SERVICE PARTNER</option>
                                                        <option value="Others">OTHERS</option>

                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Priority</label>
                                                    <select
                                                        className="form-control"
                                                        name="priority"
                                                        value={searchFilters.priority}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value=""> SELECT</option>
                                                        <option value="Regular">REGULAR</option>
                                                        <option value="High">HIGH</option>
                                                    </select>
                                                </div>
                                            </div>



                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Model Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="modelnumber"
                                                        value={searchFilters.modelnumber}
                                                        placeholder="Search by Model Number"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Customer ID</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="customer_id"
                                                        value={searchFilters.customer_id}
                                                        placeholder="Search by customer Id"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div> */}
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Customer Classification</label>
                                                    <select
                                                        className="form-control"
                                                        name="interested"
                                                        value={searchFilters.interested}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value=""> SELECT</option>
                                                        <option value="Import">Import</option>
                                                        <option value="Consumer">Consumer</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Alternate Mobile</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="alt_mobile"
                                                        value={searchFilters.alt_mobile}
                                                        placeholder="Search by customer mobile"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Customer Email</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="email"
                                                        value={searchFilters.email}
                                                        placeholder="Search by customer email"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Source</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="source"
                                                        value={searchFilters.source}
                                                        placeholder="Search by Source"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>State</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="state"
                                                        value={searchFilters.state}
                                                        placeholder="Search by State"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Lead Converted</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="leadstatus"
                                                        value={searchFilters.leadstatus}
                                                        placeholder="Search by Lead Converted"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>City</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="city"
                                                        value={searchFilters.city}
                                                        placeholder="Search by city"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Liebherr Branch</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="mother_branch"
                                                        value={searchFilters.mother_branch}
                                                        placeholder="Search by Liebherr Branch"
                                                        onChange={handleFilterChange}
                                                    />
                                                </div>
                                            </div> */}




                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">

                                                <div className="form-group">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={exportEnquiryToExcel}
                                                        style={{
                                                            marginLeft: '5px',
                                                        }}
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
                                    </div>
                                </div>





                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th width="10%">Enquiry No.</th>
                                            <th width="15%">Enquiry Date</th>
                                            <th width="15%">Customer Name</th>
                                            <th width="10%">Mobile</th>
                                            <th width="10%">Customer Type</th>
                                            <th width="10%">Enquiry Type</th>
                                            <th width="5%">Priority</th>
                                            <th width="10%">Model Number</th>
                                            <th width="10%">Lead Status</th>
                                            <th width="5%">{roleaccess <= 3 ? "View" : "Edit"}</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enquirydata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{displayIndex}</td>
                                                    <td >{item.enquiry_no}</td>
                                                    <td>{formatDate(item.enquiry_date)}</td>
                                                    <td>{item.customer_name}</td>
                                                    <td>{item.mobile}</td>
                                                    <td>{item.customer_type}</td>
                                                    <td>{item.enquiry_type}</td>
                                                    <td>{item.priority}</td>
                                                    <td>
                                                        {item.modelnumber}
                                                    </td>
                                                    <td>
                                                        {item.leadstatus}
                                                    </td>
                                                    <td>
                                                        {roleaccess > 3 ? (
                                                            <button
                                                                className='btn'
                                                                onClick={() => sendtoedit(item.id, 0)}
                                                                title="Edit"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        ) : roleaccess <= 3 ? (
                                                            <button
                                                                className='btn'
                                                                onClick={() => sendtoedit(item.id, 1)}
                                                                title="View"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        ) : null}
                                                    </td>

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
    );
};
export default EnquiryListing;
