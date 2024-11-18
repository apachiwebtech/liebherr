import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

export function Complaintlist(params) {
    const [Complaintdata, setComplaintdata] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        cfranchise_id: '',
        password: '',
        email: '',
        mobile_no: '',
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
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const fetchComplaintlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getcomplainlist`);
            setComplaintdata(response.data);
            setFilteredData(response.data); // Set filtered data initially
        } catch (error) {
            console.error('Error fetching Complaintdata:', error);
            setComplaintdata([]);
            setFilteredData([]);
        }
    };

    const fetchFilteredData = async () => {
        try {
            // Create query parameters
            const params = new URLSearchParams();
            if (searchFilters.fromDate) params.append('fromDate', searchFilters.fromDate);
            if (searchFilters.toDate) params.append('toDate', searchFilters.toDate);
            if (searchFilters.customerName) params.append('customerName', searchFilters.customerName);
            if (searchFilters.customerEmail) params.append('customerEmail', searchFilters.customerEmail);
            if (searchFilters.serialNo) params.append('serialNo', searchFilters.serialNo);
            if (searchFilters.productCode) params.append('productCode', searchFilters.productCode);
            if (searchFilters.customerMobile) params.append('customerMobile', searchFilters.customerMobile);
            if (searchFilters.ticketno) params.append('ticketno', searchFilters.ticketno);

            const response = await axios.get(`${Base_Url}/getcomplainlist?${params}`);
            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setFilteredData([]);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        fetchFilteredData(); // Call API with filters
    };

    const resetFilters = () => {
        setSearchFilters({
            fromDate: '',
            toDate: '',
            customerName: ''
        });
        fetchComplaintlist(); // Reset to original data
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

    const navigate = useNavigate();

    return (
        <div className="row mp0">
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        {/* Search Filters */}
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
                                    <label>Complaint No.</label>
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
                                    <label>Customer Name</label>
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
                            
                        </div>

                        {/* second row of filter */}

                        <div className="row mb-3">
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
                            <div className="col-md-3">
                            <div className="form-group">
                                    <label>Serial No</label>
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
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Product Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="productCode"
                                        value={searchFilters.productCode}
                                        placeholder="Search by product code"
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group" style={{ marginTop: '24px' }}>
                                    <button
                                        className="btn btn-primary mr-2"
                                        onClick={applyFilters}
                                    >
                                        Search
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={resetFilters}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Complaint No.</th>
                                    <th>Complaint Date</th>
                                    <th>Customer Name</th>
                                    <th>Product</th>
                                    <th>Age</th>
                                    <th>Assigned Users</th>
                                    <th>Status</th>
                                    <th>Edit</th>
                                    <th>View</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.ticket_no}</td>
                                        <td>{formatDate(item.ticket_date)}</td>
                                        <td>{item.customer_name}</td>
                                        <td>{item.ModelNumber}</td>
                                        <td>{item.ageingdays}</td>
                                        <td>{item.assigned_to}</td>
                                        <td>{item.call_status}</td>
                                        <td>
                                            <button
                                                className='btn'
                                                onClick={() => edit(item.id)}
                                                title="Edit"
                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                            >
                                                <FaPencilAlt />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className='btn'
                                                onClick={() => navigate(`/complaintview/${item.id}`)}
                                                title="View"
                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                        <td>
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
    );
}

export default Complaintlist;