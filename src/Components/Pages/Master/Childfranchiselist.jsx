import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


export function ChildFranchiselist(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Franchisemasterdata, setChildfranchisemasterdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        pfranchise_id: "",
        password: "",
        contact_person: '',
        email: "",
        mobile_no: '',
        address: '',
        country_id: '',
        region_id: '',
        state: '',
        area: '',
        city: '',
        pincode_id: '',
        website: '',
        gst_no: '',
        panno: '',
        bank_name: '',
        bank_acc: '',
        bank_ifsc: '',
        with_liebherr: '',
        last_working_date: '',
        contract_acti: '',
        contract_expir: '',
        bank_address: '',
        licarecode: '',
        partner_name: '',
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchChildfranchisemasterlist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getchildFranchiseDetails`, {
                headers: {
                    Authorization: token,
                },
            });
            setChildfranchisemasterdata(response.data);
        } catch (error) {
            console.error('Error fetching franchisemasterdata:', error);
            setChildfranchisemasterdata([]);
        }
    };
    const handleChangestatus = (e) => {
        try {
            const dataId = e.target.getAttribute('data-id');

            const response = axiosInstance.post(`${Base_Url}/updatestatus`, { dataId: dataId }, {
                headers: {
                    Authorization: token,
                },
            });

        } catch (error) {
            console.error("Error editing user:", error);
        }

    };


    const deleted = async (id) => {
        try {
            const response = await axiosInstance.post(`${Base_Url}/deletemasterlist`, { id });
            setFormData({
                title: "",
                password: "",
                contact_person: '',
                email: "",
                mobile_no: '',
                address: '',
                country_id: '',
                region_id: '',
                state: '',
                area: '',
                city: '',
                pincode_id: '',
                website: '',
                gst_no: '',
                panno: '',
                bank_name: '',
                bank_acc: '',
                bank_ifsc: '',
                with_liebherr: '',
                last_working_date: '',
                contract_acti: '',
                contract_expir: '',
                bank_address: '',
                licarecode: '',
                partner_name: '',
            })
            fetchChildfranchisemasterlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/Childfranchisemaster/${encrypted}`)
    };

    useEffect(() => {
        fetchChildfranchisemasterlist();
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

    // export to excel 
    const exportToExcel = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(Franchisemasterdata.map(user => ({

            "Name": user.title,
            "pFranchise_id": user.pfranchise_id,
            "ContactPerson": user.contact_person,
            "Email": user.email,
            "MobileNumber": user.mobile_no,
            "Address": user.address,
            "Pincode": user.pincode_id,
            "Country": user.country_id,
            "Region": user.region_id,
            "State": user.geostate_id,
            "Website": user.webste,
            "GST No": user.gstno,
            "Pan Number": user.panno,
            "Bank Name": user.bankname,
            "BankAccountNumber": user.bankacc,
            "IfscCode": user.bankifsc,
            "WithLiebherr": user.with_liebher,
            "LastWorkingDate": user.lastworkinddate,
            "ContractActivationdate": user.contractacti,
            "ContractExpirationDate": user.contractexpir,
            "BankAddress": user.bankaddress,
            "LicareCode": user.licare_code,
            "PartnerName": user.partner_name,
            "Roles": user.Role // Add fields you want to export

        })));

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "ChildFranchise");

        // Export the workbook
        XLSX.writeFile(workbook, "ChildFranchise.xlsx");
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
        pageid: String(21)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    return (
        <div className="tab-content">
            <Franchisemaster />
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            {roleaccess > 1 ? <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <button
                                className="btn btn-primary"
                                onClick={exportToExcel}
                            >
                                Export to Excel
                            </button>

                            <div className='table-responsive' >
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th width="3%">#</th>
                                            <th width="2%">Parent Franchise Name</th>
                                            <th width="8%"> Name</th>
                                            <th width="3%">Email</th>
                                            <th width="3%">Mobile No</th>
                                            <th width="8%">Licare Code</th>
                                            <th width="8%">Partner Name</th>
                                            <th width="8%">Country</th>
                                            <th width="8%">Region</th>
                                            <th width="8%">State</th>
                                            <th width="5%">District</th>
                                            <th width="5%">Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Franchisemasterdata.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td >{index + 1}</td>
                                                    <td >{item.parentfranchisetitle}</td>
                                                    <td >{item.title}</td>
                                                    <td width="5%" >{item.email}</td>
                                                    <td >{item.mobile_no}</td>
                                                    <td >{item.licare_code}</td>
                                                    <td >{item.partner_name}</td>
                                                    <td >{item.country_id}</td>
                                                    <td >{item.region_id}</td>
                                                    <td >{item.geostate_id}</td>
                                                    <td >{item.area_id}</td>

                                                    <td >
                                                        <button
                                                            className='btn'
                                                            onClick={() => sendtoedit(item.id)}
                                                            title="Edit"
                                                            disabled={roleaccess > 3 ? false : true}
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                        >
                                                            <FaEye />
                                                        </button>
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
                                                </tr>
                                            )
                                        })}

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
