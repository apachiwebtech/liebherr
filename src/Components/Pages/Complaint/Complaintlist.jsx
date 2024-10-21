import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

export function Complaintlist(params) {
    const [Complaintdata, setComplaintdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        cfranchise_id: '',
        password: '',
        email: '',
        mobile_no: '',
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchComplaintlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getcomplainlist`);
            setComplaintdata(response.data);
        } catch (error) {
            console.error('Error fetching Complaintdata:', error);
            setComplaintdata([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteengineer`, { id });
            setFormData({
                title: '',
                cfranchise_id: ''
            })
            fetchComplaintlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchComplaintlist();
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

    return (
        <div className="row mp0" >
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        <table id="myTable" className="display">
                            <thead>
                                <tr>
                                    <th >#</th>
                                    <th >Complaint No.</th>
                                    <th >Complaint Date</th>
                                    <th >Customer Name</th>
                                    <th >Product</th>
                                    <th >Age</th>
                                    <th >Assigned Users</th>
                                    <th >Status</th>
                                    <th >Edit</th>
                                    <th >Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* {Complaintdata.map((item, index) => (
                            
                            <tr key={item.id}>
                                    <td >{index + 1}</td>
                                    <td >{item.ticket_no}</td>
                                    <td >{formatDate(item.ticket_date)}</td>
                                    <td >{item.customer_name}</td>
                                    <td >{item.ModelNumber}</td>
                                    <td >{'0'}</td>
                                    <td >{item.assigned_to}</td>
                                    <td >{item.call_status}</td>
                                    <td >
                                    <button
                                        className='btn'
                                        onClick={() => {
                                        // alert(item.id)
                                        edit(item.id)
                                        }}
                                        title="Edit"
                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                    >
                                        <FaPencilAlt />
                                    </button>
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
                         ))} */}


                                {Complaintdata.map((item, index) => {
                                    return (
                                        <tr key={item.id}>
                                            <td >{index + 1}</td>
                                            <td >{item.ticket_no}</td>
                                            <td >{formatDate(item.ticket_date)}</td>
                                            <td >{item.customer_name}</td>
                                            <td >{item.ModelNumber}</td>
                                            <td >{'0'}</td>
                                            <td >{item.assigned_to}</td>
                                            <td >{item.call_status}</td>
                                            <td >
                                                <button
                                                    className='btn'
                                                    onClick={() => {
                                                        // alert(item.id)
                                                        edit(item.id)
                                                    }}
                                                    title="Edit"
                                                    style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                >
                                                    <FaPencilAlt />
                                                </button>
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
    )
}