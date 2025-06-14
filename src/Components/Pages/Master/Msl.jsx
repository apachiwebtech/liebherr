import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Productsparetabs from './Productsparetabs';
import $ from 'jquery';
import Grntab from '../Grn/Grntab';

export function Msl(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Msl, setMslData] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const licare_code = localStorage.getItem("licare_code");
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchMsl(page); // Fetch data for the new page
    };
    const [formData, setFormData] = useState({
        msp_name: '',
        msp_code: '',
        csp_code: '',
        csp_name: '',
        item: '',
        item_description: '',
        stock: '',



    });

    const [searchFilters, setSearchFilters] = useState({
        msp_code: '',
        item: '',
        csp_code: ''


    });

    const fetchMsl = async (page) => {
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

            const response = await axiosInstance.get(`${Base_Url}/getmsl?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setMslData(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Msl:', error);
            setMslData([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getmsl?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setMslData(decryptedData);
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
        fetchMsl();
    }, []);

    const navigate = useNavigate()

    const sendtoedit = async (id, view) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/addmsl/${encrypted}/${view}`)
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
        pageid: String(58)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    const importexcel = (event) => {
        // If triggered by file input
        const file = event?.target?.files ? event.target.files[0] : null;

        // If triggered by button click, use the file uploaded
        if (!file) {
            alert("Please upload an Excel file first!");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
            setExcelData(jsonData);
            console.log("Excel Data Imported:", jsonData);
        };

        reader.readAsBinaryString(file);
    };

    const uploadexcel = () => {
        const transformData = (data) => {
            return data.map((item) => {
                return Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [key, value !== null ? String(value) : ""])
                );
            });
        };

        const jsonData = transformData(excelData);

        const formData = new FormData();
        formData.append("excelData", JSON.stringify(jsonData));  // Assuming backend accepts JSON string
        formData.append("created_by", localStorage.getItem("licare_code"));

        axiosInstance.post(`${Base_Url}/uplaodmslexcel`, formData, {
            headers: {
                Authorization: token,
                // DO NOT manually set 'Content-Type' when using FormData.
            },
        })
            .then((res) => {
                if (res.data) {
                    alert("Uploaded");
                }
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    };


    const exportToExcel = async () => {
        try {

            const params = new URLSearchParams();

            // Add filters
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });

            // Add pagination for full export
            params.append("pageSize", totalCount);
            params.append("page", 1);

            const response = await axiosInstance.get(`${Base_Url}/getmslexcel?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });
            const decryptedData = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
            const allMslData = JSON.parse(decryptedData);
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(
                allMslData.map((item) => ({
                    MspCode: item.msp_code,
                    MspName: item.msp_name,
                    CspName: item.csp_name,
                    CspCode: item.csp_code,
                    ArticleCode: item.item,
                    ArticleDescription: item.item_description,
                    TotalCSPStock: item.stock_quantity,
                    MslStock: item.stock,
                }))
            );

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Msl");

            // Export the workbook
            XLSX.writeFile(workbook, "Msl.xlsx");
        } catch (error) {
            console.error('Error fetching Msl data:', error.response?.data || error.message);
        }
    };





    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <Grntab />

            {roleaccess > 1 ? <div className="row mp0">

                <div className=" col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className="row mb-3">

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Msp code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="msp_code"
                                            value={searchFilters.msp_code}
                                            placeholder="Search by Msp Code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Csp Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="csp_code"
                                            value={searchFilters.csp_code}
                                            placeholder="Search by Csp Code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Article Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="item"
                                            value={searchFilters.item}
                                            placeholder="Search by Article Code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>



                            </div>
                            <div className="row  mb-3">
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

                            <div className='gridbox'>
                                <table id="example" className="table">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="10%">Msp Code</th>
                                            <th width="15%">Msp Name</th>
                                            <th width="10%">Csp Code</th>
                                            <th width="15%">Csp Name</th>
                                            <th width="10%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="10%"> Msl Stock</th>
                                           {roleaccess > 3 ? <th widht="10%">Edit</th> :null}

                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Msl.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{displayIndex}</td>
                                                    <td>{item.msp_code}</td>
                                                    <td>{item.msp_name}</td>
                                                    <td>{item.csp_code}</td>
                                                    <td>{item.csp_name}</td>
                                                    <td>{item.item}</td>
                                                    <td>{item.item_description}</td>
                                                    <td>{item.stock}</td>
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
                                                        ) : null}
                                                    </td>                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                            </div>
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
    );
}
