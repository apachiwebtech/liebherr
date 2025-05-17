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
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export function Stock(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Stockdata, setStockdata] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [Stock, setStock] = React.useState('');
    const licare_code = localStorage.getItem("licare_code");
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchStock(page); // Fetch data for the new page
    };

    const [formData, setFormData] = useState({
        article_code: '',
        created_by: '',
        csp_code: ''
    });

    const [searchFilters, setSearchFilters] = useState({
        product_code: '',
        productname: '',
        csp_code: ''

    });


    const handleClose = () => {
        setOpen(false);
    };

    const fetchStock = async (page) => {
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
            const response = await axiosInstance.get(`${Base_Url}/getallstock?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setStockdata(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Stockdata:', error);
            setStockdata([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getallstock?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setStockdata(decryptedData);
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

        setSearchFilters({
            product_code: '',
            productname: '',
            csp_code: ''
        });
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const exportToExcel = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/downloadstockexcel`, {
                headers: { Authorization: token },
                responseType: 'blob', // Important to handle file
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Stock.xlsx'); // File name
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading Stock Excel:', error);
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
        pageid: String(57)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    const stockEdit = async (csp_code, product_code) => {
        setOpen(true)
        setFormData({
            article_code: product_code,
            created_by: licare_code,
            csp_code: csp_code
        })

    }

    const updateStock = async () => {

        const data = {
            article_code: formData.article_code,
            created_by: formData.created_by,
            csp_code: formData.csp_code,
            stock: Stock
        }

        try {

            const response = await axiosInstance.post(`${Base_Url}/updateadminstock`, data, {
                headers: {
                    Authorization: token,
                },
            });

            if (response) {
                alert("Stock Updated")
                setOpen(false)
                fetchStock()
            }

        } catch (error) {
            console.error('Error fetching Stockdata:', error);
        }

    }



    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <Productsparetabs />

            {roleaccess > 1 ? <div className="row mp0">

                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className="row mb-3">

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
                                            name="product_code"
                                            value={searchFilters.product_code}
                                            placeholder="Search by Article Code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Article Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="productname"
                                            value={searchFilters.productname}
                                            placeholder="Search by Article Description"
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

                                                applyFilters()
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
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">CSP Code</th>
                                            <th width="20%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="20%">Physical Stock</th>
                                            <th width="20%">Total CSP stock</th>
                                            <th width="10%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Stockdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{displayIndex}</td>
                                                    <td>{item.csp_code}</td>
                                                    <td>{item.product_code}</td>
                                                    <td>{item.productname}</td>
                                                    <td>{item.stock_quantity}</td>
                                                    <td>{item.total_stock}</td>
                                                    <td><EditIcon onClick={() => stockEdit(item.csp_code, item.product_code, item.stock_quantity)} /></td>
                                                </tr>
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
                            <Dialog
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">
                                    {"Update Stock"}
                                </DialogTitle>
                                <DialogContent style={{ height: "100px", width: "400px" }}>
                                    <input
                                        type="number"
                                        min={'0'}
                                        className="form-control"
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={updateStock} autoFocus>
                                        Update
                                    </Button>
                                    <Button onClick={handleClose} autoFocus>
                                        Cancel
                                    </Button>
                                </DialogActions>
                            </Dialog>

                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    );
}
