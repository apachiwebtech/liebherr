import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Engineertabs from './Engineertabs';
export function Engineerlist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Engineerdata, setEngineerdata] = useState([]);
    const token = localStorage.getItem("token");
    const [filteredData, setFilteredData] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchEngineerlist(page); // Fetch data for the new page
    };
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

        return `${day}-${month}-${year}`;
    };      


    const [formData, setFormData] = useState({
        title: '',
        email: '',
        mobile_no: '',
        employee_code: '',
        cfranchise_id: '',
        productLineCode: '',
        productLine: '',
        productClassCode: '',
        productClass: '',
        material: '',
        manufacturer: '',
    });

    const [searchFilters, setSearchFilters] = useState({
        title: '',
        employee_code: '',
        partner_name: '',
        mobile_no: '',
        email: '',


    });

    const fetchEngineerlist = async (page) => {
        try {
            const params = new URLSearchParams();
            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size

            // Add all filters to params if they have values
            Object.entries(searchFilters).forEach(([key, value]) => {
                if (value) { // Only add if value is not empty
                    params.append(key, value);
                }
            });

            const response = await axiosInstance.get(`${Base_Url}/getengineer?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setEngineerdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Engineerdata:', error);
            setEngineerdata([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getengineer?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
            setEngineerdata(decryptedData);
            setFilteredData(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching filtered data:', error);
            setFilteredData([]);
        }
    };
    const applyFilters = () => {
        console.log('Applying filters:', searchFilters); // Debug log
        fetchFilteredData();
    };
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setSearchFilters(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleChangestatus = async (e) => {
        try {
            const dataId = e.target.getAttribute('data-id');

            const response = await axiosInstance.post(`${Base_Url}/updateengineerstatus`, { dataId: dataId }, {
                headers: {
                    Authorization: token,
                },
            }
            );

            fetchEngineerlist();

        } catch (error) {
            console.error("Error editing user:", error);
        }

    };




    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/EngineerMaster/${encrypted}`)
    };
    useEffect(() => {
        fetchEngineerlist();
    }, []);

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };


    const navigate = useNavigate()

    // export to excel 
    const exportToExcel = async () => {
        try {
            // Fetch all engineer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getengineer`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Set a large number to fetch all data
                    page: 1, // Optional: Start from the first page
                },
            });
            const decryptedData = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey).toString(CryptoJS.enc.Utf8);

            const allEngineerData = JSON.parse(decryptedData);

            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allEngineerData.map(user => ({
                "Name": user.title,
                "Cfranchise_id": user.cfranchise_id,
                "EngineerID": user.engineer_id,
                "Email": user.email,
                "MobileNumber": user.mobile_no,
                "Employee Code": user.employee_code,
                "Personal Email": user.personal_email,
                "Personal MobileNumber": user.personal_mobile,
                "Date of Birth": formatDate(user.dob),
                "Blood Group": user.blood_group,
                "Academic Qualification": user.academic_qualification,
                "Joining Date": formatDate(user.joining_date),
                "Passport Picture": user.passport_picture,
                "Resume": user.resume,
                "PhotoProof": user.photo_proof,
                "AddressProof": user.address_proof,
                "PermanentAddress": user.permanent_address,
                "CurrentAddress": user.current_address,
            })));

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Engineerlist");

            // Export the workbook
            XLSX.writeFile(workbook, "Engineerlist.xlsx");
        } catch (error) {
            console.error("Error exporting data to Excel:", error);
        }
    };


    // export to excel end 
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
        pageid: String(24)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            <Engineertabs />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            {roleaccess > 2 ? <div className="p-1 text-right">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate("/EngineerMaster")}
                                >
                                    Add Engineer
                                </button>
                            </div> : null}
                            <div className="row mb-3">

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={searchFilters.title}
                                            placeholder="Search by name"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>


                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Engineer ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="engineer_id"
                                            value={searchFilters.engineer_id}
                                            placeholder="Search by Engineer ID"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Mobile Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="mobile_no"
                                            value={searchFilters.mobile_no}
                                            placeholder="Search by Mobile Number"
                                            onChange={handleFilterChange}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            minLength="10"
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Email</label>
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
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Name</th>
                                        <th width="8%">Email</th>
                                        <th width="20%">Mobile Number</th>
                                        <th width="10%">Engineer ID</th>
                                        <th width="5%">{roleaccess <= 3 ? "View" : "Edit"}</th>
                                        {/* <th width="5%">View</th> */}
                                        {roleaccess > 3 ? <th width="5%">Status</th> : null}
                                    </tr>
                                </thead>
                                <tbody>

                                    {Engineerdata.map((item, index) => {
                                        const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                        return (
                                            <tr key={item.id}>
                                                <td >{displayIndex}</td>
                                                <td >{item.title}</td>
                                                <td >{item.email}</td>
                                                <td >{item.mobile_no}</td>
                                                <td >{item.engineer_id}</td>

                                                <td >
                                                    {roleaccess > 3 ? (
                                                        <Link to={`/engineermaster/${item.id}`}> <button
                                                            className='btn'
                                                            title="Edit"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}

                                                        >
                                                            <FaPencilAlt />
                                                        </button></Link>
                                                    ) : roleaccess <= 3 ? (
                                                        <Link to={`/engineermaster/${item.id}`}> <button
                                                            className='btn'
                                                            title="Edit"
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}

                                                        >
                                                            <FaEye />
                                                        </button></Link>
                                                    ) : null}
                                                </td>
                                                {roleaccess > 3 ? <td style={{ padding: "10px" }}>
                                                    <label class="switch">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleChangestatus}
                                                            data-id={item.id}
                                                            checked={item.status == 1 ? 'checked' : ''} // Check if status is 1 (checked)
                                                            className="status"
                                                        />


                                                        <span class="slider round"></span>
                                                    </label>

                                                </td> : null}
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
            </div> : null}
        </div>
    )
}
