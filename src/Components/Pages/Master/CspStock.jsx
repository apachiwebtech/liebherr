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
import GrnTab from './GrnTab';

export function CspStock(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Stockdata, setStockdata] = useState([]);
    const licare_code = localStorage.getItem("licare_code");

    const [formData, setFormData] = useState({
        productname: '',
        stock_quantity: '',

    });


    const fetchStock = async (page) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getstock/${licare_code}`, {
                headers: {
                    Authorization: token,
                },
            }
            );
            setStockdata(response.data);
        } catch (error) {
            console.error('Error fetching Stockdata:', error);
            setStockdata([]);
        }
    };
    useEffect(() => {
        fetchStock();
    }, []);


    const exportToExcel = async () => {



        try {

            // Fetch all customer data without pagination
            const response = await axiosInstance.get(`${Base_Url}/getstock/${licare_code}`, {
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
                    ArticleCode: item.product_code,
                    ArticleDescription: item.productname,
                    PhysicalStock: item.stock_quantity,
                    TotalCSPstock: item.total_stock,
                }))
            );

            // Append the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "CspStock");

            // Export the workbook
            XLSX.writeFile(workbook, "CspStock.xlsx");
        } catch (error) {
            console.error('Error fetching GRN data:', error.response?.data || error.message);
        }
    };




    return (
        <div className="tab-content">
            <GrnTab />

            <div className="row mp0">

                <div className="col-md-12 col-12">
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
                                            <th width="15%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="20%">Physical Stock</th>
                                            <th width="20%">Total CSP stock</th>
                                            <th width="20%">Image</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Stockdata.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.product_code}</td>
                                                    <td>{item.productname}</td>
                                                    <td>{item.stock_quantity}</td>
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
