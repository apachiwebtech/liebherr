import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { MdOutlineDelete } from "react-icons/md";
// DataTables Responsive Extension (JS and CSS for Bootstrap 4)
import 'datatables.net-responsive';
import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css';
// DataTables Fixed Columns Extension
import 'datatables.net-fixedcolumns';
import 'datatables.net-fixedcolumns-bs4/css/fixedColumns.bootstrap4.min.css';
// DataTables Fixed Header Extension
import 'datatables.net-fixedheader';
// DataTables Buttons Extension
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4/css/buttons.bootstrap4.min.css';
import 'datatables.net-buttons/js/buttons.html5.min.js';
// DataTables KeyTable Extension
import 'datatables.net-keytable';
// DataTables Select Extension
import 'datatables.net-select';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import GrnTab from './GrnTab';
import GrnMspTab from './GrnMspTab';

export function GrnMspList(params) {


    const { loaders, axiosInstance } = useAxiosLoader();
    const [Grn, setGrn] = useState([]);
    const [Grnnew, setnewgrn] = useState([]);
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem('licare_code')

    const [searchFilters, setSearchFilters] = useState({
        fromDate: "",
        toDate: "",
        received_from: "",
        invoice_number: "",
        product_code: "",
        product_name: ""
    })



    const fetchgrnListing = async () => {
        try {
            const data = {
                csp_code: licare_code,
            };


            const response = await axiosInstance.post(`${Base_Url}/getgrnmsplist`, data, {
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
                received_from: searchFilters.received_from || '',
                invoice_number: searchFilters.invoice_number || '',
                product_code: searchFilters.product_code || '',
                product_name: searchFilters.product_name || ''
            };

            const response = await axiosInstance.post(`${Base_Url}/getgrnmsplist`, data, {
                headers: {
                    Authorization: token,
                },
            });
            setGrn(response.data)

        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
        }

    };

    useEffect(() => {
        fetchgrnListing();
    }, []); // Memoize fetchgrnListing





    const updategrnstatus = async (grn_no , eng_code) => {
        const confirm = window.confirm("Are you sure?")

        if (confirm) {
            try {
                const response = await axiosInstance.post(`${Base_Url}/updategrnapprovestatus`, { grn_no: grn_no, licare_code: licare_code ,eng_code  :eng_code }, {
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



    useEffect(() => {
        if (Grn.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: false,
                info: true,
                lengthChange: false,
                autoWidth: false,
                responsive: true,
                fixedHeader: true,
                fixedColumns: {
                    left: 5,
                },
                keys: true,
                select: true,
                dom: '<"d-flex justify-content-between"<"table-title"><"search-box"f>>t<"d-flex justify-content-between"ip>',
                language: {
                    search: '', // Remove the "Search:" label
                    searchPlaceholder: 'Search...', // Add placeholder text
                },

            });

            // Cleanup: Destroy DataTable instance before reinitializing when Quotationdata changes
            return () => {
                table.destroy();
            };
        }
    }, [Grn]);

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
    return (
        <div className="tab-content">
            <GrnMspTab />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <div className="row mp0">

                <div className="searchFilter" >

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



                            <div className="col-md-12 d-flex justify-content-end align-items-center mt-3 "  >
                                <div className=' form-group'>

                                </div>
                                <div className="form-group ">
                                    <button
                                        className="btn btn-primary mx-1"
                                        // onClick={exportToExcel}
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
                                        onClick={() => {
                                            window.location.reload()
                                        }}
                                        style={{
                                            marginLeft: '5px',
                                        }}
                                    >
                                        Reset
                                    </button>
                                 
                                </div>
                            </div>


                        </div>

                        <div className="row mb-3">
                        </div>


                        {/* Table */}
                    </div>
                </div>
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='table-responsive'>
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Grn_No</th>
                                            <th width="10%">Received From</th>
                                            <th width="15%">Invoice No</th>
                                            <th width="15%">Invoice Date</th>
                                            <th width="10%">Spare No</th>
                                            <th width="10%">Spare Title</th>
                                             <th width="10%">Spare Quantity</th>
                                            <th width="20%">Status</th>

                                        </tr>
                                    </thead>
                                    <tbody>


                                        {Grn.map((item, index) => {


                                            return (

                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.grn_no}</td>
                                                    <td>{item.csp_name}</td>
                                                    <td>{item.invoice_no}</td>
                                                    <td>
                                                        {new Date(item.invoice_date).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                        })}
                                                    </td>
                                                    <td>{item.spare_no}</td>
                                                    <td>{item.spare_title}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>
                                                        {item.status == '1' ? (
                                                            "Approved"
                                                        ) : item.status == '2' ? (
                                                            "Rejected"
                                                        ) : (
                                                            <button className='btn btn-success' onClick={() => updategrnstatus(item.grn_no , item.csp_code)}>
                                                                Approve
                                                            </button>
                                                        )}
                                                    </td>




                                                </tr>
                                            )

                                        })}


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
