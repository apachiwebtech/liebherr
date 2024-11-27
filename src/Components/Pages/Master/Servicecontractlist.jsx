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
    const [filteredData, setFilteredData] = useState([]);
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

    const [searchFilters, setSearchFilters] = useState({
        customerName: '',
        contractNumber: '',
        serialNumber: '',
        productName:'',      

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
            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching servicecontractdata:', error);
            setServicecontractdata([]);
            setFilteredData([]);
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

            const response = await axios.get(`${Base_Url}/getservicecontractlist?${params}`);
            setServicecontractdata(response.data);
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
         customerName:'',
         contractNumber:'',
         productName:'',
         serialNumber:'',

        });
        fetchServicecontractlist(); // Reset to original data
    };

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    useEffect(() => {
        fetchServicecontractlist();
    }, []);

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
                            <div className="row mb-3">

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customerName"
                                            value={searchFilters.customerName}
                                            placeholder="Search by Customer Name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Contract Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contractNumber"
                                            value={searchFilters.contractNumber}
                                            placeholder="Search by Contract Number"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="productName"
                                            value={searchFilters.productName}
                                            placeholder="Search by Product name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label>Serial Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="serialNumber"
                                            value={searchFilters.serialNumber}
                                            placeholder="Search by serial no"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>


                            </div>
                            <div className="row mb-3">
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
                                        <th width="15%"> Customer Name</th>
                                        <th width="8%">Contract Number</th>
                                        <th width="8%">Product Name</th>
                                        <th width="10%">Serial Number</th>
                                        <th width="10%">Start Date</th>
                                        <th width="10%">End Date</th>
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
                                                <td >{formatDate(item.startDate)}</td>
                                                <td >{formatDate(item.endDate)}</td>


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