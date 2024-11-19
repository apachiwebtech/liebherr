import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';

export function Franchisemasterlist(params) {
    const [Franchisemasterdata, setFranchisemasterdata] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        password: "",
        contact_person: '',
        email:"",
        mobile_no:'',
        address:'',
        country_id:'',
        region_id:'',
        state:'',
        area:'',
        city:'',
        pincode_id:'',
        website:'',
        gst_no:'',
        panno:'',
        bank_name:'',
        bank_acc:'',
        bank_ifsc:'',
        with_liebherr:'',
        last_working_date:'',
        contract_acti:'',
        contract_expir:'',
        bank_address:'',
        licarecode:'',
        partner_name:'',
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
    };

    const fetchFranchisemasterlist = async () => {
        try {
            const response = await axios.get(`${Base_Url}/getmasterlist`);
            setFranchisemasterdata(response.data);
        } catch (error) {
            console.error('Error fetching franchisemasterdata:', error);
            setFranchisemasterdata([]);
        }
    };
    const handleChangestatus = (e) => {
        try {
          const dataId = e.target.getAttribute('data-id');
    
          const response = axios.post(`${Base_Url}/updatestatus`, { dataId: dataId });
    
        } catch (error) {
          console.error("Error editing user:", error);
        }
    
      };


    const deleted = async (id) => {
        try {
            const response = await axios.post(`${Base_Url}/deletemasterlist`, { id });
            setFormData({
                title: "",
                password: "",
                contact_person: '',
                email:"",
                mobile_no:'',
                address:'',
                country_id:'',
                region_id:'',
                state:'',
                area:'',
                city:'',
                pincode_id:'',
                website:'',
                gst_no:'',
                panno:'',
                bank_name:'',
                bank_acc:'',
                bank_ifsc:'',
                with_liebherr:'',
                last_working_date:'',
                contract_acti:'',
                contract_expir:'',
                bank_address:'',
                licarecode:'',
                partner_name:'',
            })
            fetchFranchisemasterlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axios.get(`${Base_Url}/requestengineer/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };
    useEffect(() => {
        fetchFranchisemasterlist();
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

    return (
        <div className="tab-content">
            <Franchisemaster />
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                            <div className='p-1 text-right'>
                                <Link to={`/addengineer/requestengineer/`}><button className='btn btn-primary'>Add  Master Franchise </button></Link>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th width="3%">#</th>
                                        <th width="7%">Name</th>
                                        <th width="8%">Email</th>
                                        <th width="20%">Mobile Number</th>
                                        <th width="10%">Licare Code</th>
                                        <th width="5%">Edit</th>                                        <th width="5%">Status</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {Franchisemasterdata.map((item, index) => {
                                        return (
                                            <tr key={item.id}>
                                                <td >{index + 1}</td>
                                                <td >{item.title}</td>
                                                <td >{item.email}</td>
                                                <td >{item.mobile_no}</td>
                                                <td >{item.licare_code}</td>

                                                <td >
                                                    <Link to={`/requestengineer/${item.id}`}> <button
                                                        className='btn'
                                                        onClick={() => {
                                                            // alert(item.id)
                                                            edit(item.id)
                                                        }}
                                                        title="Edit"
                                                        style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                                                    >
                                                        <FaPencilAlt />
                                                    </button></Link>
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
                                                <td style={{ padding: "10px" }}>
                                                    <label class="switch">
                                                        <input
                                                            type="checkbox"
                                                            onChange={handleChangestatus}
                                                            data-id={item.id}
                                                            checked={item.status === 1}  // Check if status is 1 (checked)
                                                            className="status"
                                                        />


                                                        <span class="slider round"></span>
                                                    </label>

                                                </td>
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
    )
}