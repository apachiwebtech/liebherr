import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Ratecardtabs from "./Ratecardtabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import * as XLSX from "xlsx";

const Ratecard = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [excelData, setExcelData] = useState([]);
  const licare_code = localStorage.getItem("licare_code");
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {

    setCurrentPage(page);
    fetchUsers(page); // Fetch data for the new page
  };



  const [searchFilters, setSearchFilters] = useState({
    class_city: '',
    class_type: '',
    ProductType: '',
    ProductLine: '',
    ProductClass: '',
  });

  const fetchUsers = async (page) => {
    try {
      const params = new URLSearchParams();
      // Add the page and pageSize parameters
      params.append('page', page || 1); // Current page number
      params.append('pageSize', pageSize); // Page size
      params.append('licare_code', licare_code); // Page size


      // Add all filters to params if they have values
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) { // Only add if value is not empty
          params.append(key, value);
        }
      });
      const response = await axiosInstance.get(`${Base_Url}/getratedata?${params.toString()}`, {
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
      console.error('Error fetching Feedbackdata:', error);
      setUsers([]);
      setFilteredData([]);
    } finally {
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

      const response = await axiosInstance.get(`${Base_Url}/getratedata?${params}`, {
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
  const navigate = useNavigate()

  // Step 2: Add form validation function
  const sendtoedit = async (id) => {
    id = id.toString()
    // let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    // encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    navigate(`/addrate/${id}`)
  };


  const deleted = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete ?");

    if (confirm) {
      try {
        const response = await axiosInstance.post(`${Base_Url}/deleteratedata`, { id }, {
          headers: {
            Authorization: token, // Send token in headers
          },
        });
        // alert(response.data[0]);
        // window.location.reload();
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };





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

    const data = {
      excelData: transformData(excelData), // Keeping JSON.stringify
      created_by: localStorage.getItem("licare_code"),
    };

    axiosInstance.post(`${Base_Url}/uplaodratecardexcel`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        if (res.data) {
          alert("Uploaded")
        }
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // export to excel 
  const exportToExcel = () => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({

      "RateCardMatrix": user.Ratecard,
      "CspCode": user.csp_code,
      "call_type": user.call_type,
      "Sub_Call_Type": user.sub_call_type,
      "Warranty_Type": user.warranty_type,
      "ItemCode": user.item_code,
      "Class_city": user.class_city,
      "Engineer_Level": user.engineer_level,
      "ProductType": user.ProductType,
      "ProductLine": user.ProductLine,
      "ProductClass": user.ProductClass,
      "Within_24_Hours": user.Within_24_Hours,
      "Within_48_Hours": user.Within_48_Hours,
      "Within_96_Hours": user.Within_96_Hours,
      "MoreThan96_Hours": user.MoreThan96_Hours,
      "gas_charging": user.gas_charging,
      "transportation": user.transportation,



    })));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "RateCard");

    // Export the workbook
    XLSX.writeFile(workbook, "RateCard.xlsx");
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
    pageid: String(37)
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
        <div className="col-md-12 col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div className="row mb-3">

                <div className="col-md-2">
                  <div className="form-group">
                    <label>Call Type</label>
                    <select
                      className="form-control"
                      name="call_type"
                      value={searchFilters.call_type}
                      onChange={handleFilterChange}
                    >
                      <option value=""> SELECT</option>
                      <option value="INSTALLATION">INSTALLATION</option>
                      <option value="BREAKDOWN">BREAKDOWN</option>
                      <option value="VISIT">VISIT</option>
                      <option value="DEMO">DEMO</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="HELPDESK">HELPDESK</option>
                    </select>
                  </div>
                </div>


                <div className="col-md-2">
                  <div className="form-group">
                    <label>Class City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="class_city"
                      value={searchFilters.class_city}
                      placeholder="Search by Class City"
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
                      name="ProductType"
                      value={searchFilters.ProductType}
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
                      name="ProductLine"
                      value={searchFilters.ProductLine}
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
                      name="ProductClass"
                      value={searchFilters.ProductClass}
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
                      Import Rate Card
                    </button> : null}
                    <button
                      className="btn btn-primary"
                      onClick={exportToExcel}
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
                      <th width="10%">Call Type</th>
                      <th width="10%">Class city</th>
                      <th width="10%">Product Type</th>
                      <th width="10%">Product Line</th>
                      <th width="10%">Product Class</th>
                      {roleaccess > 3 ? <th width="5%">Edit</th> : null}
                      {roleaccess > 4 ? <th width="5%">Delete</th> : null}

                    </tr>
                  </thead>
                  <tbody>

                    {users.map((item, index) => {
                      const displayIndex = (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr key={item.id}>
                          <td>{displayIndex}</td>
                          <td>{item.call_type}</td>
                          <td>{item.class_city}</td>
                          <td>{item.ProductType}</td>
                          <td>{item.ProductLine}</td>
                          <td>{item.ProductClass}</td>
                          <td>
                            {roleaccess > 3 ?
                              <button
                                className='btn'
                                onClick={() => sendtoedit(item.id)}
                                title="Edit"
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'blue', fontSize: '20px' }}
                              >
                                <FaPencilAlt />
                              </button>
                              : null}
                          </td>
                          <td>
                            {roleaccess > 4 ? <td >
                              <button
                                className='btn'
                                onClick={() => deleted(item.id)}
                                title="Delete"
                                style={{ backgroundColor: 'transparent', border: 'none', color: 'red', fontSize: '20px' }}
                                disabled={roleaccess > 4 ? false : true}
                              >
                                <FaTrash />
                              </button>
                            </td> : null}
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
        </div>
      </div> : null}
    </div>
  );
};

export default Ratecard;
