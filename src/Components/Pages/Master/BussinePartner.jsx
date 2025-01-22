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

export function BussinePartner(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const [Feedbackdata, setFeedbackdata] = useState([]);
    const token = localStorage.getItem("token");


    const fetchFeedBacklist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getbussinesspartner`, {
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

  



    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Feedbackdata.map(user => ({
            "Bp Code": user.Bp_code,
            "Title": user.title,
            "Partner name": user.partner_name,
            "Contact person": user.contact_person,
            "Email": user.email,
            "Mobile": user.mobile_no, 
            "Address": user.address, 
            "Website": user.webste, 
            "Gst No": user.gstno, 
            "Pan No": user.panno, 
            "Bank name": user.bankname, 
            "Bank Ac": user.bankacc, 
            "Bank IFSC": user.bankifsc, 
            "Bank Address": user.bankaddress, 
            "Licare Id": user.Licare_Ac_Id, 
            "Licare Code": user.Licare_code, 
            "Vendor Name": user.Vendor_Name, 
            "With Liebherr": user.withliebher, 
            "Last Working Date": user.lastworkingdate, 
            "Contract Active": user.contractactive, 
            "Contract Expire": user.contractexpire, 
        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bussiness_Partner Report");

        // Export the workbook
        XLSX.writeFile(workbook, "Bussiness_Partner.xlsx");
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
            <AllocationTab/>
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
                                            <th width="10%">Bp Code</th>
                                            <th width="10%">Title</th>
                                            <th width="10%">Partner name</th>
                                            <th width="10%">Contact person</th>
                                            <th width="10%">Email</th>
                                            <th width="10%">Mobile</th>
                                            <th width="10%">Address</th>
                                            <th width="10%">Web Site</th>
                                            <th width="10%">Gst No</th>
                                            <th width="10%">Pan No</th>
                                            <th width="10%">Bank name</th>
                                            <th width="10%">Bank Ac</th>
                                            <th width="10%">Bank Ifsc</th>
                                            <th width="10%">Bank Address</th>
                                            <th width="10%">Licare Id</th>
                                            <th width="10%">Licare Code</th>
                                            <th width="10%">Vendor Name</th>
                                            <th width="10%">With Liebherr</th>
                                            <th width="10%">Last Working Date</th>
                                            <th width="10%">Contract Active</th>
                                            <th width="10%">Contract Expire</th>


                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Feedbackdata.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.Bp_code}</td>
                                                <td>{item.title}</td>
                                                <td>{item.partner_name}</td>
                                                <td>{item.contact_person}</td>
                                                <td>{item.email}</td>
                                                <td>{item.mobile_no}</td>
                                                <td>{item.address}</td>
                                                <td>{item.webste}</td>
                                                <td>{item.gstno}</td>
                                                <td>{item.panno}</td>
                                                <td>{item.bankname}</td>
                                                <td>{item.bankacc}</td>
                                                <td>{item.bankifsc}</td>
                                                <td>{item.bankaddress}</td>
                                                <td>{item.Licare_Ac_Id}</td>
                                                <td>{item.Licare_code}</td>
                                                <td>{item.Vendor_Name}</td>
                                                <td>{item.withliebher}</td>
                                                <td>{item.lastworkingdate}</td>
                                                <td>{item.contractactive}</td>
                                                <td>{item.contractexpire}</td>
                                               
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