import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
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

export function Complaintlist(params) {

    const [Complaintdata, setComplaintdata] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token"); // Get token from localStorage

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);


    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchComplaintlist(page); // Fetch data for the new page
    };

    const [formData, setFormData] = useState({
        title: '',
        cfranchise_id: '',
        password: '',
        email: '',
        mobile_no: '',
        Priority: '',
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
        csp: '',
        msp: '',
        mode_of_contact: '',
        customer_class: '',
        upcoming :''

    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };

    const fetchComplaintlist = async (page) => {



        try {
            const response = await axios.get(`${Base_Url}/getcomplainlist`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
                params: {
                    // You can add any additional filter parameters here if needed
                    page: page, // current page number
                    pageSize: pageSize, // page size
                },
            }
            );
            // Filter out 'Closed' and 'Cancelled' status complaints by default
            const filteredComplaints = response.data.data.filter(complaint =>
                !['Cancelled'].includes(complaint.call_status)
            );

            console.log(filteredComplaints)
            setComplaintdata(response.data.data);
            setFilteredData(filteredComplaints);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Ticketdata:', error);
            setComplaintdata([]);
            setFilteredData([]);
            navigate('/login')
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

            const response = await axios.get(`${Base_Url}/getcomplainlist?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
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
            csp: '',
            msp: '',
            mode_of_contact: '',
            customer_class: '',
            upcoming:''
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
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
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
    useEffect(() => {
        if (filteredData.length > 0) {
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

            // Cleanup: Destroy DataTable instance before reinitializing when Productdata changes
            return () => {
                table.destroy();
            };
        }
    }, [filteredData]);

  



    return (
        <div className="row mp0">

            <div className="searchFilter">

                <div className='m-3'>

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
                                    placeholder="Search by ticket no"
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
                                    placeholder="Search by model no"
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
                                    <option value=""> All</option>
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
                        {/* <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
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
                            </div> */}
                    </div>

                    {/* Third row of filter */}

                    <div className="row mb-3">

                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Master Service Partner</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="msp"
                                    value={searchFilters.msp}
                                    placeholder="Search by Msp"
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Child Service partner</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="csp"
                                    value={searchFilters.csp}
                                    placeholder="Search by Csp"
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Call Category</label>
                                <select
                                    className="form-control"
                                    name="mode_of_contact"
                                    value={searchFilters.mode_of_contact}
                                    onChange={handleFilterChange}
                                >
                                    <option value=""> SELECT</option>
                                    <option value="Call">Call</option>
                                    <option value="SMS">SMS</option>
                                    <option value="Email">Email</option>
                                    <option value="In Person">InPerson</option>
                                </select>
                            </div>
                        </div>


                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Customer Classification</label>
                                <select
                                    className="form-control"
                                    name="customer_class"
                                    value={searchFilters.customer_class}
                                    onChange={handleFilterChange}
                                >
                                    <option value=""> SELECT</option>
                                    <option value="Import">Import</option>
                                    <option value="India">India</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="form-group">
                                <label>Upcoming tickets</label>
                                <select
                                    className="form-control"
                                    name="upcoming"
                                    value={searchFilters.upcoming}
                                    onChange={handleFilterChange}
                                >
                                    <option value=""> SELECT</option>
                                    <option value="upcoming">Yes</option>
                                    <option value="current">no</option>
                                </select>
                            </div>
                        </div>

                        {/* <div className="col-md-3">
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
                            </div> */}

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
                </div>
            </div>

            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        {/* Search Filters */}




                        <div className="gridbox">

                            <table className="table">
                                <thead>
                                    <tr >
                                        <th>#</th>
                                        <th>Ticket No.</th>
                                        <th>Ticket Date</th>
                                        <th>Customer Name</th>
                                        <th>Model No</th>
                                        <th>Serial No</th>
                                        <th>Age</th>
                                        <th>Assigned Users</th>
                                        <th>Status</th>
                                        <th>Call Priority</th>
                                        <th>Edit</th>
                                        <th>View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1;  // Adjusted index for pagination
                                        const rowStyle = {
                                            backgroundColor: item.call_priority == "HIGH" ? "#d4edda" : item.call_priority == "REGULAR" ? "#transparent" : "transparent",
                                        };
                                        console.log("Style:", rowStyle); // Add this line
                                        return (
                                            <tr key={item.id} >
                                                <td style={rowStyle}>{displayIndex}</td>  {/* Use displayIndex for correct pagination */}
                                                <td style={rowStyle}>{item.ticket_no}</td>
                                                <td style={rowStyle}>{formatDate(item.ticket_date)}</td>
                                                <td style={rowStyle}>{item.customer_name}</td>
                                                <td style={rowStyle}>{item.ModelNumber}</td>
                                                <td style={rowStyle}>{item.serial_no}</td>
                                                <td style={rowStyle}>{item.ageingdays}</td>
                                                <td style={rowStyle}>{item.assigned_to}</td>
                                                <td style={rowStyle}>{item.call_status}</td>
                                                <td style={rowStyle}>{item.call_priority}</td>
                                                <td style={rowStyle}>
                                                    <button
                                                        className='btn'
                                                        onClick={() => navigate(`/registercomaplaint/${item.ticket_no}`)}
                                                        disabled={isActionDisabled(item.call_status)}
                                                        title={isActionDisabled(item.call_status) ? "Cannot edit closed or cancelled ticket" : "Edit"}
                                                        style={{
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                            color: isActionDisabled(item.call_status) ? 'gray' : 'blue',
                                                            fontSize: '20px',
                                                            cursor: isActionDisabled(item.call_status) ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                </td>
                                                <td style={rowStyle}>
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
                                            </tr>
                                        );
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
    );
}

export default Complaintlist;