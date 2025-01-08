import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
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

export function Enquirylist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Enquirydata, setEnquirydata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_address: '',
        customer_mobile: '',
        customer_email: '',
        
    });

    const fetchEnquirylist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getenquirylist`, {
                headers: {
                    Authorization: token,
                },
            });
            setEnquirydata(response.data);
        } catch (error) {
            console.error('Error fetching Enquirydata:', error);
            setEnquirydata([]);
        }
    };

  

    const sendtoedit = async (id) => {
        id = id.toString()
        let  encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/enquiry/${encrypted}`)
    };

    useEffect(() => {
        fetchEnquirylist();
    }, []);

    useEffect(() => {
        if (Enquirydata.length > 0) {
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
    }, [Enquirydata]);

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

    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
           {roleaccess > 1 ?   <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="7%"> Name</th>
                                            <th width="10%">Mobile Number</th>
                                            <th width="8%">Email</th>
                                            <th width="15%">address</th>
                                            <th width="10%">Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Enquirydata.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.customer_name}</td>
                                                <td>{item.customer_mobile}</td>
                                                <td>{item.customer_email}</td>
                                                <td>{item.customer_address}</td>
                          
                                                <td>

                                                    <button
                                                        className='btn'
                                                        onClick={() => sendtoedit(item.id)}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                        disabled={roleaccess > 3 ? false : true}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>

                                                </td>
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
    );
}
