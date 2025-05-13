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
import GrnTab from './GrnTab';

export function Mslcsp(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Msl, setMslData] = useState([]);
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

            const response = await axiosInstance.get(`${Base_Url}/getmslcsp/${licare_code}`, {
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


    const exportToExcel = async () => {



        try {

            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getmslcsp/${licare_code}`, {
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
            XLSX.utils.book_append_sheet(workbook, worksheet, "CspMsl");

            // Export the workbook
            XLSX.writeFile(workbook, "CspMsl.xlsx");
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
        }
    };

    // Role Right 


    // const Decrypt = (encrypted) => {
    //     encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    //     const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    //     return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
    // };

    // const storedEncryptedRole = localStorage.getItem("Userrole");
    // const decryptedRole = Decrypt(storedEncryptedRole);

    // const roledata = {
    //     role: decryptedRole,
    //     pageid: String(58)
    // }

    // const dispatch = useDispatch()
    // const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    // useEffect(() => {
    //     dispatch(getRoleData(roledata))
    // }, [])

    // Role Right End 





    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <GrnTab />

            <div className="row mp0">

                <div className=" col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='text-right'>
                                <button className='btn btn-primary' onClick={exportToExcel}>Export To Excel</button>
                            </div>
                            <div className='table-responsive'>
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="10%">Msp Code</th>
                                            <th width="10%">Msp Name</th>
                                            <th width="10%">Csp Code</th>
                                            <th width="10%">Csp Name</th>
                                            <th width="10%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="10%">MSL Stock</th>
                                            <th width="10%">Total CSP Stock</th>
                                            <th widht="5%">Image</th>

                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Msl.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.msp_code}</td>
                                                    <td>{item.msp_name}</td>
                                                    <td>{item.csp_code}</td>
                                                    <td>{item.csp_name}</td>
                                                    <td>{item.item}</td>
                                                    <td>{item.item_description}</td>
                                                    <td>{item.stock}</td>
                                                    <td>0</td>
                                                    <td><FaEye /></td>
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
        </div>
    );
}
