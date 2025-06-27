import * as XLSX from "xlsx";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

export function Quotationlist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Quotationdata, setQuotationdata] = useState([]);
    const token = localStorage.getItem("token");
    const licare_code = localStorage.getItem("licare_code");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchQuotationlist(page); // Fetch data for the new page
    };
    const [formData, setFormData] = useState({
        ticketId: '',
        customer: '',
        spareId: '',
        ModelNumber: '',
        title: '',
        quantity: '',
        price: '',
        CustomerName: '',
    });

    const [searchFilters, setSearchFilters] = useState({
        ticketId: '',
        CustomerName: '',
        ModelNumber: '',
        ticketId: '',
        price: '',
        fromDate: '',
        toDate: '',
        quotationNumber: '',
        customer_id: '',
        customer_class: '',
        mobile_no: '',
        alt_mobileno: '',
        email: '',
        state: '',
        customer_type: '',
        ticket_type: '',
        call_status: '',
        sub_call_status: '',
        warranty_status: '',
        serial_no: '',
        sevice_partner: '',
        child_service_partner: '',
        mother_branch: '',
    });

    const fetchQuotationlist = async (page) => {
        try {
            const params = new URLSearchParams();
            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size
            params.append('licare_code', licare_code); // Page size


            // Add all filters to params if they have values
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });
            const response = await axiosInstance.get(`${Base_Url}/getquotationlist?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setQuotationdata(decryptedData);
            setFilteredData(decryptedData);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Quotationdata:', error);
            setQuotationdata([]);
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

            if (licare_code) {
                params.append('licare_code', licare_code);
            }

            console.log('Sending params:', params.toString()); // Debug log

            const response = await axiosInstance.get(`${Base_Url}/getquotationlist?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setQuotationdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
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
        console.log('Applying filters:', searchFilters); // Debug log
        fetchFilteredData();
    };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/quotation/${encrypted}`)
    };

    useEffect(() => {
        fetchQuotationlist();
    }, []);



    const navigate = useNavigate();

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
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getquotationlist`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1,
                    fromDate: fromDate,
                    toDate: toDate,
                    licare_code: licare_code,
                },
            });
            const bytes = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            console.log("Excel Export Data:", decryptedData);
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(
                decryptedData.map((item) => ({
                    ticketId: item.ticketId,
                    ticketdate: item.ticketdate ? formatDate(item.ticketdate) : '',
                    CustomerID: item.customer_id,
                    CustomerName: item.CustomerName,
                    Address: item.customer_address,
                    State: item.state,
                    CustomerClassification: item.customer_class,
                    CustomerMobile: item.mobile_no,
                    AltMobileNo: item.alt_mobileno,
                    CustomerEmail: item.email,  
                    CustomerType: item.customer_type,
                    TicketType: item.ticket_type,
                    ModelNumber: item.ModelNumber,
                    SerialNo : item.serial_no,
                    WarrantyStatus: item.warranty_status,
                    CallStatus: item.call_status,
                    SubCallStatus: item.sub_call_status,
                    LiebherrBranch: item.mother_branch,
                    MasterServicePartner: item.sevice_partner,
                    ChildServicePartner: item.child_service_partner,
                    EngineerName: item.engineer_name,
                    QuotationFor: "Spare Parts",
                    QuotationNumber: item.quotationNumber,        
                    QuotationDate: item.quotationDate ? formatDate(item.quotationDate) : '',                    
                    QuotationAmount: item.price,
                    QuoteStatus: item.status,
                }))
            );

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "QuotationList");

            // Export the workbook
            XLSX.writeFile(workbook, "QuotationList.xlsx");
        } catch (error) {
            console.error("Error exporting data to Excel:", error);
        }
    };

    // Role Right 


    const Decrypt = (encrypted) => {
        encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
    };

    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const roledata = {
        role: decryptedRole,
        pageid: String(44)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    function formatDate(dateStr) {
        const dateObj = new Date(dateStr);

        const day = dateObj.getUTCDate().toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getUTCFullYear();

        return `${day}-${month}-${year}`;
    }

    // Role Right End 

    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className="searchFilter" onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault(); // Prevent form submission if inside a form
                                    applyFilters();
                                }
                            }}>

                                <div className='m-3'>

                                    <div className="row mb-2">
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
                                                <label>Quotation Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="quotationNumber"
                                                    value={searchFilters.quotationNumber}
                                                    placeholder="Search by QuotationNumber"
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
                                                    name="ticketId"
                                                    value={searchFilters.ticketId}
                                                    placeholder="Search by Ticket No"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Customer ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="customer_id"
                                                    value={searchFilters.customer_id}
                                                    placeholder="Search by customer Id"
                                                    onChange={handleFilterChange}
                                                />
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
                                                    <option value="Consumer">Consumer</option>
                                                </select>
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
                                                    <option value="END CUSTOMER">END CUSTOMER</option>
                                                    <option value="DISPLAY / EVENTS">DISPLAY / EVENTS</option>
                                                    <option value="SERVICE PARTNER">SERVICE PARTNER</option>
                                                    <option value="WAREHOUSE">WAREHOUSE</option>
                                                    <option value="LHI DISPLAY/WH">LHI DISPLAY/WH</option>
                                                    <option value="SUB-DEALER">SUB-DEALER</option>

                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Customer Mobile</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="mobile_no"
                                                    value={searchFilters.mobile_no}
                                                    placeholder="Search by customer mobile"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Alternate Mobile</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="alt_mobileno"
                                                    value={searchFilters.alt_mobileno}
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
                                                    name="customerEmail"
                                                    value={searchFilters.email}
                                                    placeholder="Search by customer email"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>State</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="state"
                                                    value={searchFilters.state}
                                                    placeholder="Search by State"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Ticket Type</label>
                                                <select
                                                    className="form-control"
                                                    name="ticket_type"
                                                    value={searchFilters.ticket_type}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value=""> SELECT</option>
                                                    <option value="INSTALLATION">INSTALLATION</option>
                                                    <option value="BREAKDOWN">BREAKDOWN</option>
                                                    <option value="VISIT">VISIT</option>
                                                    <option value="DEMO">DEMO</option>
                                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                                    <option value="HELPDESK">HELPDESK</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Call Status</label>
                                                <select
                                                    className="form-control"
                                                    name="call_status"
                                                    value={searchFilters.call_status}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value=""> SELECT</option>
                                                    <option value="Approval">Approval</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Sub Call Status</label>
                                                <select
                                                    className="form-control"
                                                    name="sub_call_status"
                                                    value={searchFilters.sub_call_status}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value=""> SELECT</option>
                                                    <option value="Fully">FULLY</option>
                                                    <option value="Customer Approval / Quotation">CUSTOMER APPROVAL / QUOTATION</option>
                                                    <option value="Spare Required">SPARE REQUIRED</option>
                                                    <option value="Technician on-route">TECHNICIAN ON-ROUTE</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Warranty Status</label>
                                                <select
                                                    className="form-control"
                                                    name="warranty_status"
                                                    value={searchFilters.warranty_status}
                                                    onChange={handleFilterChange}
                                                >
                                                    <option value=""> SELECT</option>
                                                    <option value="WARRANTY">Warranty</option>
                                                    <option value="OUT OF WARRANTY">Out Of Warranty</option>
                                                </select>
                                            </div>
                                        </div>



                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Serial No</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="serial_no"
                                                    value={searchFilters.serial_no}
                                                    placeholder="Search by Serial No"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Master Service Partner</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="sevice_partner"
                                                    value={searchFilters.sevice_partner}
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
                                                    name="child_service_partner"
                                                    value={searchFilters.child_service_partner}
                                                    placeholder="Search by Csp"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Liebherr Branch</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="mother_branch"
                                                    value={searchFilters.mother_branch}
                                                    placeholder="Search by Liebherr Branch"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="form-group">
                                                <label>Model Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="ModelNumber"
                                                    value={searchFilters.ModelNumber}
                                                    placeholder="Search by Model Number"
                                                    onChange={handleFilterChange}
                                                />
                                            </div>
                                        </div>







                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                                            <div className="form-group">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={exportToExcel}
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
                                                    onClick={() => {
                                                        window.location.reload()
                                                    }}
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
                            </div>
                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="7%">Ticket No.</th>
                                            <th width="10%">Ticket Date</th>
                                            <th width="20%">State</th>
                                            <th width="10%">Customer Classification</th>
                                            <th width="15%">ModelNumber</th>
                                            <th width="15%">Liebherr Branch</th>
                                            <th width="15%">Quotation For</th>
                                            <th width="10%"> Quotation No</th>
                                            <th width="10%"> Quotation Date</th>
                                            <th width="10%"> Quotation Amount</th>
                                            <th width="10%"> Quote Status</th>
                                            <th width="5%">{roleaccess <= 3 ? "View" : "Edit"}</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Quotationdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td >{displayIndex}</td>
                                                    <td>{item.ticketId}</td>
                                                    <td>{item.ticketdate ? formatDate(item.ticketdate) : ""}</td>
                                                    <td>{item.state}</td>
                                                    <td>{item.customer_class}</td>
                                                    <td>{item.ModelNumber}</td>
                                                    <td>{item.mother_branch}</td>
                                                    <td>Spare Parts</td>
                                                    <td>{item.quotationNumber}</td>
                                                    <td>{item.created_date ? formatDate(item.created_date) : ''}</td>
                                                    <td>{item.price}</td>
                                                    <td style={{ padding: '0px', textAlign: 'center' }}>
                                                        {item.status}
                                                    </td>
                                                    <td>
                                                        {roleaccess > 3 ? (
                                                            <button
                                                                className='btn'
                                                                onClick={() => sendtoedit(item.id, 0)}
                                                                title="Edit"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        ) : roleaccess <= 3 ? (
                                                            <button
                                                                className='btn'
                                                                onClick={() => sendtoedit(item.id, 1)}
                                                                title="View"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        ) : null}
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
            </div> : null}
        </div>
    );
}
