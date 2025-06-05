import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye, FaFilePdf, FaDownload, FaArrowCircleDown, FaArrowAltCircleDown } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Servicecontracttabs from './Servicecontracttabs';
import Servicecontract from './Servicecontract';
import { SyncLoader } from 'react-spinners';
import { pdf } from '@react-pdf/renderer';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
import AmcCertificate from '../Reports/AmcCertificate';
import EwCertificate from '../Reports/EwCertificate';

export function Servicecontractlist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [excelData, setExcelData] = useState([]);
    const [Servicecontractdata, setServicecontractdata] = useState([]);
    const [loader, setLoader] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [amcvalue, setValue] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const token = localStorage.getItem("token"); // Get token from localStorage
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    let { contractNumber } = useParams()
    

    try {
        contractNumber = contractNumber.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = CryptoJS.AES.decrypt(contractNumber, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        contractNumber = parseInt(decrypted, 10)
    } catch (error) {
        console.log("Error".error)
    }



    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchServicecontractlist(page); // Fetch data for the new page
    };
    const [formData, setFormData] = useState({
        customerName: "",
        customerMobile: "",
        contractNumber: "",
        contractType: "",
        productName: "",
        serialNumber: "",
        startDate: "",
        endDate: "",
    });

    const [searchFilters, setSearchFilters] = useState({
        customerName: '',
        contractNumber: '',
        serialNumber: '',
        productName: '',

    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };


    const fetchServicecontractlist = async (page) => {
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
            const response = await axiosInstance.get(`${Base_Url}/getservicecontractlist?${params.toString()}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setServicecontractdata(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching servicecontractdata:', error);
            setServicecontractdata([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getservicecontractlist?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setServicecontractdata(decryptedData);
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

    const handleChangestatus = async (e) => {
        try {
            const dataId = e.target.getAttribute('data-id');

            const response = await axiosInstance.post(`${Base_Url}/updateservicestatus`, { dataId: dataId }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            fetchServicecontractlist();

        } catch (error) {
            console.error("Error editing user:", error);
        }

    };

    const deleted = async (id) => {

        try {
            // Add confirmation dialog
            const isConfirmed = window.confirm("Are you sure you want to delete?");

            // Only proceed with deletion if user clicks "OK"
            if (isConfirmed) {
                const response = await axiosInstance.post(`${Base_Url}/deleteservicecontract`, { id }, {
                    headers: {
                        Authorization: token, // Send token in headers
                    },
                });
                // window.location.reload();
                fetchServicecontractlist();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const sendtoedit = async (id, view) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/Servicecontract/${encrypted}/${view}`)
    };








    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    useEffect(() => {
        fetchServicecontractlist();
    }, []);



    const navigate = useNavigate()

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Servicecontractdata.map(user => ({

            "Name": user.customerName,
            "MobileNumber": user.customerMobile,
            "ContractNumber": user.contractNumber,
            "ContractType": user.contractType,
            "ProductName": user.productName,
            "SerialNumber": user.serialNumber,
            "StartDate": user.startDate,
            "EndDate": user.endDate,


        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Service Contract Registration");

        // Export the workbook
        XLSX.writeFile(workbook, "ServiceContract.xlsx");
    };

    // export to excel end 


    // import excel start
    const importexcel = (event) => {
        setLoader(true);
        const file = event?.target?.files ? event.target.files[0] : null;

        if (!file) {
            alert("Please upload an Excel file first!");
            setLoader(false);
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                console.log("Sheet Loaded:", sheet);

                const chunkSize = 70000;
                const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                const mapKeys = (obj) => {
                    const keyMapping = {
                        "serial_no": "serialNumber",
                        "product_code": "product_code",
                        "productName": "productName",
                        "customerName": "customerName",
                        "customerID": "customerID",
                        "contractNumber": "contractNumber",
                        "contractType": "contractType",
                        "contract_amt": "contract_amt",
                        "goodwill_month": "goodwill_month",
                        "scheme_name": "scheme_name",
                        "duration": "duration",
                        "status": "status",
                        "startDate": "startDate",
                        "endDate": "endDate",
                        "purchaseDate": "purchaseDate"
                    };

                    return Object.fromEntries(
                        Object.entries(obj).map(([key, value]) => [
                            keyMapping[key] || key.toLowerCase().replace(/\s+/g, "_"),
                            String(value),
                        ])
                    );
                };

                let processedData = [];
                for (let i = 0; i < jsonData.length; i += chunkSize) {
                    const chunk = jsonData.slice(i, i + chunkSize).map(mapKeys);
                    console.log(`Processing chunk ${i / chunkSize + 1}`);
                    processedData.push(...chunk);

                    await new Promise((resolve) => setTimeout(resolve, 10));
                }

                setExcelData(processedData);
                console.log("Processed Data:", processedData);
            } catch (error) {
                console.error("Error processing Excel file:", error);
                alert("An error occurred while processing the file.");
            } finally {
                setLoader(false);
            }
        };

        reader.onerror = () => {
            alert("Failed to read file!");
            setLoader(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const uploadexcel = () => {
        setLoader(true);

        try {
            const jsonData = JSON.stringify(excelData);

            axios.post(`${Base_Url}/uploadserviceexcel`, { jsonData: jsonData }, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    if (res.data) {
                        alert("Uploaded successfully!");
                    }
                    console.log(res);
                })
                .catch((err) => {
                    console.error("Upload error:", err);
                    alert("Error uploading file. Please try again.");
                })
                .finally(() => {
                    setLoader(false);
                });

        } catch (error) {
            console.error("Encryption error:", error);
            alert("Error during encryption.");
            setLoader(false);
        }
    };


    //import excel end 

    async function getamcpdf(contractNum) {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getamcpdf`, { contractNumber: contractNum }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = res.data.encryptedData;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            console.log(decryptedData);

            setValue(decryptedData[0]);
            Blob(decryptedData[0]);
            console.log(decryptedData[0], 'abc');

        } catch (error) {
            console.error('Error fetching amc details:', error);
        }
    }

    async function getewpdf(contractNum) {
        try {
            const res = await axiosInstance.post(`${Base_Url}/getewpdf`, { contractNumber: contractNum }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = res.data.encryptedData;
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            console.log(decryptedData);

            setValue(decryptedData[0]);
            Blob2(decryptedData[0]);

        } catch (error) {
            console.error('Error fetching amc details:', error);
        }
    }



    async function downloadPDF(value) {
        await getamcpdf(value)

    }
    async function downloadPDF2(value) {
        await getewpdf(value)


    }

    const Blob = async (data) => {
        try {
            const blob = await pdf(<AmcCertificate value={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
    };


    const Blob2 = async (data1) => {

        try {

            const blob = await pdf(<EwCertificate value={data1} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
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
        pageid: String(31)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    return (
        <div className="tab-content">
            <Servicecontracttabs />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <div className="row mp0" >
                {roleaccess > 1 ? <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            {roleaccess > 2 ? <div className="p-1 text-right">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate("/Servicecontract")}
                                >
                                    Add Service Contract Registration
                                </button>
                            </div> : null}
                            <div className="row mb-3">

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customerName"
                                            value={searchFilters.customerName}
                                            placeholder="Search by Customer Name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Contract Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contractNumber"
                                            value={searchFilters.contractNumber}
                                            placeholder="Search by Contract Number"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="productName"
                                            value={searchFilters.productName}
                                            placeholder="Search by Product name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Serial Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="serialNumber"
                                            value={searchFilters.serialNumber}
                                            placeholder="Search by serial no"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>


                            </div>
                            <div className="row mb-3">
                                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                    {roleaccess > 2 ? <div className="form-group">
                                        <input type="file" accept=".xlsx, .xls" onChange={importexcel} />
                                        <button className="btn btn-primary" onClick={uploadexcel}
                                            style={{
                                                marginLeft: '-100px',
                                            }}>
                                            Import Service Contract
                                        </button>

                                    </div> : null}
                                    <div className="form-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={exportToExcel}
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
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="15%">Customer Name</th>
                                        <th width="8%">Contract Number</th>
                                        <th width="8%">Contract Type</th>
                                        <th width="8%">Product Name</th>
                                        <th width="10%">Serial Number</th>
                                        <th width="10%">Start Date</th>
                                        <th width="10%">End Date</th>
                                        {roleaccess > 1 ? <th width="5%">AMC Certificate</th> : null}
                                        {roleaccess > 1 ? <th width="5%">Extended Warranty Certificate</th> : null}
                                        {/* <th width="8%">Approval Status</th> */}
                                        {roleaccess > 3 ? <th width="8%">Contract Status</th> : null}
                                        <th width="5%">{roleaccess <= 3 ? "View" : "Edit"}</th>
                                        {/* <th width="5%">View</th> */}
                                        {roleaccess > 4 ? <th width="5%">Delete</th> : null}
                                    </tr>
                                </thead>
                                <tbody>

                                    {Servicecontractdata.map((item, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                        return (
                                            <tr key={item.id}>
                                                <td >{displayIndex}</td>
                                                <td >{item.customerName}</td>
                                                <td>{item.contractNumber}</td>
                                                <td>{item.contractType}</td>
                                                <td >{item.productName}</td>
                                                <td >{item.serialNumber}</td>
                                                <td >{item.startDate && formatDate(item.startDate)}</td>
                                                <td >{item.endDate && formatDate(item.endDate)}</td>
                                                {roleaccess > 1 ? <td >
                                                    <button
                                                        className='btn'
                                                        onClick={() => downloadPDF(item.contractNumber)}
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: '20px' }}

                                                    >
                                                        <FaArrowAltCircleDown />
                                                    </button>
                                                </td> : null}
                                                {roleaccess > 1 ? <td >
                                                    <button
                                                        className='btn'
                                                        onClick={() => downloadPDF2(item.contractNumber)}
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'black', fontSize: '20px' }}

                                                    >
                                                        <FaArrowAltCircleDown />
                                                    </button>
                                                </td> : null}


                                                {roleaccess > 3 ? <td >
                                                    <label class="switch">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleChangestatus}
                                                            data-id={item.id}
                                                            checked={item.status == 'Active' ? 'checked' : ''}
                                                            className="status"
                                                            disabled={roleaccess > 3 ? false : true}
                                                        />


                                                        <span class="slider round"></span>
                                                    </label>

                                                </td> : null}

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


                                                {roleaccess > 4 ? <td >
                                                    <button
                                                        className='btn'
                                                        onClick={() => deleted(item.id)}
                                                        title="Delete"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                                                        disabled={roleaccess > 4 ? false : true}
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
                </div> : null}
            </div>
        </div>
    )
}
