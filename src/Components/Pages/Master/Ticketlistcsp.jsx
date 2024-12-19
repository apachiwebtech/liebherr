import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';

const Ticketlistcsp = (params) => {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Complaintdata, setComplaintdata] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const token = localStorage.getItem("token"); // Get token from localStorage

    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage
    const licare_code = localStorage.getItem("licare_code");

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

        csp: '',
        msp: '',
        mode_of_contact: '',
        customer_class: '',

    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
    };


    const fetchComplaintlist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getcomplainlistcsp?licare_code=${licare_code}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
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

            params.append('licare_code', licare_code);

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getcomplainlistcsp?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });
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

            csp: '',
            msp: '',
            mode_of_contact: '',
            customer_class: '',
        });
        fetchComplaintlist(); // Reset to original data
    };

    //  const deleted = async (id) => {
    //     try {
    //         const response = await axiosInstance.post(`${Base_Url}/deleteengineer`, { id });
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
            const response = await axiosInstance.get(`${Base_Url}/requestengineer/${id}`, {
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


    const addInTab = (ticket_no, ticket_id) => {
        // Retrieve the existing array of ticket numbers, or initialize as an empty array
        const prevTickets = JSON.parse(localStorage.getItem('tabticket')) || [];

        // Check if the ticket already exists in the array
        const isTicketExists = prevTickets.some(
            (ticket) => ticket.ticket_id === ticket_id
        );

        // Add the current ticket number to the array only if it doesn't already exist
        if (!isTicketExists) {
            prevTickets.push({
                ticket_id: ticket_id,
                ticket_no: ticket_no,
            });

            // Store the updated array back in localStorage
            localStorage.setItem('tabticket', JSON.stringify(prevTickets));
        }
    };




    return (
        <div className="row mp0">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        {/* Search Filters */}

                        <div className='searchFilter'>
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
                                            <option value="">All</option>
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
                        </div>



                        {/* No Record Found Message */}


                        {/* Table */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Ticket No.</th>
                                    <th>Ticket Date</th>
                                    <th>Customer Name</th>
                                    <th>Model No</th>
                                    <th>Serial No</th>
                                    <th>Age</th>
                                    <th>Assigned Users</th>
                                    <th>Status</th>
                                    {/* <th>Edit</th> */}
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
                                        <td>{item.serial_no}</td>
                                        <td>{item.ageingdays}</td>
                                        <td>{item.assigned_name}</td>
                                        <td>{item.call_status}</td>
                                        {/* <td>
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
                                        </td> */}
                                        <td>
                                            <button
                                                className='btn'
                                                onClick={() => {
                                                    navigate(`/csp/ticketview/${item.id}`)
                                                    addInTab(item.ticket_no, item.id)
                                                }}
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
            </div>
        </div>
    );
}

export default Ticketlistcsp
