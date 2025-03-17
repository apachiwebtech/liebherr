import * as XLSX from "xlsx";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
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
        spareId: '',
        ModelNumber: '',
        ticket_no: '',
        quantity: '',
        price: '',
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
        try {
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getchildFranchiseDetails`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1, // Start from the first page
                },
            });
            const allQuotationdata = response.data.data;
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allQuotationdata.map(user => ({

                "QuotationNumber": user.quotationNumber,
                "ticketId": user.ticketId,
                "ticketdate": user.ticketdate,
                "QuotationDate": user.quotationDate,
                "EngineerName": user.assignedEngineer,
                "CustomerName": user.CustomerName,
                "CustomerID": user.customer_id,
                "ModelNumber": user.ModelNumber,
                "State": user.state,
                "City": user.city,
                "SpareName": user.title,
                "Quantity": user.quantity,
                "Price": user.price,
                "Status": user.status,


            })));

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


                            <div className="row mb-3">

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
                                        <label>Engineer</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="assignedEngineer"
                                            value={searchFilters.assignedEngineer}
                                            placeholder="Search by Engineer"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="CustomerName"
                                            value={searchFilters.CustomerName}
                                            placeholder="Search by CustomerName"
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
                                            name="ticket_no"
                                            value={searchFilters.ticket_no}
                                            placeholder="Search by Ticket No"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="price"
                                            value={searchFilters.price}
                                            placeholder="Search by Price name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="status"
                                            value={searchFilters.status}
                                            placeholder="Search by Status"
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
                            <div className='table-responsive'>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="13%">Quotation Number</th>
                                            <th width="7%">Ticket No.</th>
                                            <th width="10%">Ticket Date</th>
                                            <th width="20%">Engineer</th>
                                            <th width="10%">Customer Name</th>
                                            <th width="15%">ModelNumber</th>
                                            <th width="10%">Status</th>
                                           <th width="10%">Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Quotationdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td >{displayIndex}</td>
                                                    <td>{item.quotationNumber}</td>
                                                    <td>{item.ticketId}</td>
                                                    <td>{formatDate(item.ticketdate)}</td>
                                                    <td>{item.assignedEngineer}</td>
                                                    <td>{item.CustomerName}</td>
                                                    <td>{item.ModelNumber}</td>
                                                    <td style={{ padding: '0px', textAlign: 'center' }}>
                                                        {item.status}
                                                    </td>
                                                    <td>

                                                        <button
                                                            className='btn'
                                                            onClick={() => sendtoedit(item.id)}
                                                            title="Edit"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                 
                                                        >
                                                            <FaPencilAlt />
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
            </div> : null}
        </div>
    );
}
