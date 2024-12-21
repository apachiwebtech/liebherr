import axios from 'axios';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import Franchisemaster from './Franchisemaster';
import { SyncLoader } from 'react-spinners';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import CryptoJS from 'crypto-js';

export function Franchisemasterlist(params) {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [Franchisemasterdata, setFranchisemasterdata] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
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
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parse the date string
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/\//g, '-'); // Convert to 'DD-MM-YYYY' format
  };

  const fetchFranchisemasterlist = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getmasterlist`, {
        headers: {
          Authorization: token,
        },
      });
      setFranchisemasterdata(response.data);
    } catch (error) {
      console.error('Error fetching franchisemasterdata:', error);
      setFranchisemasterdata([]);
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
      const response = await axiosInstance.post(`${Base_Url}/deletemasterlist`, { id }, {
        headers: {
          Authorization: token,
        },
      });
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
      fetchFranchisemasterlist();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

    const sendtoedit = async (id) => {
        id = id.toString()
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        navigate(`/Masterfranchise/${encrypted}`)
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
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <div className="row mp0" >
        <div className="col-md-12 col-12">
          <div className="card mb-3 tab_box">

            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className='p-1 text-right'>
                <Link to={`/Masterfranchise`}><button className='btn btn-primary'>Add  Master Franchise </button></Link>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th width="3%">#</th>
                    <th width="2%">Name</th>
                    <th width="8%">Email</th>
                    <th width="8%">Mobile Number</th>
                    <th width="10%">Licare Code</th>
                    <th width="8%">Partner Name</th>
                    <th width="8%">Country</th>
                    <th width="8%">Region</th>
                    <th width="8%">State</th>
                    <th width="8%">District</th>
                    <th width="5%">Edit</th>
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
                        <td >{item.licarecode}</td>
                        <td >{item.partner_name}</td>
                        <td >{item.country_name}</td>
                        <td >{item.region_name}</td>
                        <td >{item.state_name}</td>
                        <td >{item.district_name}</td>

                        <td >
                          <button
                            className='btn'
                             onClick={() => sendtoedit(item.id)}
                            title="Edit"
                            style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                          >
                            <FaPencilAlt />
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
                        {/* <td style={{ padding: "10px" }}>
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
