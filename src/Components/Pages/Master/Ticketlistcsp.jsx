import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
const Ticketlistcsp = (params) => {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Complaintdata, setComplaintdata] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const token = localStorage.getItem("token"); // Get token from localStorage
    const [paginationInfo, setPaginationInfo] = useState(null);
    const created_by = localStorage.getItem("userId"); // Get user ID from localStorage
    const Lhiuser = localStorage.getItem("Lhiuser"); // Get Lhiuser from localStorage
    const licare_code = localStorage.getItem("licare_code");
    const [currentPage, setCurrentPage] = useState(1);
    const [isEdit, setIsEdit] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchFilteredData(page); // Fetch data for the new page
    };

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

    const fetchComplaintlist = async (page) => {

        try {
            const response = await axiosInstance.get(`${Base_Url}/getcomplainlistcsp`, {
                params: {
                    licare_code,
                    page, // Add page parameter for pagination
                    pageSize, // Add pageSize parameter for pagination
                },
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            const { data, totalRecords, currentPage, totalPages } = response.data;
            setTotalCount(totalRecords); // Total count

            // // Filter out complaints with 'Closed' or 'Cancelled' call statuses
            // const filteredComplaints = data.filter(
            //     (complaint) => !['Closed', 'Cancelled'].includes(complaint.call_status)
            // );

            // Update states with received data
            setComplaintdata(data);
            setFilteredData(data);
            setPaginationInfo({
                totalRecords,
                currentPage,
                totalPages,
                pageSize,
            });
        } catch (error) {
            console.error('Error fetching Complaint data:', error);

            // Reset states in case of an error
            setComplaintdata([]);
            setFilteredData([]);
            setPaginationInfo(null); // Reset pagination info
        }
    };



    const fetchFilteredData = async (page = 1, pageSize = 10) => {
        try {
            const params = new URLSearchParams();

            // Add all filters and pagination parameters to params
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add non-empty values
                    params.append(key, value);
                }
            });

            params.append('licare_code', licare_code);
            params.append('page', page); // Add page parameter
            params.append('pageSize', pageSize); // Add pageSize parameter

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getcomplainlistcsp?${params}`, {
                headers: {
                    Authorization: token, // Send token in headers
                },
            });

            const { data, totalRecords, currentPage, totalPages } = response.data;
            setTotalCount(totalRecords);
            // Update filtered data and pagination info
            setFilteredData(data);
            setComplaintdata(data);
            setPaginationInfo({
                totalRecords,
                currentPage,
                totalPages,
                pageSize,
            });
        } catch (error) {
            console.error('Error fetching filtered data:', error);

            // Reset states in case of an error
            setFilteredData([]);
            setPaginationInfo(null); // Reset pagination info
        }
    };

    const sendtoedit123 = async (id) => {
        // alert(id)
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        // navigate(`/quotation/${encrypted}`)
        navigate(`/csp/ticketview/${encrypted}`)
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


    // export to excel 
    const exportToExcel = async () => {
        // Check if From and To Dates are selected
        if (!searchFilters.fromDate || !searchFilters.toDate) {
            alert("Please select both From Date and To Date.");
            return;
        }

        try {
            // Convert From and To Date to the desired format (if necessary)
            const fromDate = new Date(searchFilters.fromDate).toISOString().split('T')[0];
            const toDate = new Date(searchFilters.toDate).toISOString().split('T')[0];

            // Fetch all ticket data based on From and To Date filter, without pagination
            const response = await axiosInstance.get(`${Base_Url}/getcspticketexcel`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: 10000, // Large page size to fetch all records without pagination (you can adjust this)
                    page: 1,         // Fetch from page 1
                    fromDate: fromDate,
                    toDate: toDate,
                    licare_code: licare_code, // Ensure licare_code is sent as before
                },
            });


            const allTicketData = response.data.data;

            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(
                allTicketData.map((item) => ({
                    TicketNo: item.ticket_no,
                    TicketDate: item.ticket_date ? formatDate(item.ticket_date) : '',
                    CustomerId: item.customer_id,
                    Salutation: item.salutation,
                    CustomerName: item.customer_name,
                    CustomerMobile: item.customer_mobile,
                    CustomerEmail: item.customer_email,
                    ModelNumber: item.ModelNumber,
                    SerialNo: item.serial_no,
                    Address: item.address,
                    Region: item.region,
                    State: item.state,
                    City: item.city,
                    District: item.area,
                    Pincode: item.pincode,
                    MotherBranch: item.mother_branch,
                    ServicePartner: item.sevice_partner,
                    ChildServicePartner: item.child_service_partner,
                    msp: item.msp,
                    csp: item.csp,
                    SalesPartner: item.sales_partner,
                    AssignedTo: item.assigned_to,
                    OldEngineer: item.old_engineer,
                    EngineerCode: item.engineer_code,
                    EngineerId: item.engineer_id,
                    TicketType: item.ticket_type,
                    CallType: item.call_type,
                    SubCallStatus: item.sub_call_status,
                    CallStatus: item.call_status,
                    WarrantyStatus: item.warranty_status,
                    InvoiceDate: item.invoice_date,
                    ModeofContact: item.mode_of_contact,
                    CallCharges: item.call_charges,
                    ContactPerson: item.contact_person,
                    PurchaseDate: item.purchase_date ? formatDate(item.purchase_date) : '',
                    CustomerClass: item.customer_class,
                    CallPriority: item.call_priority,
                    SpareDocPath: item.spare_doc_path,
                    CallRemark: item.call_remark,
                    SpareDetails: item.spare_detail,
                    GroupCode: item.group_code,
                    DefectType: item.defect_type,
                    SiteDefect: item.site_defect,
                    SparePartID: item.spare_part_id,
                    TOTP: item.totp,
                    RequestedBY: item.requested_by,
                    RequestedEmail: item.requested_email,
                    RequestedMobile: item.requested_mobile,
                    SalesPartner2: item.sales_partner2,
                }))
            );

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "TicketListCsp");

            // Export the workbook
            XLSX.writeFile(workbook, "TicketListCsp.xlsx");
        } catch (error) {
            console.error("Error exporting data to Excel:", error);
        }
    };
    // export to excel end

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
                                            <option value="">Select</option>
                                            <option value="Open">Open</option>
                                            <option value="Appointment">Appointment</option>
                                            <option value="Approval">Approval</option>
                                            <option value="Spares">Spares</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Closed">Closed</option>
                                            <option value="In Process">In Process</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="Duplicate">Duplicate</option>
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


                                {/* Buttons and message at the far-right corner */}
                                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                    <div className="form-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={exportToExcel}
                                            style={{
                                                marginLeft: '5px',
                                            }}
                                        >
                                            Export to Excel
                                        </button>
                                        <button
                                            className="btn btn-primary mr-2"
                                            onClick={applyFilters}
                                            style={{
                                                marginLeft: '5px',
                                            }}
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
                                    <th>Call Priority</th>
                                    <th>Status</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => {
                                    const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                    const rowStyle = {
                                        backgroundColor: item.call_priority == "HIGH" ? "#d4edda" : item.call_priority == "REGULAR" ? "#transparent" : "transparent",
                                    };
                                    return (
                                        <tr key={item.id}>
                                            <td style={rowStyle}>{displayIndex}</td>  {/* Use displayIndex for correct pagination */}
                                            <td style={rowStyle}>{item.ticket_no}</td>
                                            <td style={rowStyle}>{formatDate(item.ticket_date)}</td>
                                            <td style={rowStyle}>{item.customer_name}</td>
                                            <td style={rowStyle}>{item.ModelNumber}</td>
                                            <td style={rowStyle}>{item.serial_no}</td>
                                            <td style={rowStyle}>{item.ageingdays}</td>
                                            <td style={rowStyle}>{item.assigned_name}</td>
                                            <td style={rowStyle}>{item.call_priority}</td>
                                            <td style={rowStyle}>{item.call_status} / {item.sub_call_status}</td>

                                            <td style={rowStyle}>
                                                <button
                                                    className="btn"
                                                    onClick={() => {
                                                        // navigate(`/csp/ticketview/${item.id}`);
                                                        addInTab(item.ticket_no, item.id);
                                                        sendtoedit123(item.id)
                                                    }}
                                                    title="View"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        color: 'blue',
                                                        fontSize: '20px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                            {/* Uncomment the below block if deletion is needed */}
                                            {/* <td>
                <button
                    className="btn"
                    onClick={() => deleted(item.id)}
                    title="Delete"
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'red',
                        fontSize: '20px',
                    }}
                >
                    <FaTrash />
                </button>
            </td> */}
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
    );
}

export default Ticketlistcsp
