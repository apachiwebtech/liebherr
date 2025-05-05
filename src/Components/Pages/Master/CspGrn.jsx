import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import $ from 'jquery';
import { MdOutlineDelete } from "react-icons/md";
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import GrnTab from './GrnTab';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export function CspGrn(params) {


    const { loaders, axiosInstance } = useAxiosLoader();
    const [open, setOpen] = React.useState(false);
    const [engineer, setEngineer] = useState([])
    const [Grn, setGrn] = useState([]);
    const [fullWidth, setFullWidth] = React.useState(true);
    const [maxWidth, setMaxWidth] = React.useState('lg');
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem('licare_code')
    const [msp, setMsp] = useState([])
    const [csp, setCsp] = useState([])
    const [value, setValue] = useState({
        id: "",
        title: "",
        msp: "",
        csp: ""
    })


    const handleClickOpen = (id, title, msp, csp) => {
        setValue({
            id: id,
            title: title,
            msp: msp,
            csp: csp
        })
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setValue({})
    };

    const [searchFilters, setSearchFilters] = useState({
        fromDate: "",
        toDate: "",
        received_from: "",
        invoice_number: "",
        product_code: "",
        product_name: ""
    })

    async function ApproveEng(params) {
        axios.get(`${Base_Url}/getapproveEng`, {
            headers: {
                Authorization: token, // Send token in headers
            }
        })
            .then((res) => {
                console.log(res.data)
                setEngineer(res.data)
            })
    }
    const created_by = localStorage.getItem("licare_code");
    const handleApprove = (id) => {

        const data = {
            eng_id: id,
            approve_by: created_by
        }
        axios.post(`${Base_Url}/finalapproveenginner`, data, {
            headers: {
                Authorization: token
            }
        })
            .then((res) => {
                alert("Engineer Approved")
                ApproveEng()
                setOpen(false)
            })
    }






    const fetchgrnListing = async () => {
        try {
            const data = {
                csp_code: licare_code,
            };


            const response = await axiosInstance.post(`${Base_Url}/getgrnlisting`, data, {
                headers: {
                    Authorization: token,
                },
            });

            // console.log('API Response:', response.data);
            setGrn(response.data);
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
            setGrn([]);
        }
    };

    const fetchfiltergrnListing = async () => {

        try {
            const data = {
                csp_code: licare_code,
                fromDate: searchFilters.fromDate || '',
                toDate: searchFilters.toDate || '',
                invoice_number: searchFilters.invoice_number || '',
            };

            const response = await axiosInstance.post(`${Base_Url}/getgrnlisting `, data, {
                headers: {
                    Authorization: token,
                },
            });

            setGrn(response.data);
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
        }

    };

    useEffect(() => {
        fetchgrnListing();
    }, []); // Memoize fetchgrnListing





    const updategrnstatus = async (grn_no) => {
        const confirm = window.confirm("Are you sure?")

        if (confirm) {
            try {
                const response = await axiosInstance.post(`${Base_Url}/updategrnapprovestatus`, { grn_no: grn_no }, {
                    headers: {
                        Authorization: token,
                    },
                });
                alert(response.data)
                fetchgrnListing()
            } catch (error) {
                console.error('Error fetching Quotationdata:', error);
                setGrn([]);
            }
        }

    };



    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/csp/grnview/${encrypted}`)
    };





    const navigate = useNavigate();

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
        pageid: String(44)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handledelete = (grn_no) => {


        axios.post(`${Base_Url}/deletedgrn`, { grn_no: grn_no }, {
            headers: {
                Authorization: token
            }
        })
        // alert(res.data)
        fetchgrnListing()

    }


    const exportToExcel = () => {

    }
    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };



    return (
        <div className="tab-content">
            <GrnTab />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <div className="row mp0">
                <div className="searchFilter">
                    <div className='m-3'>
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
                            </div>
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
                                    <label>Product Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="product_code"
                                        value={searchFilters.product_code}
                                        placeholder="Search by Product Code"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2 ">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="product_name"
                                        value={searchFilters.product_name}
                                        placeholder="Search by Product Name"
                                        onChange={handleFilterChange}
                                    />
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
                                        onClick={() => fetchfiltergrnListing()}
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
                                            <th width="10%">Order Line Number</th>
                                            <th width="10%">Service Type</th>
                                            <th width="20%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Grn.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.InvoiceNumber}</td>
                                                    <td>{formatDate(item.InvoiceDate)}</td>
                                                    <td>Liebherr</td>
                                                    <td>{item.Address_code}</td>
                                                    <td>{item.Order_Number}</td>
                                                    <td>{item.Order_Line_Number}</td>
                                                    <td>{item.Service_Type}</td>
                                                    <td>
                                                        <div className='d-flex'>
                                                            <button
                                                                className='btn'
                                                                onClick={() => handleClickOpen(item.id, item.title, item.mfranchise_id, item.cfranchise_id)}
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
                                                <p>{value.title}</p>
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
                                                <div className="row mb-3">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Article Code</th>
                                                                <th>Article Description</th>
                                                                <th>Invoice Number</th>
                                                                <th>Invoice Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>

                                                            {engineer.map((item, index) => {
                                                                return (
                                                                    <tr key={item.id}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{item.item_code}</td>
                                                                        <td>{item.item_description}</td>
                                                                        <td>{item.InvoiceNumber}</td>
                                                                        <td>{item.InvoiceDate}</td>
                                                                    </tr>
                                                                )
                                                            })}



                                                        </tbody>
                                                    </table>



                                                </div>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={() => handleApprove(value.id)}>
                                                    Approve
                                                </Button>
                                            </DialogActions>
                                        </BootstrapDialog>

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}
export default CspGrn;