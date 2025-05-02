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





    return (
        <div className="tab-content">
            <GrnTab />

            <div className="row mp0">

                <div className="col-md-6 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='table-responsive'>
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">Product Name</th>
                                            <th width="20%">Physical stocks</th>
                                            <th width="20%">Total CSP stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Stockdata.map((item, index) => {
                                            return (
                                            <tr key={item.id}>
                                                <td>{index+1}</td>
                                                <td>{item.productname}</td>
                                                <td>{item.stock_quantity}</td>
                                                <td>0</td>
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
