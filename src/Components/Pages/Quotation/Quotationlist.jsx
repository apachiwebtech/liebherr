import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
 
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

export function Quotationlist(params) {
    const [Quotationdata, setQuotationdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        ticketId: '',
        customer: '',
        spareId: '',
        ModelNumber: '',
        title: '',
        quantity: '',
        price: '',
    });

    const fetchQuotationlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getquotationlist`,{
                headers: {
                    Authorization: token,
                },
            });
            setQuotationdata(response.data);
        } catch (error) {
            console.error('Error fetching Quotationdata:', error);
            setQuotationdata([]);
        }
    };

    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletequotationlist`, { id }, {
                headers: {
                    Authorization: token,
                },
            });
            setFormData({
                ticketId: '',
                customer: '',
                spareId: '',
                ModelNumber: '',
                title: '',
                quantity: '',
                price: '',
            });
            fetchQuotationlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestquotationlist/${id}`, {
                headers: {
                    Authorization: token,
                },
            });
            setFormData(response.data);
            setIsEdit(true);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };

    useEffect(() => {
        fetchQuotationlist();
    }, []);

    useEffect(() => {
        if (Quotationdata.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: true,
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
    }, [Quotationdata]);

    const navigate = useNavigate();

    return (
        <div className="tab-content">
            
            <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                            <table id="example" className="table table-striped">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Ticket ID</th>
                                        <th width="8%">Customer ID</th>
                                        <th width="20%">Spare ID</th>
                                        <th width="15%">ModelNumber</th>
                                        <th width="20%">Title</th>
                                        <th width="10%">Quantity</th>
                                        <th width="15%">Price</th>
                                        <th width="10%">Edit</th>
                                        <th width="10%">Delete</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {Quotationdata.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.ticketId}</td>
                                            <td>{item.customerId}</td>
                                            <td>{item.spareId}</td>
                                            <td>{item.ModelNumber}</td>
                                            <td>{item.title}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price}</td>
                                            
                                            <td>
                                                <Link to={`/addproduct/${item.id}`}>
                                                    <button
                                                        className='btn'
                                                        onClick={() => edit(item.id)}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                </Link>
                                            </td>
                                            <td style={{ padding: '0px', textAlign: 'center' }}>
                                                <button
                                                    className='btn'
                                                    onClick={() => deleted(item.id)}
                                                    title="Delete"
                                                    style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                                                >
                                                    <FaTrash />
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
            </div>
        </div>
    );
}
