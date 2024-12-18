import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';

export function Products(params) {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [Complaintdata, setComplaintdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token"); // Get token from localStorage
    const [formData, setFormData] = useState({
        title: '',
        cfranchise_id: '',
        password: '',
        email: '',
        mobile_no: '',
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchComplaintlist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getcomplainlist`,{
                headers: {
                    Authorization: token, // Send token in headers
                    },
                });
            setComplaintdata(response.data);
        } catch (error) {
            console.error('Error fetching Complaintdata:', error);
            setComplaintdata([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axiosInstance.post(`${Base_Url}/deleteengineer`, { id },{
                headers: {
                    Authorization: token, // Send token in headers
                    },
                });
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
            const response = await axiosInstance.get(`${Base_Url}/requestengineer/${id}`,{
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
        <div className="row mp0" >
              {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body " style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        <div className='table-responsive'>
                        <table className="table table-hover table-bordered">
                            <thead className="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Complaint No.</th>
                                    <th scope="col">Complaint Date</th>
                                    <th scope="col">Customer Name</th>
                                    <th scope="col">Product</th>
                                    <th scope="col">Age</th>
                                    <th scope="col">Assigned Users</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Edit</th>
                                    <th scope="col">View</th>
                                    <th scope="col">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Complaintdata.map((item, index) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.ticket_no}</td>
                                            <td>{formatDate(item.ticket_date)}</td>
                                            <td>{item.customer_name}</td>
                                            <td>{item.ModelNumber}</td>
                                            <td>{'0'}</td>
                                            <td>{item.assigned_to}</td>
                                            <td>{item.call_status}</td>
                                            <td className="text-center">
                                                <button
                                                    className='btn btn-link'
                                                    onClick={() => edit(item.id)}
                                                    title="Edit"
                                                >
                                                    <FaPencilAlt />
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className='btn btn-link'
                                                    onClick={() => navigate(`/complaintview/${item.id}`)}
                                                    title="View"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className='btn btn-link text-danger'
                                                    onClick={() => deleted(item.id)}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
