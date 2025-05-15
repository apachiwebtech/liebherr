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
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export function Stock(params) {
    const { loaders, axiosInstance } = useAxiosLoader();
    const token = localStorage.getItem("token");
    const [Stockdata, setStockdata] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [Stock, setStock] = React.useState('');
    const licare_code = localStorage.getItem("licare_code");

    const [formData, setFormData] = useState({
        article_code: '',
        created_by: '',
        csp_code: ''
    });


    const handleClose = () => {
        setOpen(false);
    };

    const fetchStock = async (page) => {
        try {

            const response = await axiosInstance.get(`${Base_Url}/getallstock`, {
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
        pageid: String(57)
    }

    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


    useEffect(() => {
        dispatch(getRoleData(roledata))
    }, [])

    // Role Right End 

    const stockEdit = async (csp_code, product_code) => {
        setOpen(true)
        setFormData({
            article_code: product_code,
            created_by: licare_code,
            csp_code: csp_code
        })

    }

    const updateStock = async () => {

        const data = {
            article_code: formData.article_code,
            created_by: formData.created_by,
            csp_code: formData.csp_code,
            stock : Stock
        }

        try {

            const response = await axiosInstance.post(`${Base_Url}/updateadminstock`,data,{
                headers: {
                    Authorization: token,
                },
            });

            if(response){
                alert("Stock Updated")
                setOpen(false)
                fetchStock()
            }

        } catch (error) {
            console.error('Error fetching Stockdata:', error);
        }

    }



    return (
        <div className="tab-content">
            {loaders && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader loading={loaders} color="#FFFFFF" />
                </div>
            )}
            <Productsparetabs />

            {roleaccess > 1 ? <div className="row mp0">

                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">
                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>

                            <div className='table-responsive'>
                                <table id="" className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="15%">CSP Code</th>
                                            <th width="20%">Article Code</th>
                                            <th width="20%">Article Description</th>
                                            <th width="20%">Physical Stock</th>
                                            <th width="20%">Total CSP stock</th>
                                            <th width="10%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {Stockdata.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.csp_code}</td>
                                                    <td>{item.product_code}</td>
                                                    <td>{item.productname}</td>
                                                    <td>{item.stock_quantity}</td>
                                                    <td>{item.total_stock}</td>
                                                    <td><EditIcon onClick={() => stockEdit(item.csp_code, item.product_code, item.stock_quantity)} /></td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                            </div>
                            <Dialog
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">
                                    {"Update Stock"}
                                </DialogTitle>
                                <DialogContent style={{ height: "100px", width: "400px" }}>
                                    <input
                                        type="number"
                                        min={'0'}
                                        className="form-control"
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={updateStock} autoFocus>
                                        Update
                                    </Button>
                                    <Button onClick={handleClose} autoFocus>
                                        Cancel
                                    </Button>
                                </DialogActions>
                            </Dialog>

                        </div>
                    </div>
                </div>
            </div> : null}
        </div>
    );
}
