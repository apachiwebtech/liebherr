import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';

export function Engineerlist(params) {
    const [Engineerdata, setEngineerdata] = useState([]);
    const token = localStorage.getItem("token");
    const [isEdit, setIsEdit] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchEngineerlist(page); // Fetch data for the new page
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

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchEngineerlist = async (page) => {
        try {
            const response = await axios.get(`${Base_Url}/getengineer`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    // You can add any additional filter parameters here if needed
                    page: page, // current page number
                    pageSize: pageSize, // page size
                },
            }
            );
            setEngineerdata(response.data);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Engineerdata:', error);
            setEngineerdata([]);
        }
    };
    const handleChangestatus = (e) => {
        try {
            const dataId = e.target.getAttribute('data-id');

            const response = axios.post(`${Base_Url}/updatestatus`, { dataId: dataId }, {
                headers: {
                    Authorization: token,
                },
            }
            );

        } catch (error) {
            console.error("Error editing user:", error);
        }

    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteengineer`, { id }, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setFormData({
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
            })
            fetchEngineerlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchEngineerlist();
    }, []);

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

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
            <Franchisemaster />
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/engineermaster`}><button className='btn btn-primary'>Add Engineer</button></Link>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Name</th>
                                        <th width="8%">Email</th>
                                        <th width="20%">Mobile Number</th>
                                        <th width="10%">Employee Code</th>
                                        <th width="5%">Edit</th>
                                        {/* <th width="5%">View</th> */}
                                        <th width="5%">Status</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Engineerdata.map((item, index) => {
                                        return (
                                            <tr key={item.id}>
                                                <td >{index + 1}</td>
                                                <td >{item.title}</td>
                                                <td >{item.email}</td>
                                                <td >{item.mobile_no}</td>
                                                <td >{item.employee_code}</td>

                                                <td >
                                                    <Link to={`/engineermaster/${item.id}`}> <button
                                                        className='btn'
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button></Link>
                                                </td>
                                                {/* <td >
                                                    <button
                                                        className='btn'
                                                        onClick={() => {
                                                            navigate(`/complaintview/${item.id}`)
                                                        }}
                                                        title="View"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                </td> */}
                                                <td style={{ padding: "10px" }}>
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