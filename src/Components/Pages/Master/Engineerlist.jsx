import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';

export function Engineerlist(params) {
    const [Productdata, setEngineerdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
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

    const fetchEngineerlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getengineer`);
            setEngineerdata(response.data);
        } catch (error) {
            console.error('Error fetching Engineerdata:', error);
            setEngineerdata([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteengineer`, { id });
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
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
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
                                <Link to={`/addproduct/:productid`}><button className='btn btn-primary'>Add Engineer</button></Link>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Name</th>
                                        <th width="8%">Email</th>
                                        <th width="20%">Mobile Number</th>
                                        <th width="20%">Employee Code</th>
                                        <th width="5%">Edit</th>
                                        {/* <th width="5%">View</th> */}
                                        <th width="5%">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Productdata.map((item, index) => {
                                        return (
                                            <tr key={item.id}>
                                                <td >{index + 1}</td>
                                                <td >{item.title }</td>
                                                <td >{item.email}</td>
                                                <td >{item.mobile_no}</td>
                                                <td >{item.employee_code}</td>
                                                
                                                <td >
                                                   <Link to={`/addproduct/${item.id}`}> <button
                                                        className='btn'
                                                        onClick={() => {
                                                            // alert(item.id)
                                                            edit(item.id)
                                                        }}
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
                                                <td style={{ padding: '0px', textAlign: 'center' }}>
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