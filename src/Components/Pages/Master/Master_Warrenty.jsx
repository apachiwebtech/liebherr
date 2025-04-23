import axios from "axios";
import React, { useEffect, useState } from "react";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Ratecardtabs from "./Ratecardtabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import * as XLSX from "xlsx";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";





const Master_Warrenty = () => {

  const [excelData, setExcelData] = useState([]);
  const { loaders, axiosInstance } = useAxiosLoader();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {

    setCurrentPage(page);
    fetchUsers(page); // Fetch data for the new page
  };

  const [searchFilters, setSearchFilters] = useState({
    item_code: '',
    Service_Type: '',
    Product_Type: '',
    Product_Line: '',
    Product_Class: '',
  });


  const fetchUsers = async (page) => {
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
      const response = await axiosInstance.get(`${Base_Url}/getmasterwarrenty?${params.toString()}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      console.log(decryptedData);
      setUsers(decryptedData);
      setFilteredData(decryptedData);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredData([]);
    }
    finally {
      setLoading(false);  // Stop loader after data is loaded or in case of error
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

      const response = await axiosInstance.get(`${Base_Url}/getmasterwarrenty?${params}`, {
        
        headers: {
          Authorization: token,
        },
      }
      );
      // Decrypt the response data
      const encryptedData = response.data.encryptedData; // Assuming response contains { encryptedData }
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
      setUsers(decryptedData);
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


  useEffect(() => {
    fetchUsers();
  }, []);

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
    // Convert excelData to a string (assuming it's an array or object)

    const transformData = (data) => {
      return data.map((item) => {
        return Object.fromEntries(
          Object.entries(item).map(([key, value]) => [key, value !== null ? String(value) : ""])
        );
      });
    };

    const data = {
      excelData: transformData(excelData),
      created_by: localStorage.getItem("licare_code")
    };

    axiosInstance.post(`${Base_Url}/uploadmasterwarrantyexcel`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {
          alert("Uploaded")
        }
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

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
    pageid: String(38)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 


  return (
    <div className="tab-content">
      <Ratecardtabs />
      {loaders || loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mb-3">

              <div className="col-md-2">
                  <div className="form-group">
                    <label>Item Code</label>
                    <input
                      type="text"
                      className="form-control"
                      name="item_code"
                      value={searchFilters.item_code}
                      placeholder="Search by Item Code"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>


                <div className="col-md-2">
                  <div className="form-group">
                    <label>Service Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Service_Type"
                      value={searchFilters.Service_Type}
                      placeholder="Search by Service Type"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label>Product Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Product_Type"
                      value={searchFilters.Product_Type}
                      placeholder="Search by Product Type"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label>Product Line</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Product_Line"
                      value={searchFilters.Product_Line}
                      placeholder="Search by Product Line"
                      onChange={handleFilterChange}
                    />
                  </div>

                </div>
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Product Class</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Product_Class"
                      value={searchFilters.Product_Class}
                      placeholder="Search by Product Class"
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
                  <div className="form-group">
                    {roleaccess > 2 ? <input type="file" accept=".xlsx, .xls" onChange={importexcel} /> : null}
                    {roleaccess > 2 ? <button className="btn btn-primary" onClick={uploadexcel}>
                      Import Master Warranty
                    </button> : null}
                    <button
                      className="btn btn-primary"
                      // onClick={exportToExcel}
                      style={{
                        marginLeft: '5px',
                      }}
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


              <div className='table-responsive'>
                <table id="example" className="table table-striped">
                  <thead>
                    <tr>
                      <th width="3%">#</th>
                      <th width="10%">Csp_Code</th>
                      <th width="10%">Item_code</th>
                      <th width="10%">Product_Type</th>
                      <th width="10%">Product_Line</th>
                      <th width="10%">Product_Class</th>
                      <th width="10%">Service_Type</th>
                      <th width="10%">Warrenty_year</th>
                      <th width="10%">Compressor_Warrenty</th>
                      <th width="10%">Warrenty_amount</th>
                      <th width="10%">Is_Scheme</th>
                      <th width="10%">Scheme_Name</th>




                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item, index) => {
                      const displayIndex = (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr key={item.id}>
                          <td>{displayIndex}</td>
                          <td>{item.csp_code}</td>
                          <td>{item.item_code}</td>
                          <td>{item.Product_Type}</td>
                          <td>{item.Product_Line}</td>
                          <td>{item.Product_Class}</td>
                          <td>{item.Service_Type}</td>
                          <td>{item.warrenty_year}</td>
                          <td>{item.compressor_warrenty}</td>
                          <td>{item.warrenty_amount}</td>
                          <td>{item.is_scheme}</td>
                          <td>{item.scheme_name}</td>


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
        </div>
      </div> : null}
    </div>
  );
};

export default Master_Warrenty;
