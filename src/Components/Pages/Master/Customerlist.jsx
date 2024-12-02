import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Endcustomertabs from './Endcustomertabs';



export function Customerlist(params) {
    const [Customerdata, setCustomerdata] = useState([]);
    const token = localStorage.getItem("token");
    const [isEdit, setIsEdit] = useState(false);
    const [filteredData, setFilteredData] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchCustomerlist(page); // Fetch data for the new page
    };



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
        customer_fname: '',
        customer_id: '',
        customer_type: '',
        customer_lname: '',
        mobileno: '',
        email: '',

    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };


    const fetchCustomerlist = async (page) => {
        try {
            const response = await axios.get(`${Base_Url}/getcustomerlist`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    // You can add any additional filter parameters here if needed
                    page: page, // current page number
                    pageSize: pageSize, // page size
                },
            });
    
            // Update state with data and total record count
            setCustomerdata(response.data.data);
            setFilteredData(response.data.data);
    
            // You can store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
    
        } catch (error) {
            console.error('Error fetching Customerdata:', error);
            setCustomerdata([]);
            setFilteredData([]);
        }
    };
    


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletecustomer`, { id }, {
                headers: {
                    Authorization: token,
                },
            });
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

            const response = await axios.get(`${Base_Url}/getcustomerlist?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setCustomerdata(response.data.data);
            setFilteredData(response.data.data);
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
            customer_fname: '',
            customer_id: '',
            customer_type: '',
            customer_lname: '',
            mobileno: '',
            email: '',

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



    const navigate = useNavigate()

    return (
        <div className="tab-content">
            <Endcustomertabs />
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            {/* <div className='p-1 text-right'>
                                <Link to={`/Customer`}><button className='btn btn-primary'>Add Customer</button></Link>
                            </div> */}
                            <div className="row mb-3">

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customer_id"
                                            value={searchFilters.customer_id}
                                            placeholder="Search by customer_id"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Type</label>
                                        <select

                                            className="form-select"
                                            name="customer_type"
                                            value={searchFilters.customer_type}
                                            placeholder="Search by customer Type"
                                            onChange={handleFilterChange}
                                        >
                                            <option value="selected">Select Customer Type</option>
                                            <option value="EndCustomer">EndCustomer</option>
                                            <option value="Sales Dealer WH/Display">Sales Dealer WH/Display</option>
                                            <option value=" Service Partner">Service Partner</option>
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Lhidisplay">LHI Display/WH</option>
                                            <option value="Sub-Dealer">Sub-Dealer</option>

                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="customer_fname"
                                            value={searchFilters.customer_fname}
                                            placeholder="Search by customer name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                {/* <div className="col-md-2">
                                        <div className="form-group">
                                            <label>Customer Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="customer_lname"
                                                value={searchFilters.customer_lname}
                                                placeholder="Search by Customer Last name"
                                                onChange={handleFilterChange}
                                            />
                                        </div>
                                    </div>
                                    */}

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Mobile</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="mobileno"
                                            value={searchFilters.mobileno}
                                            placeholder="Search by customer mobile"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="email"
                                            value={searchFilters.email}
                                            placeholder="Search by customer email"
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

                            <table className="table" id="example">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="10%">Customer ID</th>
                                        <th width="7%">Name</th>
                                        {/* <th width="8%">Customer Last Name</th> */}
                                        <th width="10%">Customer Type</th>
                                        <th width="10%">Mobile Number</th>
                                        <th width="15%">Customer Classification</th>
                                        <th width="20%">Customer Email</th>
                                        
                                        <th width="15%">Add Location</th>
                                        <th width="10%">Add Product</th>
                                        <th width="5%">Edit</th>
                                        <th width="5%">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Customerdata.map((item, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1; 
                                        return (
                                            <tr key={item.id}>
                                                <td >{displayIndex}</td>
                                                <td >{item.customer_id}</td>
                                                <td >{item.customer_fname}</td>
                                                {/* <td >{item.customer_lname}</td> */}
                                                <td >{item.customer_type}</td>
                                                <td >{item.mobileno}</td>
                                                <td >{item.customer_classification}</td>
                                                <td >{item.email}</td>
                                                
                                                <td>
                                                    <Link to={`/Customerlocation/${item.customer_id}`}>
                                                        <button style={{ backgroundColor: '#0D6EFD', color: "white" }} className='btn'
                                                            onClick={() => {
                                                                navigate(`/Customerlocation/${item.customer_id}`)
                                                            }}>Add</button>

                                                    </Link>
                                                </td>
                                                <td>
                                                 <Link to={`/uniqueproduct/${item.customer_id}`}>
                                                        <button style={{ backgroundColor: '#0D6EFD', color: 'white' }} className='btn'
                                                            onClick={() => {
                                                                navigate(`/uniqueproduct/${item.customer_id}`)
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
                        
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
    <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{
            padding: '8px 15px',
            fontSize: '16px',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            backgroundColor: currentPage <= 1 ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            transition: 'background-color 0.3s',
        }}
    >
        Previous
    </button>
    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
        Page {currentPage} of {totalPages}
    </span>
    <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{
            padding: '8px 15px',
            fontSize: '16px',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            backgroundColor: currentPage >= totalPages ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            transition: 'background-color 0.3s',
        }}
    >
        Next
    </button>
</div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}