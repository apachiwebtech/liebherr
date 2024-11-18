import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';

export function Customerlist(params) {
    const [Customerdata, setCustomerdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
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
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletecustomerlist`, { id });
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
            })
            fetchCustomerlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
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
                                <Link to={`/addproduct/:productid`}><button className='btn btn-primary'>Add Customer</button></Link>
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