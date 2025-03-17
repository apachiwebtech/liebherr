import axios from 'axios';
import * as XLSX from "xlsx";
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
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

export function Franchisemasterlist(params) {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [Franchisemasterdata, setFranchisemasterdata] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {

    setCurrentPage(page);
    fetchFranchisemasterlist(page); // Fetch data for the new page
  };

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

  const [searchFilters, setSearchFilters] = useState({
    title: '',
    licarecode: '',
    partner_name: '',
    mobile_no: '',
    email: '',

  });



  const fetchFranchisemasterlist = async (page) => {
    try {
      const params = new URLSearchParams();

      // Add the page and pageSize parameters
      params.append('page', page || 1); // Current page number
      params.append('pageSize', pageSize); // Page size

      // Add all filters to params if they have values
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) { // Only add if value is not empty
          params.append(key, value);
        }
      });
      const response = await axiosInstance.get(`${Base_Url}/getmasterfranchiselist?${params.toString()}`, {
        headers: {
          Authorization: token,
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setFranchisemasterdata(decryptedData);
      setFilteredData(decryptedData);
      // Store total count for pagination logic on the frontend
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching franchisemasterdata:', error);
      setFranchisemasterdata([]);
      setFilteredData([]);
    }
  };

  const fetchFilteredData = async () => {
    try {
      const params = new URLSearchParams();

      // Add all filters to params
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) { // Only add if value is not empty
          params.append(key, value);
        }
      });

      console.log('Sending params:', params.toString()); // Debug log

      const response = await axiosInstance.get(`${Base_Url}/getmasterfranchiselist?${params}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setFranchisemasterdata(decryptedData);
      setFilteredData(decryptedData);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setFilteredData([]);
    }
  };



  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const applyFilters = () => {
    console.log('Applying filters:', searchFilters); // Debug log
    fetchFilteredData();
  };

  const resetFilters = () => {
    setSearchFilters({
      title: '',
      licarecode: '',
      partner_name: '',
      mobile_no: '',
      email: '',

    });
    fetchFranchisemasterlist(); // Reset to original data
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


  const navigate = useNavigate()

  // export to excel 
  const exportToExcel = async () => {
    try {
      // Fetch all customer data without pagination
      const response = await axiosInstance.get(`${Base_Url}/getmasterfranchiselist`, {
        headers: {
          Authorization: token,
        },
        params: {
          pageSize: totalCount, // Fetch all data
          page: 1, // Start from the first page
        },
      });

      const decryptedData = CryptoJS.AES.decrypt(response.data.encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
      const allMasterFranchiseData =JSON.parse(decryptedData);
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(allMasterFranchiseData.map(user => ({

        "Name": user.title,
        "ContactPerson": user.contact_person,
        "Email": user.email,
        "MobileNumber": user.mobile_no,
        "Address": user.address,
        "Pincode": user.pincode_id,
        "Country": user.country_id,
        "Region": user.region_id,
        "State": user.geostate_id,
        "District": user.area_id,
        "GeoCity": user.geocity_id,
        "Website": user.webste,
        "GST No": user.gstno,
        "Pan Number": user.panno,
        "Bank Name": user.bankname,
        "BankAccountNumber": user.bankacc,
        "IfscCode": user.bankifsc,
        "WithLiebherr": user.withliebher,
        "LastWorkingDate": user.lastworkinddate,
        "ContractActivationdate": user.contractacti,
        "ContractExpirationDate": user.contractexpir,
        "BankAddress": user.bankaddress,
        "LicareCode": user.licarecode,
        "PartnerName": user.partner_name, // Add fields you want to export

      })));

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "MasterFranchise");

      // Export the workbook
      XLSX.writeFile(workbook, "MasterFranchise.xlsx");
    } catch (error) {
      console.error("Error exporting data to Excel:", error);
    }
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
    pageid: String(20)
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

              <div className="row mb-3">

                <div className="col-md-2">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={searchFilters.title}
                      placeholder="Search by name"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>


                <div className="col-md-2">
                  <div className="form-group">
                    <label>Licare Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="licarecode"
                      value={searchFilters.licarecode}
                      placeholder="Search by Licare code"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile_no"
                      value={searchFilters.mobile_no}
                      placeholder="Search by Mobile Number"
                      onChange={handleFilterChange}
                      pattern="[0-9]{10}"
                      maxLength="10"
                      minLength="10"
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      value={searchFilters.email}
                      placeholder="Search by customer email"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Partner Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="partner_name"
                      value={searchFilters.partner_name}
                      placeholder="Search by Partner name"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>



              </div>
              <div className="row mb-3">
                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                  <div className="form-group">
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
                    >
                      Export to Excel
                    </button>
                    <button
                      className="btn btn-primary mr-2"
                      onClick={applyFilters}
                      style={{
                        marginLeft: '5px',
                      }}
                    >
                      Search
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        window.location.reload()
                      }}
                      style={{
                        marginLeft: '5px',
                      }}
                    >
                      Reset
                    </button>
                    {filteredData.length === 0 && (
                      <div
                        style={{
                          backgroundColor: '#f8d7da',
                          color: '#721c24',
                          padding: '5px 10px',
                          marginLeft: '10px',
                          borderRadius: '4px',
                          border: '1px solid #f5c6cb',
                          fontSize: '14px',
                          display: 'inline-block'
                        }}
                      >
                        No Record Found
                      </div>
                    )}
                  </div>
                </div>
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
                    <th width="5%">View</th>
                  </tr>
                </thead>
                <tbody>

                  {Franchisemasterdata.map((item, index) => {
                    const displayIndex = (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={item.id}>
                        <td >{displayIndex}</td>
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
                            <FaEye />
                          </button>
                        </td>

                      </tr>
                    )
                  })}

                </tbody>
              </table>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{
                    padding: '8px 15px',
                    fontSize: '16px',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage <= 1 ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    padding: '8px 15px',
                    fontSize: '16px',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage >= totalPages ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    transition: 'background-color 0.3s',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  )
}
