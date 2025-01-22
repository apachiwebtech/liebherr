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

export function FeedBackreport(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Feedbackdata, setFeedbackdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const token = localStorage.getItem("token");
    const [formData, setFormData] = useState({
        InvoiceNumber:'',
        InvoiceDate:'',
        Invoice_bpcode:'',
        Invoice_bpName:'',
        Invoice_city:'',
        Invoice_state:'',
        orderType_desc:'',
        Customer_Po:'',
        Item_Code:'',
        Item_Description:'',
        Invoice_qty:'',
        Serial_no:'',
        compressor_bar:'',
        Manufacture_date:'',
        Vehicle_no:'',
        Vehicale_Type:'',
        Transporter_name:'',
        Lr_number:'',
        Lr_date:'',
        Address_code:'',
        Address:'',
        Pincode:'',
        Shipment_id:'',
        Ship_date:'',
        Transaction_Type:'',
        created_date:'',
        customer_classification:'',
        hsn_code:'',
        basic_rate:'',
        licarecode:'',
        licare_address:'',
        product_choice:'',
        serial_identification:'',
        lot_number:'',
        order_number:'',
        order_line_number:'',
        wearhouse:'',
        service_type:'',


    });

    const fetchFeedBacklist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/`, {
                headers: {
                    Authorization: token,
                },
            });
            setFeedbackdata(response.data);
        } catch (error) {
            console.error('Error fetching Feedbackdata:', error);
            setFeedbackdata([]);
        }
    };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        Navigate(`/feedbackreportview/${encrypted}`)
    };

    useEffect(() => {
        fetchFeedBacklist();
    }, []);

    useEffect(() => {
        if (Feedbackdata.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: false,
                info: true,
                lengthChange: false,
                autoWidth: false,
                responsive: true,
                fixedHeader: true,
                fixedColumns: {
                    left: 5,
                },
                keys: true,
                select: true,
                dom: '<"d-flex justify-content-between"<"table-title"><"search-box"f>>t<"d-flex justify-content-between"ip>',
                language: {
                    search: '', // Remove the "Search:" label
                    searchPlaceholder: 'Search...', // Add placeholder text
                },

            });

            // Cleanup: Destroy DataTable instance before reinitializing when Quotationdata changes
            return () => {
                table.destroy();
            };
        }
    }, [Feedbackdata]);
    const navigate = useNavigate();

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Feedbackdata.map(user => ({
            "Customer ID": user.customer_id,
            "Ticket Number": user.ticket_no,
            "Email": user.email,
            "Rating 1": user.rating1,
            "Rating 2": user.rating2,
            "Remarks": user.remark, // Add fields you want to export
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
                                            <th width="10%">Customer Id</th>
                                            <th width="10%">Ticket Number</th>
                                            <th width="10%">Email</th>
                                            <th width="10%">Rating 1</th>
                                            <th width="10%">Rating 2</th>
                                            <th width="10%">Remark</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Feedbackdata.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.customer_id}</td>
                                                <td>{item.ticket_no}</td>
                                                <td>{item.email}</td>
                                                <td>{item.rating1}</td>
                                                <td>{item.rating2}</td>
                                                <td>{item.remark}</td>
                                                {/*                                                 
                                                       <td>
       
                                                           <button
                                                               className='btn'
                                                               onClick={() => sendtoedit(item.id)}
                                                               title="Edit"
                                                               style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                               disabled={roleaccess > 3 ? false : true}
                                                           >
                                                               <FaEye />
                                                           </button>
       
                                                       </td> */}
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