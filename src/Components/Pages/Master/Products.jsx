import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import ProMaster from './ProMaster';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';

// DataTables Responsive Extension (JS and CSS for Bootstrap 4)
import 'datatables.net-responsive';
import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css';

export function Products(params) {
    const [Productdata, setProductdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        serial_no: '',
        item_code: '',
        item_description: '',
        product_model: '',
        productType: '',
        productLineCode: '',
        productLine: '',
        productClassCode: '',
        productClass: '',
        material: '',
        manufacturer: '',
    });

    const fetchProductlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getproductlist`,{
                headers: {
                    Authorization: token,
                },
            });
            setProductdata(response.data);
        } catch (error) {
            console.error('Error fetching Productdata:', error);
            setProductdata([]);
        }
    };

    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deleteproductlist`, { id }, {
                headers: {
                    Authorization: token,
                },
            });
            setFormData({
                serial_no: '',
                item_code: '',
                item_description: '',
                product_model: '',
                productType: '',
                productLineCode: '',
                productLine: '',
                productClassCode: '',
                productClass: '',
                material: '',
                manufacturer: '',
            });
            fetchProductlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestproductlist/${id}`, {
                headers: {
                    Authorization: token,
                },
            });
            setFormData(response.data);
            setIsEdit(true);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };

    useEffect(() => {
        fetchProductlist();
    }, []);

    useEffect(() => {
        if (Productdata.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                lengthChange: false,
                autoWidth: false,
            });

            // Cleanup: Destroy DataTable instance before reinitializing when Productdata changes
            return () => {
                table.destroy();
            };
        }
    }, [Productdata]);

    const navigate = useNavigate();

    return (
        <div className="tab-content">
            <ProMaster />
            <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/addproduct/:productid`}><button className='btn btn-primary'>Add Product</button></Link>
                            </div>
                            <div className='table-responsive'>
                            <table id="example" className="table table-striped">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Serial No.</th>
                                        <th width="8%">Item Code</th>
                                        <th width="20%">Product Name</th>
                                        <th width="20%">Product Type</th>
                                        <th width="10%">Product Line</th>
                                        <th width="15%">Material</th>
                                        <th width="5%">Manufacturer</th>
                                        <th width="5%">Edit</th>
                                        <th width="5%">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Productdata.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.serial_no}</td>
                                            <td>{item.item_code}</td>
                                            <td>{item.product_model}<br />{item.item_description}</td>
                                            <td>{item.productType}</td>
                                            <td>{item.productLine}</td>
                                            <td>{item.material}</td>
                                            <td>{item.manufacturer}</td>
                                            <td>
                                                <Link to={`/addproduct/${item.id}`}>
                                                    <button
                                                        className='btn'
                                                        onClick={() => edit(item.id)}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                </Link>
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
                                    ))}
                                </tbody>
                            </table>
                            </div>
                         
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
