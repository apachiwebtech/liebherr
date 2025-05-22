import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import Productsparetabs from './Productsparetabs';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import 'datatables.net-responsive';
import 'datatables.net-responsive-bs4/css/responsive.bootstrap4.min.css';
import 'datatables.net-fixedcolumns';
import 'datatables.net-fixedcolumns-bs4/css/fixedColumns.bootstrap4.min.css';
import 'datatables.net-fixedheader';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs4/css/buttons.bootstrap4.min.css';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-keytable';
import 'datatables.net-select';
import Grntab from '../Grn/Grntab';

export function Msl(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Msl, setMslData] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const licare_code = localStorage.getItem("licare_code");
    const [formData, setFormData] = useState({
        msp_name: '',
        msp_code: '',
        csp_code: '',
        csp_name: '',
        item: '',
        item_description: '',
        stock: '',



    });


    const fetchMsl = async (page) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getmsl`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setMslData(response.data);
        } catch (error) {
            console.error('Error fetching Msl:', error);
            setMslData([]);
        }
    };
    useEffect(() => {
        fetchMsl();
    }, []);

    const navigate = useNavigate()

    const sendtoedit = async (id, view) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/addmsl/${encrypted}/${view}`)
    };


    useEffect(() => {
        if (Msl.length > 0) {
            // Initialize DataTable after data is fetched
            const table = $('#example').DataTable({
                destroy: true, // Destroy any existing DataTable instance before reinitializing
                paging: true,
                searching: true,
                ordering: true,
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

            // Cleanup: Destroy DataTable instance before reinitializing when Productdata changes
            return () => {
                table.destroy();
            };
        }
    }, [Msl]);

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
        pageid: String(58)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    const importexcel = (event) => {
        // If triggered by file input
        const file = event?.target?.files ? event.target.files[0] : null;

        // If triggered by button click, use the file uploaded
        if (!file) {
            alert("Please upload an Excel file first!");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
            setExcelData(jsonData);
            console.log("Excel Data Imported:", jsonData);
        };

        reader.readAsBinaryString(file);
    };

    const uploadexcel = () => {
        const transformData = (data) => {
            return data.map((item) => {
                return Object.fromEntries(
                    Object.entries(item).map(([key, value]) => [key, value !== null ? String(value) : ""])
                );
            });
        };

        const jsonData = transformData(excelData);

        const formData = new FormData();
        formData.append("excelData", JSON.stringify(jsonData));  // Assuming backend accepts JSON string
        formData.append("created_by", localStorage.getItem("licare_code"));

        axiosInstance.post(`${Base_Url}/uplaodmslexcel`, formData, {
            headers: {
                Authorization: token,
                // DO NOT manually set 'Content-Type' when using FormData.
            },
        })
            .then((res) => {
                if (res.data) {
                    alert("Uploaded");
                }
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    };


    const exportToExcel = async () => {



        try {

            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getmsl`, {
                headers: {
                    Authorization: token,
                },
            }
            );

            const decryptedData = response.data;
            console.log("Excel Export Data:", decryptedData);
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Convert data to a worksheet
            const worksheet = XLSX.utils.json_to_sheet(
                decryptedData.map((item) => ({
                    MspCode: item.msp_code,
                    MspName: item.msp_name,
                    CspName: item.csp_name,
                    CspCode: item.csp_code,
                    ArticleCode: item.item,
                    ArticleDescription: item.item_description,
                    MSLStock: item.stock,
                    TotalCSPStock: 0,
                }))
            );

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Msl");

            // Export the workbook
            XLSX.writeFile(workbook, "Msl.xlsx");
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
        }
    };





    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <Grntab />

            {roleaccess > 1 ? <div className="row mp0">

                <div className=" col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className="row  mb-3">
                                <div className="col-md-6 d-flex justify-content-start align-items-center mt-3">
                                    <div className="form-group">
                                        {roleaccess > 2 ? <input type="file" accept=".xlsx, .xls" onChange={importexcel} /> : null}
                                        {roleaccess > 2 ? <button className="btn btn-primary" onClick={uploadexcel}>
                                            Import Msl
                                        </button> : null}


                                    </div>
                                </div>
                                <div className="col-md-6 d-flex justify-content-end align-items-center mt-3">
                                    <div className="form-group">
                                        {roleaccess > 2 ? <button className="btn btn-primary" onClick={exportToExcel}>
                                            Export Msl
                                        </button> : null}
                                    </div>
                                </div>
                            </div>

                            <div className='gridbox'>
                                <table id="example" className="table">
                                    <thead>
                                        <tr>
                                            {/* <th width="5%">#</th> */}
                                            <th width="10%">Msp Code</th>
                                            <th width="15%">Msp Name</th>
                                            <th width="10%">Csp Code</th>
                                            <th width="15%">Csp Name</th>
                                            <th width="10%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="10%">Total Csp Stock</th>
                                            <th widht="10%">Edit</th>

                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Msl.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    {/* <td>{index + 1}</td> */}
                                                    <td>{item.msp_code}</td>
                                                    <td>{item.msp_name}</td>
                                                    <td>{item.csp_code}</td>
                                                    <td>{item.csp_name}</td>
                                                    <td>{item.item}</td>
                                                    <td>{item.item_description}</td>
                                                    <td>{item.stock}</td>
                                                    <td>
                                                        {roleaccess > 3 ? (
                                                            <button
                                                                className='btn'
                                                                onClick={() => sendtoedit(item.id, 0)}
                                                                title="Edit"
                                                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                        ) : null}
                                                    </td>                                                </tr>
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
    );
}
