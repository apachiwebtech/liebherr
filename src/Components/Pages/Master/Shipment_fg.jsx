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

export function Shipment_fg(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Shipmentfgdata, setShipmentFg] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
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

    const fetchShipmentFg = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getshipmentfg`, {
                headers: {
                    Authorization: token,
                },
            });
            setShipmentFg(response.data);
        } catch (error) {
            console.error('Error fetching Feedbackdata:', error);
            setShipmentFg([]);
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
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Shipmentfgdata.map(user => ({
           
            "InvoiceNumber":InvoiceNumber,
            "InvoiceDate":InvoiceDate,
            "Invoice_bpcode":Invoice_bpcode,
            "Invoice_bpName":Invoice_bpName,
            "Invoice_city":Invoice_city,
            "Invoice_state":Invoice_state,
           "orderType_desc": orderType_desc,
           "Customer_Po":Customer_Po,
            "Item_Code":Item_Code,
            "Item_Description":Item_Description,
            "Invoice_qty":Invoice_qty,
            "Serial_no":Serial_no,
            "compressor_bar":compressor_bar,
            "Manufacture_date":Manufacture_date,
            "Vehicle_no":Vehicle_no,
            "Vehicale_Type":Vehicale_Type,
            "Transporter_name":Transporter_name,
           "Lr_number": Lr_number,
           "Lr_date":Lr_date,
            "Address_code":Address_code,
            "Address":Address,
            "Pincode":Pincode,
            "Shipment_id":Shipment_id,
            "Ship_date":Ship_date,
            "Transaction_Type":Transaction_Type,
            "customer_classification":customer_classification,
            "hsn_code":hsn_code,
            "basic_rate":basic_rate,
            "licarecode":licarecode,
            "licare_address":licare_address,
            "product_choice":product_choice,
           "serial_identification": serial_identification,
           "lot_number":lot_number,
            "order_number":order_number,
            "order_line_number":order_line_number,
            "wearhouse":wearhouse,
            "service_type":service_type,
       
        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "FeedBack Report");

        // Export the workbook
        XLSX.writeFile(workbook, "FeedBack_Report.xlsx");
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
                                            <th width="10%">Shipment_id</th>
                                            <th width="10%">Ship_date</th>
                                            <th width="10%">Transaction_Type</th>
                                            <th width="10%">hsn_code</th>
                                            <th width="10%">basic_rate</th>
                                            <th width="10%">licarecode</th>
                                            <th width="10%">licare_address</th>
                                            <th width="10%">product_choice</th>
                                            <th width="10%">serial_identification</th>
                                            <th width="10%">lot_number</th>
                                            <th width="10%">Lr_date</th>
                                            <th width="10%">order_number</th>
                                            <th width="10%">order_line_number</th>
                                            <th width="10%">wearhouse</th>
                                            <th width="10%">service_type</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Shipmentfgdata.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.InvoiceNumber}</td>
                                                <td>{item.InvoiceDate}</td>
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
                                                <td>{item.Manufacture_date}</td>
                                                <td>{item.Vehicle_no}</td>
                                                <td>{item.Vehicale_Type}</td>
                                                <td>{item.Transporter_name}</td>
                                                <td>{item.Lr_number}</td>
                                                <td>{item.Lr_date}</td>
                                                <td>{item.Address_code}</td>
                                                <td>{item.Address}</td>
                                                <td>{item.Pincode}</td>
                                                <td>{item.Shipment_id}</td>
                                                <td>{item.Ship_date}</td>
                                                <td>{item.Transaction_Type}</td>
                                                <td>{item.customer_classification}</td>
                                                <td>{item.hsn_code}</td>
                                                <td>{item.basic_rate}</td>
                                                <td>{item.licarecode}</td>
                                                <td>{item.licare_address}</td>
                                                <td>{item.serial_identification}</td>
                                                <td>{item.lot_number}</td>
                                                <td>{item.order_number}</td>
                                                <td>{item.order_line_number}</td>
                                                <td>{item.wearhouse}</td>
                                                <td>{item.service_type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    )
}