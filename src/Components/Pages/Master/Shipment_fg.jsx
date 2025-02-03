import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import AllocationTab from './AllocationTab';

export function Shipment_fg(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Shipmentfgdata, setShipmentFg] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page) => {

        setCurrentPage(page);
        fetchShipmentFg(page); // Fetch data for the new page
    };
    const [formData, setFormData] = useState({
        InvoiceNumber: '',
        InvoiceDate: '',
        Invoice_bpcode: '',
        Invoice_bpName: '',
        Invoice_city: '',
        Invoice_state: '',
        orderType_desc: '',
        Customer_Po: '',
        Item_Code: '',
        Item_Description: '',
        Invoice_qty: '',
        Serial_no: '',
        compressor_bar: '',
        Manufacture_date: '',
        Vehicle_no: '',
        Vehicale_Type: '',
        Transporter_name: '',
        Lr_number: '',
        Lr_date: '',
        Address_code: '',
        Address: '',
        Pincode: '',
        Shipment_id: '',
        Ship_date: '',
        Transaction_Type: '',
        created_date: '',
        customer_classification: '',
        hsn_code: '',
        basic_rate: '',
        licarecode: '',
        licare_address: '',
        product_choice: '',
        serial_identification: '',
        lot_number: '',
        order_number: '',
        order_line_number: '',
        wearhouse: '',
        service_type: '',


    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchShipmentFg = async (page) => {
        try {
            // Initialize URLSearchParams for query parameters
            const params = new URLSearchParams();

            // Add the page and pageSize parameters
            params.append('page', page || 1); // Current page number
            params.append('pageSize', pageSize); // Page size
            const response = await axiosInstance.get(`${Base_Url}/getshipmentfg?${params.toString()}`, {
                headers: {
                    Authorization: token,
                },
            });

            // Decrypt the response data
            const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
            const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            setShipmentFg(decryptedData);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            console.error('Error fetching ShipmentFG data:', error);
            setShipmentFg([]);
        } finally {
            setLoading(false);  // Stop loader after data is loaded or in case of error
        }
    };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        Navigate(`/feedbackreportview/${encrypted}`)
    };

    useEffect(() => {
        fetchShipmentFg();
    }, []);



    // export to excel 
    const exportToExcel = async () => {
        try {
            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getshipmentfg`, {
                headers: {
                    Authorization: token,
                },
                params: {
                    pageSize: totalCount, // Fetch all data
                    page: 1, // Start from the first page
                },
            });

            const AllShipmentfgdata = response.data.data;
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(AllShipmentfgdata.map(user => ({

                "InvoiceNumber": user.InvoiceNumber,
                "InvoiceDate": user.InvoiceDate,
                "Invoice_bpcode": user.Invoice_bpcode,
                "Invoice_bpName": user.Invoice_bpName,
                "Invoice_city": user.Invoice_city,
                "Invoice_state": user.Invoice_state,
                "orderType_desc": user.orderType_desc,
                "Customer_Po": user.Customer_Po,
                "Item_Code": user.Item_Code,
                "Item_Description": user.Item_Description,
                "Invoice_qty": user.Invoice_qty,
                "Serial_no": user.Serial_no,
                "compressor_bar": user.compressor_bar,
                "Manufacture_date": user.Manufacture_date,
                "Vehicle_no": user.Vehicle_no,
                "Vehicale_Type": user.Vehicale_Type,
                "Transporter_name": user.Transporter_name,
                "Lr_number": user.Lr_number,
                "Lr_date": user.Lr_date,
                "Address_code": user.Address_code,
                "Address": user.Address,
                "Pincode": user.Pincode,
                "Shipment_id": user.Shipment_id,
                "Ship_date": user.Ship_date,
                "Transaction_Type": user.Transaction_Type,
                "customer_classification": user.customer_classification,
                "hsn_code": user.hsn_code,
                "basic_rate": user.basic_rate,
                "licarecode": user.licarecode,
                "licare_address": user.licare_address,
                "product_choice": user.product_choice,
                "serial_identification": user.serial_identification,
                "lot_number": user.lot_number,
                "order_number": user.order_number,
                "order_line_number": user.order_line_number,
                "wearhouse": user.wearhouse,
                "service_type": user.service_type,

            })));

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Shipment FG");

            // Export the workbook
            XLSX.writeFile(workbook, "Shipment_fg.xlsx");
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
        pageid: String(1)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End

    return (
        <div className="tab-content">
            < AllocationTab />
            {(loaders || loading) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders || loading} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0">
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='table-responsive'>
                                <button
                                    className="btn btn-primary"
                                    onClick={exportToExcel}
                                >
                                    Export to Excel
                                </button>
                                <table id="example" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="10%">InvoiceNumber</th>
                                            <th width="10%">InvoiceDate</th>
                                            <th width="10%">Invoice_bpcode</th>
                                            <th width="10%">Invoice_bpName 1</th>
                                            <th width="10%">Invoice_city</th>
                                            <th width="10%">Invoice_state</th>
                                            <th width="10%">orderType_desc</th>
                                            <th width="10%">Customer_Po</th>
                                            <th width="10%">Item_Code</th>
                                            <th width="10%">Item_Description</th>
                                            <th width="10%">Invoice_qty</th>
                                            <th width="10%">Serial_no</th>
                                            <th width="10%">compressor_bar</th>
                                            <th width="10%">Manufacture_date</th>
                                            <th width="10%">Vehicle_no</th>
                                            <th width="10%">Vehicale_Type</th>
                                            <th width="10%">Transporter_name</th>
                                            <th width="10%">Lr_number</th>
                                            <th width="10%">Lr_date</th>
                                            <th width="10%">Address_code</th>
                                            <th width="10%">Address</th>
                                            <th width="10%">Pincode</th>
                                            <th width="10%">Shipment_id</th>
                                            <th width="10%">Ship_date</th>
                                            <th width="10%">Transaction_Type</th>
                                            <th width="10%">Customer Classification</th>
                                            <th width="10%">hsn_code</th>
                                            <th width="10%">basic_rate</th>
                                            <th width="10%">licarecode</th>
                                            <th width="10%">licare_address</th>
                                            <th width="10%">product_choice</th>
                                            <th width="10%">serial_identification</th>
                                            <th width="10%">lot_number</th>
                                            <th width="10%">order_number</th>
                                            <th width="10%">order_line_number</th>
                                            <th width="10%">wearhouse</th>
                                            <th width="10%">service_type</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Shipmentfgdata.map((item, index) => {
                                            const displayIndex = (currentPage - 1) * pageSize + index + 1;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{displayIndex}</td>
                                                    <td>{item.InvoiceNumber}</td>
                                                    <td>{formatDate(item.InvoiceDate)}</td>
                                                    <td>{item.Invoice_bpcode}</td>
                                                    <td>{item.Invoice_bpName}</td>
                                                    <td>{item.Invoice_city}</td>
                                                    <td>{item.Invoice_state}</td>
                                                    <td>{item.orderType_desc}</td>
                                                    <td>{item.Customer_Po}</td>
                                                    <td>{item.Item_Code}</td>
                                                    <td>{item.Item_Description}</td>
                                                    <td>{item.Invoice_qty}</td>
                                                    <td>{item.Serial_no}</td>
                                                    <td>{item.compressor_bar}</td>
                                                    <td>{formatDate(item.Manufacture_date)}</td>
                                                    <td>{item.Vehicle_no}</td>
                                                    <td>{item.Vehicale_Type}</td>
                                                    <td>{item.Transporter_name}</td>
                                                    <td>{item.Lr_number}</td>
                                                    <td>{formatDate(item.Lr_date)}</td>
                                                    <td>{item.Address_code}</td>
                                                    <td>{item.Address}</td>
                                                    <td>{item.Pincode}</td>
                                                    <td>{item.Shipment_id}</td>
                                                    <td>{formatDate(item.Ship_date)}</td>
                                                    <td>{item.Transaction_Type}</td>
                                                    <td>{item.customer_classification}</td>
                                                    <td>{item.hsn_code}</td>
                                                    <td>{item.basic_rate}</td>
                                                    <td>{item.licarecode}</td>
                                                    <td>{item.licare_address}</td>
                                                    <td>{item.product_choice}</td>
                                                    <td>{item.serial_identification}</td>
                                                    <td>{item.lot_number}</td>
                                                    <td>{item.order_number}</td>
                                                    <td>{item.order_line_number}</td>
                                                    <td>{item.wearhouse}</td>
                                                    <td>{item.service_type}</td>
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
    )
}