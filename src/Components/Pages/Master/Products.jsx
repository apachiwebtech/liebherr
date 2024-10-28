import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash,FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';

export function Products(params) {
    const [Productdata, setProductdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        serial_no: '',
        item_code: '',
        item_description: '',
        // itemCode: '',
        productType: '',
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

    const fetchProductlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getproductlist`);
            setProductdata(response.data);
        } catch (error) {
            console.error('Error fetching Productdata:', error);
            setProductdata([]);
        }
    };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteproductlist`, { id });
            setFormData({
                serial_no: '',
                item_code: '',
                item_description: '',
                // itemCode: '',
                productType: '',
                productLineCode: '',
                productLine: '',
                productClassCode: '',
                productClass: '',
                material: '',
                manufacturer: '',
            })
            fetchProductlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestproductlist/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchProductlist();
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
            <div className="col-md-12 col-12">
                <div className="card mb-3 tab_box">
                    <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        <table  className="table">
                            <thead>
                                <tr>
                                    <th >#</th>
                                    <th >Serial No.</th>
                                    <th >Item Code</th>
                                    <th >Item Description</th>
                                    <th >Product Type</th>
                                    <th >Product Line</th>
                                    <th >Material</th>
                                    <th >Manufacturer</th>
                                    <th >Edit</th>
                                    <th >View</th>
                                    <th >Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                            
                                {Productdata.map((item, index) => {
                                    return (
                                        <tr key={item.id}>
                                            <td >{index + 1}</td>
                                            <td >{item.serial_no}</td>
                                            <td >{formatDate(item.item_code)}</td>
                                            <td >{item.item_description}</td>
                                            <td >{item.productType}</td>
                                            <td >{item.productLine}</td>
                                            <td >{item.material}</td>
                                            <td >{item.manufacturer}</td>
                                            <td >
                                                <button
                                                    className='btn'
                                                    onClick={() => {
                                                        // alert(item.id)
                                                        edit(item.id)
                                                    }}
                                                    title="Edit"
                                                    style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                >
                                                    <FaPencilAlt />
                                                </button>
                                            </td>
                                            <td >
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
                                            </td>
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
    )
}