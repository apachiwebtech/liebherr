import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';

export function Customerlist(params) {
    const [Customerdata, setCustomerdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
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
        fromDate: '',
        toDate: '',
        customerName: '',
        customerEmail: '',
        serialNo: '',
        productCode: '',
        customerMobile: '',
        ticketno: '',
        status: '',
        customerID: '',

    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchCustomerlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getcustomerlist`);
            setCustomerdata(response.data);
        } catch (error) {
            console.error('Error fetching Customerdata:', error);
            setCustomerdata([]);
            setFilteredData([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletecustomer`, { id });
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

            const response = await axios.get(`${Base_Url}/getcustomerlist?${params}`);
            setFilteredData(response.data);
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
            fromDate: '',
            toDate: '',
            customerName: '',
            customerEmail: '',
            serialNo: '',
            productCode: '',
          
        });
        fetchCustomerlist(); // Reset to original data
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestcustomerlist/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchCustomerlist();
        
    }, []);

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    useEffect(() => {
        const $ = window.$; // Access jQuery
        $(document).ready(function () {
            $('#myTable').DataTable();
        });
        return () => {
            $('#myTable').DataTable().destroy();
        };
    }, []);

    const navigate = useNavigate()

    return (
        <div className="tab-content">
            <Endcustomertabs />
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/Customer`}><button className='btn btn-primary'>Add Customer</button></Link>
                            </div>
                            <div className="row mb-3">
                           
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Ticket No.</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="ticketno"
                                        value={searchFilters.ticketno}
                                        placeholder="Search by complaint no"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Customer Type</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customertype"
                                        value={searchFilters.customertype}
                                        placeholder="Search by customer Id"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Customer First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customerName"
                                        value={searchFilters.customerName}
                                        placeholder="Search by customer name"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Customer Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="serialNo"
                                        value={searchFilters.serialNo}
                                        placeholder="Search by serial no"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>


                        </div>

                        {/* second row of filter */}



                        <div className="row mb-3">

                           
                           
                            

                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Customer Mobile</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customerMobile"
                                        value={searchFilters.customerMobile}
                                        placeholder="Search by customer mobile"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Customer Email</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customerEmail"
                                        value={searchFilters.customerEmail}
                                        placeholder="Search by customer email"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            {/* Buttons and message at the far-right corner */}
                            <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                <div className="form-group">
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={applyFilters}
                                    >
                                        Search
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={resetFilters}
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
                                        <th width="7%">Customer First Name</th>
                                        <th width="8%">Customer Last Name</th>
                                        <th width="10%">Customer Type</th>
                                        <th width="10%">Cutomer Mobile Number</th>
                                        <th width="15%">Customer Classification</th>
                                        <th width="20%">Customer Email</th>
                                        <th width="15%">Add Location</th>
                                        <th width="10%">Add Unique Product</th>
                                        <th width="5%">Edit</th>
                                        <th width="5%">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Customerdata.map((item, index) => {
                                        return (
                                            <tr key={item.id}>
                                                <td >{index + 1}</td>
                                                <td >{item.customer_fname}</td>
                                                <td >{item.customer_lname}</td>
                                                <td >{item.customer_type}</td>
                                                <td >{item.mobileno}</td>
                                                <td >{item.customer_classification}</td>
                                                <td >{item.email}</td>
                                                <td>
                                                    <Link to={`/Customerlocation/${item.id}`}>
                                                        <button  style={{ backgroundColor: '#0D6EFD',color:"white" }} className='btn'
                                                            onClick={() => {
                                                                navigate(`/Customerlocation/${item.id}`)
                                                            }}>Add</button>

                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link to={`/uniqueproduct/${item.id}`}>
                                                        <button  style={{ backgroundColor: '#0D6EFD',color:'white' }} className='btn' 
                                                            onClick={() => {
                                                                navigate(`/uniqueproduct/${item.id}`)
                                                            }}>Add</button>

                                                    </Link>
                                                </td>

                                                <td >
                                                    <Link to={`/Customer/${item.id}`}> <button
                                                        className='btn'
                                                        onClick={() => {
                                                            // alert(item.id)
                                                            edit(item.id)
                                                        }}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button></Link>
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
                                        )
                                    })}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}