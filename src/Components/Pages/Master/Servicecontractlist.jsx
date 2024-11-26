import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Servicecontracttabs from './Servicecontracttabs';
import Servicecontract from './Servicecontract';


export function Servicecontractlist(params) {

    const [Servicecontractdata, setServicecontractdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        customerMobile: "",
        contractNumber: "",
        contractType: "",
        productName: "",
        serialNumber: "",
        startDate: "",
        endDate: "",
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchServicecontractlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getservicecontractlist`);
            setServicecontractdata(response.data);
        } catch (error) {
            console.error('Error fetching servicecontractdata:', error);
            setServicecontractdata([]);
        }
    };

    const handleChangestatus = (e) => {
        try {
            const dataId = e.target.getAttribute('data-id');

            const response = axios.post(`${Base_Url}/updatestatus`, { dataId: dataId });

        } catch (error) {
            console.error("Error editing user:", error);
        }

    };

    const deleted = async (id) => {
        try {
            // Add confirmation dialog
            const isConfirmed = window.confirm("Are you sure you want to delete?");
            
            // Only proceed with deletion if user clicks "OK"
            if (isConfirmed) {
                const response = await axios.post(`${Base_Url}/deleteservicecontract`, { id });
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestservicecontract/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchServicecontractlist();
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
            <Servicecontracttabs />
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/Servicecontract`}><button className='btn btn-primary'>Add  Service Contract Registration </button></Link>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="2%"> Customer Name</th>
                                        <th width="8%">Contract Number</th>
                                        <th width="8%">Product Name</th>
                                        <th width="10%">Serial Number</th>
                                        <th width="8%">Start Date</th>
                                        <th width="8%">End Date</th>
                                        {/* <th width="8%">Approval Status</th> */}
                                        <th width="8%">Contract Status</th>
                                        <th width="5%">Edit</th>
                                        <th width="5%">View</th>
                                        <th width="5%">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Servicecontractdata.map((item, index) => {
                                        return (
                                            <tr key={item.id}>
                                                <td >{index + 1}</td>
                                                <td >{item.customerName}</td>
                                                <td>{item.contractNumber}</td>
                                                <td >{item.productName}</td>
                                                <td >{item.serialNumber}</td>
                                                <td >{item.startDate}</td>
                                                <td >{item.endDate}</td>
                                                
                                                
                                                  <td >
                                                    <label class="switch">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleChangestatus}
                                                            data-id={item.id}
                                                            checked={item.status === 1}  // Check if status is 1 (checked)
                                                            className="status"
                                                        />


                                                        <span class="slider round"></span>
                                                    </label>

                                                </td> 

                                                <td >
                                                    <Link to={`/Servicecontract/${item.id}`}> <button
                                                        className='btn'
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button></Link>
                                                </td>
                                                 <td >
                                                    <button
                                                        className='btn'
                                                        onClick={() => {
                                                            navigate(`/Servicecontract/${item.id}`)
                                                        }}
                                                        title="View"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                </td> 
                                                <td >
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