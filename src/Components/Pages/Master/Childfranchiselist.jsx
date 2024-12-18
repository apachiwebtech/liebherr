import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';

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

    const fetchChildfranchisemasterlist = async () => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/getchildFranchiseDetails`,{
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

          const response = axiosInstance.post(`${Base_Url}/updatestatus`, { dataId: dataId },{
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
            fetchChildfranchisemasterlist();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const edit = async (id) => {
        try {
            const response = await axiosInstance.get(`${Base_Url}/requestengineer/${id}`);
            setFormData(response.data)
            setIsEdit(true);
            console.log(response.data);
        } catch (error) {
            console.error('Error editing user:', error);
        }
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

    return (
        <div className="tab-content">
              {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
            <div className="row mp0" >
                <div className="col-md-12 col-12">
                    <div className="card mb-3 tab_box">

                        <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
                        <div className="p-1 text-right">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/Childfranchisemaster")}
                        >
                            Add Child Master Franchise
                        </button>
                        </div>
                            <table className="table">
                                <thead>
                                     <tr>
                                        <th width="3%">#</th>
                                        <th width="15%">Parent Franchise Name</th>
                                        <th width="15%">Child Franchise Name</th>
                                        <th width="8%">Email</th>
                                        <th width="8%">Mobile No</th>
                                        <th width="8%">Licare Code</th>
                                        <th width="15%">Partner Name</th>
                                        <th width="10%">Country</th>
                                        <th width="8%">Region</th>
                                        <th width="10%">State</th>
                                        <th width="10%">District</th>
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
                                                <td >{item.email}</td>
                                                <td >{item.mobile_no}</td>
                                                <td >{item.licare_code}</td>
                                                <td >{item.partner_name}</td>
                                                <td >{item.country_id}</td>
                                                <td >{item.region_id}</td>
                                                <td >{item.geostate_id}</td>
                                                <td >{item.area_id}</td>

                                                <td >
                                                <Link to={`/Childfranchisemaster/${item.id}`}><button
                                                className='btn'
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color:  'blue',
                                                    fontSize: '20px',
                                                    cursor: 'pointer'
                                                }}
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
