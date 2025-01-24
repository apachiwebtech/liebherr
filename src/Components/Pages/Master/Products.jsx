import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import ProMaster from './ProMaster';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';

export function Products(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Productdata, setProductdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchProductlist(page); // Fetch data for the new page
    };
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

    const [searchFilters, setSearchFilters] = useState({
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

    const fetchProductlist = async (page) => {
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
            const response = await axiosInstance.get(`${Base_Url}/getproductlist?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });
            setProductdata(response.data.data);
            setFilteredData(response.data.data);
            // Store total count for pagination logic on the frontend
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching Productdata:', error);
            setProductdata([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getproductlist?${params}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setProductdata(response.data.data);
            setFilteredData(response.data.data);
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

    const edit = async (id) => {

        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        navigate(`/addproduct/${encrypted}`)
    };

    useEffect(() => {
        fetchProductlist();
    }, []);

    const [isOpen, setIsOpen] = useState({}); // State to track which rows are expanded
    const toggleRow = (rowId) => {
        setIsOpen((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
    };

    const navigate = useNavigate();

    // export to excel 
    const exportToExcel = async () => {
        try {
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getproductlist`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1, // Start from the first page
                },
            });
            const allProductDate = response.data.data;

            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(allProductDate.map(user => ({
                "Item Code": user.item_code,
                "Item Description": user.item_description,
                "Product Name": user.product_model,
                "Product Description": user.item_description,
                "Product Type": user.productType,
                "Product Line": user.productLine,
                "Product LineCode": user.productLineCode,
                "Product Class": user.productClass,
                "Product ClassCode": user.productClassCode,
                "Material": user.material,
                "Manufacturer": user.manufacturer,
                "Item Type": user.itemType,
                "Serialized": user.serialized,
                "Product Size": user.sizeProduct,
                "CRM_ Product Type": user.crm_productType,
                "Short Model": user.shortModel,
                "Installation Type ": user.installationType,
                "Handle type ": user.handleType,
                "warranty": user.warranty,
                "Returnable": user.returnable,
                "Color": user.color,
                "mrp": user.mrp,
                "Packed": user.packed,
                "Price Group": user.price_group,
                "Service Basic Partner": user.service_partner_basic,
                // Add fields you want to export
            })));

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products List");

            // Export the workbook
            XLSX.writeFile(workbook, "Products List.xlsx");
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
        pageid: String(13)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            <ProMaster />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/addproduct/:productid`}><button hidden className='btn btn-primary'>Add Product</button></Link>
                            </div>

                            <div className="row mb-3">

                                {/* <div className="col-md-2">
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
                                </div> */}


                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Item Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="item_code"
                                            value={searchFilters.item_code}
                                            placeholder="Search by Item code"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Product Type</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="productType"
                                            value={searchFilters.productType}
                                            placeholder="Search by Product Type"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Product Liine</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="productLine"
                                            value={searchFilters.productLine}
                                            placeholder="Search by Product Line"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Material</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="material"
                                            value={searchFilters.material}
                                            placeholder="Search by Material"
                                            onChange={handleFilterChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>Manufacturer</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="manufacturer"
                                            value={searchFilters.manufacturer}
                                            placeholder="Search by Manufacturer"
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
                                            <th width="8%">Item Code</th>
                                            <th width="20%">Product Name</th>
                                            <th width="20%">Product Type</th>
                                            <th width="10%">Product Line</th>
                                            <th width="15%">Material</th>
                                            <th width="5%">Manufacturer</th>
                                            <th width="5%">View</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Productdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (<tr key={item.id}>
                                                <td >{displayIndex}</td>
                                                <td>{item.item_code}</td>
                                                <td>{item.product_model}<br />{item.item_description}</td>
                                                <td>{item.productType}</td>
                                                <td>{item.productLine}</td>
                                                <td>{item.material}</td>
                                                <td>{item.manufacturer}</td>
                                                <td>
                                                    <button
                                                        className='btn'
                                                        onClick={() => edit(item.id)}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaEye />
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
