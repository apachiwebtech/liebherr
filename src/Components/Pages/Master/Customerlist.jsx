import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


export function Customerlist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Customerdata, setCustomerdata] = useState([]);
    const token = localStorage.getItem("token");
    const [isEdit, setIsEdit] = useState(false);
    const [filteredData, setFilteredData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchCustomerlist(page); // Fetch data for the new page
    };



    const [formData, setFormData] = useState({
        customer_fname: '',
        customer_lname: '',
        customer_type: '',
        customer_classification: '',
        mobileno: '',
        dateofbirth: '',
        email: '',
        alt_mobileno: '',
        anniversary_date: '',
        salutation: ''


    });

    const [searchFilters, setSearchFilters] = useState({
        customer_fname: '',
        customer_id: '',
        customer_type: '',
        customer_lname: '',
        mobileno: '',
        email: '',

    });




    const fetchCustomerlist = async (page) => {
        try {
            // Initialize URLSearchParams for query parameters
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

            // Make the API call with query parameters and headers
            const response = await axiosInstance.get(`${Base_Url}/getcustomerlist?${params.toString()}`, {
                headers: {
                    Authorization: token,
                }
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            // Update state with data and total record count
            setCustomerdata(decryptedData);
            setFilteredData(decryptedData);

            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);

        } catch (error) {
            console.error('Error fetching Customerdata:', error);
            setCustomerdata([]);
            setFilteredData([]);
        }
    };





    useEffect(() => {
        fetchCustomerlist()

    }, [])



    const deleted = async (id) => {
        const confirm = window.confirm("Are you sure you want to delete ?");

        if (confirm) {
            try {
                const response = await axiosInstance.post(`${Base_Url}/deletecustomer`, { id }, {
                    headers: {
                        Authorization: token,
                    },
                });
                setFormData({
                    customer_fname: '',
                    customer_lname: '',
                    customer_type: '',
                    customer_classification: '',
                    mobileno: '',
                    dateofbirth: '',
                    email: '',
                    alt_mobileno: '',
                    anniversary_date: '',
                    salutation: ''
                })
                fetchCustomerlist();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
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

            const response = await axiosInstance.get(`${Base_Url}/getcustomerlist?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setCustomerdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setFilteredData([]);
        }
    };




    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('Filter changed:', name, value); // Debug log
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        console.log('Applying filters:', searchFilters); // Debug log
        fetchFilteredData();
    };

    const resetFilters = () => {
        setSearchFilters({
            customer_fname: '',
            customer_id: '',
            customer_type: '',
            customer_lname: '',
            mobileno: '',
            email: '',

        });
        fetchCustomerlist(); // Reset to original data
    };

    const edit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/Customer/${encrypted}`)
    };


    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };



    const navigate = useNavigate()

    // export to excel 
    const exportToExcel = async () => {
        try {
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getcustomerlist`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1, // Start from the first page
                },
            });
            const decryptedData = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
            const allCustomerData = JSON.parse(decryptedData);

            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allCustomerData.map(user => ({
                "Salutation": user.salutation,
                "CustomerName": user.customer_fname + (user.customer_lname ? ' ' + user.customer_lname : ''),
                "customerID": user.customer_id,
                "CustomerType": user.customer_type,
                "CustomerClassification": user.customer_classification,
                "MobileNumber": user.mobileno,
                "Email": user.email,
                "Address": user.address,
                "Country": user.country_name,
                "Region": user.region_name,
                "State": user.geostate_name,
                "City": user.geocity_name,
                "District": user.district_name,
                "Pincode": user.pincode,
                "CCperson": user.cc_person,
                "CCNumber": user.ccnumber,
                "ModelNumber": user.ModelNumber,
                "SerialNumber": user.serial_no,
                "ModelName": user.Modelname,
                "PurchaseDate": user.purchase_date,
                "WarrantyStartDate": user.warranty_sdate,
                "WarrantyEndDate": user.warranty_edate,
                "Invoicedate": user.InvoiceDate,
                "InvoiceNumber": user.InvoiceNumber,
                "Short_model_no": user.Short_model_no,
                "SerialStatus": user.SerialStatus,
                "Notes": user.Notes,
                "BranchName": user.BranchName,
                "CurrentAccountStatus": user.CurrentAccountStatus,
                "SalesDealer": user.SalesDealer,
                "SubDealer": user.SubDealer,


            })));

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Customer");

            // Export the workbook
            XLSX.writeFile(workbook, "Customer.xlsx");
        } catch (error) {
            console.error("Error exporting data to Excel:", error);
        }
    };

    const exportCustomerToExcel = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/downloadcustomerexcel`, {
                headers: { Authorization: token },
                responseType: 'blob', // Important to handle file
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Customer.xlsx'); // File name
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading Customer Excel:', error);
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
        pageid: String(14)
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
            <Endcustomertabs />
            {roleaccess > 1 ? <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            {/* <div className='p-1 text-right'>
                                <Link to={`/Customer`}><button className='btn btn-primary'>Add Customer</button></Link>
                            </div> */}

                            <div className="row mb-3">

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customer_id"
                                            value={searchFilters.customer_id}
                                            placeholder="Search by customer_id"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Type</label>
                                        <select

                                            className="form-select"
                                            name="customer_type"
                                            value={searchFilters.customer_type}
                                            placeholder="Search by customer Type"
                                            onChange={handleFilterChange}
                                        >
                                            <option value="selected">Select Customer Type</option>
                                            <option value="END CUSTOMER">END CUSTOMER</option>
                                            <option value="DISPLAY / EVENTS">DISPLAY / EVENTS</option>
                                            <option value="SERVICE PARTNER">SERVICE PARTNER</option>
                                            <option value="WAREHOUSE">WAREHOUSE</option>
                                            <option value="LHI DISPLAY/WH">LHI DISPLAY/WH</option>
                                            <option value="SUB-DEALER">SUB-DEALER</option>

                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customer_fname"
                                            value={searchFilters.customer_fname}
                                            placeholder="Search by customer name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                {/* <div className="col-md-2">
                                        <div className="form-group">
                                            <label>Customer Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="customer_lname"
                                                value={searchFilters.customer_lname}
                                                placeholder="Search by Customer Last name"
                                                onChange={handleFilterChange}
                                            />
                                        </div>
                                    </div>
                                    */}

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Mobile</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="mobileno"
                                            value={searchFilters.mobileno}
                                            placeholder="Search by customer mobile"
                                            onChange={handleFilterChange}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            minLength="10"
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
                                        <label>Serial No</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="serial_no"
                                            value={searchFilters.serial_no}
                                            placeholder="Search by  serial_no"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>


                            </div>
                            <div className="row mb-3">
                                {/* Buttons and message at the far-right corner */}
                                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                    <div className="form-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={exportCustomerToExcel}
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

                            <table className="table" id="example">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="10%">Customer ID</th>
                                        <th width="7%">Name</th>
                                        {/* <th width="8%">Customer Last Name</th> */}
                                        <th width="10%">Customer Type</th>
                                        <th width="10%">Mobile Number</th>
                                        <th width="15%">Customer Classification</th>
                                        <th width="20%">Customer Email</th>

                                        <th width="15%">Add Location</th>
                                        <th width="10%">Add Product</th>
                                        <th width="5%">{roleaccess <= 3 ? "View" : "Edit"}</th>
                                        {roleaccess > 4 ? <th width="5%">Delete</th> : null}
                                    </tr>
                                </thead>
                                <tbody>

                                    {Customerdata.map((item, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                        return (
                                            <tr key={item.id}>
                                                <td >{displayIndex}</td>
                                                <td >{item.customer_id}</td>
                                                <td >{item.customer_fname}</td>
                                                {/* <td >{item.customer_lname}</td> */}
                                                <td >{item.customer_type}</td>
                                                <td >{item.mobileno}</td>
                                                <td >{item.customer_classification}</td>
                                                <td >{item.email}</td>

                                                <td>
                                                    {roleaccess > 3 ? (
                                                        <Link to={`/Customerlocation/${item.customer_id}`}>
                                                            <button style={{ backgroundColor: '#0D6EFD', color: "white" }} className='btn'
                                                                onClick={() => {
                                                                    navigate(`/Customerlocation/${item.customer_id}`)
                                                                }}>Add</button>

                                                        </Link>
                                                    ) : roleaccess <= 3 ? (
                                                        <Link to={`/Customerlocation/${item.customer_id}`}>
                                                            <button style={{ backgroundColor: '#0D6EFD', color: "white" }} className='btn'
                                                                onClick={() => {
                                                                    navigate(`/Customerlocation/${item.customer_id}`)
                                                                }}>View</button>

                                                        </Link>
                                                    ) : null}
                                                </td>
                                                <td>
                                                    {roleaccess > 3 ? (
                                                        <Link to={`/uniqueproduct/${item.customer_id}`}>
                                                            <button style={{ backgroundColor: '#0D6EFD', color: 'white' }} className='btn'
                                                                onClick={() => {
                                                                    navigate(`/uniqueproduct/${item.customer_id}`)
                                                                }}>Add</button>

                                                        </Link>
                                                    ) : roleaccess <= 3 ? (
                                                        <Link to={`/uniqueproduct/${item.customer_id}`}>
                                                            <button style={{ backgroundColor: '#0D6EFD', color: 'white' }} className='btn'
                                                                onClick={() => {
                                                                    navigate(`/uniqueproduct/${item.customer_id}`)
                                                                }}>View</button>

                                                        </Link>
                                                    ) : null}
                                                </td>
                                                <td>
                                                    {roleaccess > 3 ? (
                                                        <button
                                                            className='btn'
                                                            onClick={() => edit(item.id, 0)}
                                                            title="Edit"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                    ) : roleaccess <= 3 ? (
                                                        <button
                                                            className='btn'
                                                            onClick={() => edit(item.id, 1)}
                                                            title="View"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    ) : null}
                                                </td>


                                                {roleaccess > 4 ? <td style={{ padding: '0px', textAlign: 'center' }}>
                                                    <button
                                                        className='btn'
                                                        onClick={() => deleted(item.id)}
                                                        title="Delete"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td> : null}
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
            </div> : null}
        </div>
    )
}
