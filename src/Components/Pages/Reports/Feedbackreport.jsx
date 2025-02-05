import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

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

export function FeedBackreport(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Feedbackdata, setFeedbackdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        customer_id: '',
        ticket_no: '',
        email: '',
        rating1: '',
        remark: '',
        rating2: '',


    });

    const fetchFeedBacklist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getfeedbacklist`, {
                headers: {
                    Authorization: token,
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setFeedbackdata(decryptedData);
        } catch (error) {
            console.error('Error fetching Feedbackdata:', error);
            setFeedbackdata([]);
        }
    };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        Navigate(`/feedbackreportview/${encrypted}`)
    };

    useEffect(() => {
        fetchFeedBacklist();
    }, []);

    useEffect(() => {
        if (Feedbackdata.length > 0) {
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
    }, [Feedbackdata]);
    const navigate = useNavigate();

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Feedbackdata.map(user => ({
            "Customer ID": user.customer_id,
            "Ticket Number": user.ticket_no,
            "Email": user.email,
            "Rating 1": user.rating1,
            "Rating 2": user.rating2,
            "Remarks": user.remark, // Add fields you want to export
        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "FeedBack Report");

        // Export the workbook
        XLSX.writeFile(workbook, "FeedBack_Report.xlsx");
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
        pageid: String(1)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    return (
        <div className="tab-content">
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <button
                                    className="btn btn-primary"
                                    onClick={exportToExcel}
                                >
                                    Export to Excel
                                </button>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="10%">Customer Id</th>
                                            <th width="10%">Ticket Number</th>
                                            <th width="10%">Email</th>
                                            <th width="10%">Rating 1</th>
                                            <th width="10%">Rating 2</th>
                                            <th width="10%">Remark</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Feedbackdata.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.customer_id}</td>
                                                <td>{item.ticket_no}</td>
                                                <td>{item.email}</td>
                                                <td>{item.rating1}</td>
                                                <td>{item.rating2}</td>
                                                <td>{item.remark}</td>
                                                {/*                                                 
                                                       <td>
       
                                                           <button
                                                               className='btn'
                                                               onClick={() => sendtoedit(item.id)}
                                                               title="Edit"
                                                               style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                               disabled={roleaccess > 3 ? false : true}
                                                           >
                                                               <FaEye />
                                                           </button>
       
                                                       </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    )
}