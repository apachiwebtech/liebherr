import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import $ from 'jquery';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import CryptoJS from 'crypto-js';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Grntab from './Grntab';
import { Autocomplete, TextField } from "@mui/material";
import _debounce from 'lodash.debounce';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export function InwardLiebherr(params) {

    const [selectedspare, setselectedSpare] = useState([]);
    const { loaders, axiosInstance } = useAxiosLoader();
    const [open, setOpen] = React.useState(false);
    const [engineer, setEngineer] = useState([])
    const [Grn, setGrn] = useState([]);
    const [article, setarticle] = useState([]);
    const [fullWidth, setFullWidth] = React.useState(true);
    const [maxWidth, setMaxWidth] = React.useState('lg');
    const [errors, setErrors] = useState({});
    const [csptext, setcspText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [cspalldata, setAllData] = useState([]);
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem('licare_code')
    const created_by = localStorage.getItem("licare_code");
    const [items, setItems] = useState(article); // `initialData` is your item list
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [receivecsp, setreciveCsp] = useState(null);
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchgrnListing(page); // Fetch data for the new page
    };
    const [formData, setFormData] = useState({
        received_from: "Liebherr",
        invoice_number: "",
        invoice_date: "",
        invoice_qty: '',
        received_date: '',
        remark: '',
        grn_type: '',
        item_code: '',
        status: ''
    });

    const [searchFilters, setSearchFilters] = useState({
        fromDate: "",
        toDate: "",
        invoice_number: "",
        address_code: "",
        status: ""
    })






    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

    };

    const handleClickOpen = async (Invoice_Number, invoice_date, status) => {

        setFormData((prev) => ({
            ...prev,
            invoice_number: Invoice_Number,
            invoice_date: invoice_date,
            status: status
        }))

        try {
            const data = {
                InvoiceNumber: Invoice_Number,
            };

            const response = await axiosInstance.post(`${Base_Url}/getinvoicegrndetails`, data, {
                headers: {
                    Authorization: token,
                },
            });
            if (response.data) {
                const withquantity = response.data.map(item => {
                    const actual_quantity = 0;
                    const pending_quantity = Number(item.Invoice_qty) - actual_quantity;

                    return {
                        ...item,
                        actual_quantity,
                        pending_quantity
                    };
                });
                setarticle(withquantity);
                setOpen(true);
            }

        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
            setGrn([]);
        }
    };

    const handleClose = () => {
        setOpen(false);

    };


    const fetchCspAll = async () => {

        try {
            const response = await axios.post(`${Base_Url}/getsearchallcsp`, { param: csptext }, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
            setAllData(response.data)
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };



    const fetchgrnListing = async (page) => {
        try {
            const params = new URLSearchParams();
            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size
            params.append('licare_code',licare_code);
            // Add all filters to params if they have values
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const response = await axiosInstance.get(`${Base_Url}/getinwardLiebherr?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            // console.log('API Response:', response.data);
            setGrn(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
            setGrn([]);
            setFilteredData([]);
        }
    };

    const fetchfiltergrnListing = async () => {

        try {
            const params = new URLSearchParams();

            // Add all filters to params
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });

            const response = await axiosInstance.get(`${Base_Url}/getinwardLiebherr?${params}`, {
                headers: {
                    Authorization: token,
                },
            });
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setGrn(decryptedData);
            setFilteredData(decryptedData)
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
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
        fetchfiltergrnListing();
    };

    useEffect(() => {
        fetchgrnListing();
    }, []);

    const exportToExcel = async () => {
        if (!searchFilters.fromDate || !searchFilters.toDate) {
            alert("Please select both From Date and To Date.");
            return;
        }

        try {
            const response = await axiosInstance.get(`${Base_Url}/getinwardLiebherrexcel`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    licare_code: licare_code,
                    fromDate: searchFilters.fromDate,
                    toDate: searchFilters.toDate,
                    invoice_number: searchFilters.invoice_number,
                    address_code: searchFilters.address_code,
                    status: searchFilters.status,
                    page: 1,
                    pageSize: 100000, // Get all data if needed
                }
            });

            const encryptedData = response.data.encryptedData;
            const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey); // Ensure secretKey is defined
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            const decryptedData = JSON.parse(decryptedText);

            const workbook = XLSX.utils.book_new();

            const worksheet = XLSX.utils.json_to_sheet(
                decryptedData.map((item) => ({
                    InvoiceNumber: item.InvoiceNumber,
                    InvoiceDate: item.InvoiceDate ? formatDate(item.InvoiceDate) : '',
                    ReceivedFrom: item.received_from,
                    AddressCode: item.Address_code,
                    OrderNumber: item.Order_Number,
                    ServiceType: item.Service_Type,
                    Status: item.approved,
                    ArticleCode: item.Item_Code,
                    ArticleDescription: item.Item_Description,
                    InvoiceQty: item.Invoice_qty,
                    ReceivedQty: item.actual_received,
                    PendingQty: item.pending_quantity,
                    ReceivedDate: item.received_date ? formatDate(item.received_date) : '',
                    Remark: item.remark,
                    ActionDate: item.created_date ? formatDate(item.created_date) : ''
                }))
            );

            XLSX.utils.book_append_sheet(workbook, worksheet, "InwardLiebherr");
            XLSX.writeFile(workbook, "InwardLiebherr.xlsx");
        } catch (error) {
            console.error('Error fetching InwardLiebherr data:', error.response?.data || error.message);
            setGrn([]);
        }
    };


    const handleActualQtyChange = (index, value) => {
        const updatedSpare = [...article];
        const enteredQty = Number(value);
        const invoiceQty = Number(updatedSpare[index].Invoice_qty);

        if (enteredQty > invoiceQty) {
            return;
        }

        updatedSpare[index].actual_quantity = enteredQty;
        updatedSpare[index].pending_quantity = invoiceQty - enteredQty;

        setarticle(updatedSpare);
    };




    const handleReject = async () => {
        if (formData.received_date) {
            try {

                const data = {
                    remark: formData.remark,
                    received_date: formData.received_date,
                    received_from: formData.received_from,
                    invoice_date: formData.invoice_date,
                    invoice_number: formData.invoice_number,
                    created_by: created_by
                }


                // Send stringified payload to the server
                const response = await axios.post(`${Base_Url}/rejectgrn`, data, {
                    headers: {
                        Authorization: token, // Send token in headers
                    }
                });

                if (response.data) {
                    alert("Rejected successfully!");
                    setFormData({
                        received_date: '',
                        remark: ''
                    })
                    setOpen(false)
                    fetchgrnListing()
                } else {
                    alert("Failed to save data.");
                }
            } catch (error) {
                console.error("Error saving data:", error);
                alert("An error occurred while saving data.");
            }
        } else {
            alert("Received Date Require")
        }

    }


    const handleSubmit = async () => {


        if (formData.received_date && receivecsp) {

            const formInput = new FormData();

            const payload = article.map((item) => ({
                id: String(item.id),
                article_code: item.Item_Code,
                article_desc: item.Item_Description,
                quantity: String(item.Invoice_qty) || String(0),
                remark: formData.remark,
                received_date: formData.received_date,
                received_from: formData.received_from,
                invoice_date: formData.invoice_date,
                invoice_number: formData.invoice_number,
                actual_quantity: item.actual_quantity,
                pending_quantity: item.pending_quantity,
                created_by: receivecsp?.id
            }));

            formInput.append('itemdata', JSON.stringify(payload));
            try {


                const response = await axiosInstance.post(`${Base_Url}/approvegrn `, formInput, {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.data.grn_no) {
                    alert(`GRN Created Successfully . Grn No.${response.data.grn_no}`)
                    setFormData({
                        received_date: '',
                        remark: ''
                    })
                    setOpen(false)
                    fetchgrnListing()
                }

            } catch (error) {
                console.error('Error fetching GRN data:', error.response?.data || error.message);
            }
        } else {
            alert("Received Date Require")
        }


    }
    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };
    const formatDate2 = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
    };
    const Decrypt = (encrypted) => {
        encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
    };

    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const roledata = {
        role: decryptedRole,
        pageid: String(69)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    const handleInputCsp = _debounce((newValue) => {
        console.log(newValue);

        // Update the text state
        setcspText(newValue);

        // Check if newValue is not blank and has more than 4 words

        fetchCspAll();
    }, 100);


    const handleSearchAllChange = (newValue) => {
        setreciveCsp(newValue);
    };

    return (
        <div className="tab-content">
            <Grntab />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 && <div className="row mp0">
                <div className="searchFilter">
                    <div className='m-3'>
                        <div className="row mb-3">
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>From Invoice Date</label>
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
                                    <label>To Invoice Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="toDate"
                                        value={searchFilters.toDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            {/* <div className="col-md-2">
                                <div className="form-group">
                                    <label>Received From</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="received_from"
                                        value={searchFilters.received_from}
                                        placeholder="Search by Received From"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div> */}
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Invoice Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="invoice_number"
                                        value={searchFilters.invoice_number}
                                        placeholder="Search by Invoice Number"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Address Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address_code"
                                        value={searchFilters.address_code}
                                        placeholder="Search by Address Code"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2 ">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className='form-control' name='status' value={searchFilters.status} onChange={handleFilterChange}>
                                        <option value={''}>Select</option>
                                        <option value={'1'}>Approve</option>
                                        <option value={'2'}>Reject</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                <div className='form-group'></div>
                                <div className="form-group">
                                    <button
                                        className="btn btn-primary mx-1"
                                        onClick={exportToExcel}
                                    >
                                        Export to Excel
                                    </button>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={() => applyFilters()}
                                    >
                                        Search
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => window.location.reload()}
                                        style={{ marginLeft: '5px' }}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* second row of filter */}
                        <div className="row mb-3"></div>
                        {/* Table */}
                    </div>
                </div>
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Invoice No</th>
                                            <th width="15%">Invoice Date</th>
                                            <th width="20%">Received From</th>
                                            <th width="15%">Address Code</th>
                                            <th width="10%">Order Number</th>
                                            <th width="10%">Service Type</th>
                                            <th width="10%">Status</th>
                                            <th width="20%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Grn.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={index}>
                                                    <td>{displayIndex}</td>
                                                    <td>{item.InvoiceNumber}</td>
                                                    <td>{formatDate(item.InvoiceDate)}</td>
                                                    <td>Liebherr</td>
                                                    <td>{item.Address_code}</td>
                                                    <td>{item.Order_Number}</td>
                                                    <td>{item.Service_Type}</td>
                                                    <td>  {item.status == '1' ? (
                                                        <p className='text-success' >Approved</p>
                                                    ) : item.status == '2' ? (
                                                        <p className='text-danger' >Rejected</p>

                                                    ) : <p className='text-warning' >Pending</p>}
                                                    </td>
                                                    <td>
                                                        <div className='d-flex'>
                                                            <button
                                                                className='btn'
                                                                onClick={() => {
                                                                    handleClickOpen(item.InvoiceNumber, formatDate2(item.InvoiceDate), item.status)
                                                                }}
                                                                title="Edit"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}

                                        {/* Dialog Box */}
                                        <BootstrapDialog
                                            fullWidth={fullWidth}
                                            maxWidth={maxWidth}
                                            open={open}
                                            onClose={handleClose}
                                        >
                                            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                                                <p>INVOICE NO. {formData.invoice_number}</p>
                                            </DialogTitle>
                                            <IconButton
                                                aria-label="close"
                                                onClick={handleClose}
                                                sx={(theme) => ({
                                                    position: 'absolute',
                                                    right: 8,
                                                    top: 8,
                                                    color: theme.palette.grey[500],
                                                })}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                            <DialogContent >
                                                <div className='row p-3'>


                                                    <div className="mb-3 col-lg-3">
                                                        <label htmlFor="EmailInput" className="input-field">
                                                            Received To  <span className="text-danger">*</span>
                                                        </label>
                                                        <Autocomplete
                                                            size="small"
                                                            disablePortal
                                                            options={cspalldata}
                                                            value={receivecsp}
                                                            getOptionLabel={(option) =>
                                                                option && typeof option === "object"
                                                                    ? `${option.title} - ${option.id}`
                                                                    : ""
                                                            }

                                                            onChange={(e, newValue) => handleSearchAllChange(newValue)}
                                                            onInputChange={(e, newInputValue) => handleInputCsp(newInputValue)}
                                                            renderOption={(props, option) => (
                                                                <li {...props}>
                                                                    {option.title} — {option.id}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Select CSP" variant="outlined" />
                                                            )}
                                                        />

                                                        {errors.receivecsp && <span className="text-danger">{errors.receivecsp}</span>}
                                                        {/* Show duplicate error */}
                                                    </div>
                                                    <div className="mb-3 col-lg-3">
                                                        <label htmlFor="EmailInput" className="input-field">
                                                            Invoice Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="invoice_number"
                                                            value={formData.invoice_number}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Allow only numbers and limit to 9 digits
                                                                if (/^[a-zA-Z0-9]{0,11}$/.test(value)) {
                                                                    handleChange(e);
                                                                }
                                                            }}

                                                            disabled={formData.grn_type == 'With' ? false : true}
                                                            placeholder="Enter Invoice No."
                                                        />
                                                        {errors.invoice_number && <span className="text-danger">{errors.invoice_number}</span>}
                                                        {/* Show duplicate error */}
                                                    </div>
                                                    <div className="mb-3 col-lg-3">
                                                        <label htmlFor="EmailInput" className="input-field">
                                                            Invoice Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            name="invoice_date"
                                                            value={formData.invoice_date}
                                                            onChange={handleChange}
                                                            disabled={formData.grn_type == 'With' ? false : true}
                                                            max={new Date().toISOString().split("T")[0]} // Set max to today's date
                                                            placeholder="Enter Invoice No."
                                                        />
                                                        {errors.invoice_date && <span className="text-danger">{errors.invoice_date}</span>}


                                                    </div>
                                                    <div className="mb-3 col-lg-3">
                                                        <label htmlFor="EmailInput" className="input-field">
                                                            Received Date <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            name="received_date"
                                                            value={formData.received_date}
                                                            onChange={handleChange}
                                                            max={new Date().toISOString().split("T")[0]} // Set max to today's date
                                                            placeholder="Enter Invoice No."
                                                        />
                                                        {errors.received_date && <span className="text-danger">{errors.received_date}</span>}


                                                    </div>

                                                    <div className="mb-3 col-lg-3">
                                                        <label htmlFor="EmailInput" className="input-field">
                                                            Remark
                                                        </label>

                                                        <textarea className="form-control"
                                                            name="remark"
                                                            value={formData.remark}
                                                            onChange={handleChange}>

                                                        </textarea>



                                                    </div>

                                                    <div className="row mb-3">
                                                        <table className="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Article Code</th>
                                                                    <th>Article Description</th>
                                                                    <th>Invoice Qty</th>
                                                                    <th>Received Qty</th>
                                                                    <th>Pending Qty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>

                                                                {article.map((item, index) => {
                                                                    return (
                                                                        <tr key={item.id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{item.Item_Code}</td>
                                                                            <td>{item.Item_Description}</td>
                                                                            <td>{item.Invoice_qty}</td>
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control"
                                                                                    placeholder="Enter Qty"
                                                                                    value={item.actual_quantity || ''}
                                                                                    onChange={(e) => handleActualQtyChange(index, e.target.value)}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control"
                                                                                    placeholder="Enter Qty"
                                                                                    disabled
                                                                                    value={item.pending_quantity || 0}
                                                                                />
                                                                            </td>
                                                                        </tr>

                                                                    )
                                                                })}



                                                            </tbody>
                                                        </table>



                                                    </div>
                                                </div>
                                            </DialogContent>
                                            <DialogActions>
                                                {formData.status != 1 && formData.status != 2 && (
                                                    <>
                                                        {roleaccess > 2 && <Button onClick={(e) => handleSubmit(e)}>
                                                            Approve
                                                        </Button>}
                                                        {roleaccess > 2 && <Button onClick={() => handleReject()}>
                                                            Reject
                                                        </Button>}
                                                    </>
                                                )}


                                            </DialogActions>
                                        </BootstrapDialog>

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
            </div>}

        </div>


    );
}
export default InwardLiebherr;