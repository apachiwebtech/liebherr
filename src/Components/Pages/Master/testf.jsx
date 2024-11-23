import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
        status: '',
        customerID: '',
        
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const fetchComplaintlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getcomplainlist`);
            // Filter out 'Closed' and 'Cancelled' status complaints by default
            const filteredComplaints = response.data.filter(complaint => 
                !['Closed', 'Cancelled'].includes(complaint.call_status)
            );
            setComplaintdata(response.data);
            setFilteredData(filteredComplaints);
        } catch (error) {
            console.error('Error fetching Complaintdata:', error);
            setComplaintdata([]);
            setFilteredData([]);
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
            
            const response = await axios.get(`${Base_Url}/getcomplainlist?${params}`);
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
            customerMobile: '',
            ticketno: '',
            status: '',
            customerID: '',
        });
        fetchComplaintlist(); // Reset to original data
    };

	//  const deleted = async (id) => { 
    //     try {
    //         const response = await axios.post(`${Base_Url}/deleteengineer`, { id });
    //         setFormData({
    //             title: '',
    //             cfranchise_id: ''
    //         })
    //         fetchComplaintlist();
    //     } catch (error) {
    //         console.error('Error deleting user:', error);
    //     }
    // };

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

    const isActionDisabled = (status) => {
        return ['Closed', 'Cancelled'].includes(status);
    };



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
                                    <label>Customer ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="customerID"
                                        value={searchFilters.customerID}
                                        placeholder="Search by customer Id"
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
                           
                            
                        </div>

                        {/* second row of filter */}

                       

                        <div className="row mb-3">

                            <div className="col-md-2">
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
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Model No.</label>
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
                            <div className="col-md-2">
                                <div className="form-group">
                                    <label>Call Status</label>
                                    <select
                                        className="form-control"
                                        name="status"
                                        value={searchFilters.status}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Active Status</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Cancelled">Cancelled</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Quotation">Quotation</option>
                                        <option value="Duplicates">Duplicates</option>
                                    </select>
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

                        {/* No Record Found Message */}
                       

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
                                    {/* <th>Delete</th> */}
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
                                        <td>{item.assigned_name}</td>
                                        <td>{item.call_status}</td>
                                        <td>
                                        <Link to={`/registercomaplaint/${item.ticket_no}`}><button
                                                className='btn'
                                    
                                                disabled={isActionDisabled(item.call_status)}
                                                title={isActionDisabled(item.call_status) ? "Cannot edit closed or cancelled complaints" : "Edit"}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: isActionDisabled(item.call_status) ? 'gray' : 'blue',
                                                    fontSize: '20px',
                                                    cursor: isActionDisabled(item.call_status) ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <FaPencilAlt />
                                            </button></Link>
                                        </td>
                                        <td>
                                        <button
                                                className='btn'
                                                onClick={() => navigate(`/complaintview/${item.id}`)}
                                                title="View"
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: 'blue',
                                                    fontSize: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                        {/* <td>
                                            <button
                                                    className='btn'
                                                    onClick={() => deleted(item.id)}
                                                    title="Delete"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        color: 'red',
                                                        fontSize: '20px'
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
<<<<<<< Updated upstream
import React from "react";
import { Link } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'


const Loginheader = (params) => {
    const redirect = () =>{
        window.location.pathname = '/registercomaplaint'
      }
      return (
    
        <header className="p-3 border-bottom">
          <div className="container-fuild">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
              <a href="/" className="d-flex align-items-center  mb-2 mb-lg-0 mr-5 text-dark text-decoration-none img" >
                <img src={Logo}  />
              </a>
    
              <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ml-5">
    
                <li>
                  <Link className="nav-link   px-2 link-secondary site" to="/" >Dashboard </Link></li>
    
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle site " to="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Master</Link>
                   
    
                  <ul className="dropdown-menu site" aria-labelledby="navbarDropdown">
                    <li >
                      <Link className="dropdown-item" to="/location">Location</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/category">Product Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/Customerlist">End Customer Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/channelpartnertabs">Channel Partner Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/MasterFranchise">Franchise Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/serviceagenttabs">Service Agent Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/callstatuscodetabs">Call Status Code Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/lhiusertabs">LHI User Master</Link></li>
                      <li>
                      <Link className="dropdown-item" to="/servicecontracttabs">Service Contract Registration</Link></li>
                    <li>
                        
                      <Link className="dropdown-item" to="/serviceproducttabs">Service Product Master</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/complainttabs">Complain code, Reason code & Action code</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/ratecardtabs">Rate card Matrix</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/productspare">Product & Spare mapping master</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link to={`/complaintlist`} className="nav-link  site" href="#" id="navbarDropdown" role="button"  aria-expanded="false" >
                    Tickets
                  </Link>
               
                </li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle site " to="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Reports</Link>
                  <ul className="dropdown-menu site" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/complaintreport">Ticket Report</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/claimreport">Claim Report</Link></li>
                  </ul>
                </li>
              </ul>
    
    
    
    
    
              <div className="dropdown text-end">
                <Link className="btn btn-primary newcomplaint" onClick={redirect}>New Ticket</Link>
    
                <a href="#" className="link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" className="rounded-circle" />
                </a>
                <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
                  <li className="dropdown-item" role="button">
                    <Link className="dropdown-item" to="#">New project...</Link></li>
                  <li className="dropdown-item" role="button">
                    <Link className="dropdown-item" to="#">Settings</Link></li>
                  <li className="dropdown-item" role="button">
                    <Link className="dropdown-item" to="#">Profile</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li className="dropdown-item" role="button">
                    <Link className="dropdown-item" to="/login" tabIndex="0">Sign out</Link></li>
                </ul>
              </div>
            </div>
        </div>
    );
}

export default Complaintlist;