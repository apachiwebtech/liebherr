import axios from "axios";
import React, { useEffect, useState } from "react";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import * as XLSX from "xlsx";
import AllocationTab from "./AllocationTab";

const PincodeAllocation = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [excelData, setExcelData] = useState([]);
  const [Pincodedata, setPincodedata] = useState([]);
  const [loader, setLoader] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {

    setCurrentPage(page);
    fetchPincodelist(page); // Fetch data for the new page
  };
  const [formData, setFormData] = useState({
    pincode: '',
    msp_name: '',
    csp_name: '',
    customer_classification: '',
    call_type: '',
    country: '',
    region: '',
    state: '',
    city: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    pincode: '',
    msp_name: '',
    csp_name: '',
    customer_classification: '',
    call_type: '',
    country: '',
    region: '',
    state: '',
    city: '',
  });
  const fetchPincodelist = async (page) => {
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
      const response = await axiosInstance.get(`${Base_Url}/getpincodelist?${params.toString()}`, {
        headers: {
          Authorization: token,
        },
      });
      setPincodedata(response.data.data);
      setFilteredData(response.data.data);
      // Store total count for pagination logic on the frontend
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching Quotationdata:', error);
      setPincodedata([]);
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

      const response = await axiosInstance.get(`${Base_Url}/getpincodelist?${params}`, {
        headers: {
          Authorization: token,
        },
      }
      );
      setPincodedata(response.data.data);
      setFilteredData(response.data.data);
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
    fetchPincodelist();
  }, []);
  //export to excel
  const exportToExcel = async () => {
    try {
      // Fetch all customer data without pagination
      const response = await axiosInstance.get(`${Base_Url}/getpincodelist`, {
        headers: {
          Authorization: token,
        },
        params: {
          pageSize: totalCount, // Fetch all data
          page: 1, // Start from the first page
        },
      });
      const allPincodedata = response.data.data;
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(allPincodedata.map(user => ({

        "PIncode": user.pincode,
        "Region": user.region,
        "Country": user.country,
        "State": user.state,
        "City": user.city,
        "MotherBranch": user.mother_branch,
        "ResidentBranch": user.resident_branch,
        "AreaManager": user.area_manager,
        "LocalManager": user.local_manager,
        "CustomerClassification": user.customer_classification,
        "ClassCity": user.class_city,
        "CspName": user.csp_name,
        "MspName": user.msp_name,
        "CallType": user.call_type,
        "MspCode": user.msp_code,
        "CspCode": user.csp_code,



      })));

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "PincodeAllocation");

      // Export the workbook
      XLSX.writeFile(workbook, "PincodeAllocation.xlsx");
    } catch (error) {
      console.error("Error exporting data to Excel:", error);
    }
  };





  const importexcel = (event) => {
    setLoader(true);
    const file = event?.target?.files ? event.target.files[0] : null;

    if (!file) {
      alert("Please upload an Excel file first!");
      setLoader(false);  // Stop loader if no file is selected
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        console.log("Sheet Loaded:", sheet);

        const chunkSize = 70000; // Process in smaller chunks to avoid memory issues
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });



        // Column mapping function
        const mapKeys = (obj) => {
          const keyMapping = {
            "RESIDENT BRANCH": "resident_branch",
          };

          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
              keyMapping[key] || key.toLowerCase().replace(/\s+/g, "_"),
              String(value),
            ])
          );
        };

        let processedData = [];
        for (let i = 0; i < jsonData.length; i += chunkSize) {
          const chunk = jsonData.slice(i, i + chunkSize).map(mapKeys);
          console.log(`Processing chunk ${i / chunkSize + 1}`);
          processedData.push(...chunk);

          // Simulate async processing to avoid UI freeze
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        setExcelData(processedData);
        console.log("Processed Data:", processedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("An error occurred while processing the file.");
      } finally {
        setLoader(false);  // Stop loader after processing completes or if an error occurs
      }
    };

    reader.onerror = () => {
      alert("Failed to read file!");
      setLoader(false);  // Stop loader if file reading fails
    };

    reader.readAsArrayBuffer(file);
  };
  const uploadexcel = () => {
    setLoader(true);

    try {
      // Ensure excelData is converted to JSON string before encryption
      const jsonData = JSON.stringify(excelData);



      axios.post(`${Base_Url}/uploadpinexcel`, { jsonData: jsonData })
        .then((res) => {
          if (res.data) {
            alert("Uploaded successfully!");
          }
          console.log(res);
        })
        .catch((err) => {
          console.error("Upload error:", err);
          alert("Error uploading file. Please try again.");
        })
        .finally(() => {
          setLoader(false);
        });

    } catch (error) {
      console.error("Encryption error:", error);
      alert("Error during encryption.");
      setLoader(false);
    }
  };
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
      <AllocationTab />
      {(loaders || loader) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders || loader} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="searchFilter">

        <div className="m-3">

        <div className="row mb-3">

          <div className="col-md-2">
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                name="pincode"
                value={searchFilters.pincode}
                placeholder="Search by Pincode"
                onChange={handleFilterChange}
              />
            </div>
          </div>


          <div className="col-md-2">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={searchFilters.country}
                placeholder="Search by Country"
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
                className="form-control"
                name="region"
                value={searchFilters.region}
                placeholder="Search by Region"
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={searchFilters.state}
                placeholder="Search by State"
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="col-md-2">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={searchFilters.city}
                placeholder="Search by City "
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Customer Classification</label>
              <select
                className="form-control"
                name="customer_classification"
                value={searchFilters.customer_classification}
                onChange={handleFilterChange}
              >
                <option value=""> SELECT</option>
                <option value="Import">IMPORT</option>
                <option value="Consumer">CONSUMER</option>
              </select>
            </div>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-2">
            <div className="form-group">
              <label>Call Status</label>
              <select
                className="form-control"
                name="call_type"
                value={searchFilters.call_type}
                onChange={handleFilterChange}
              >
                <option value="">Select Status</option>

                <option value="Installation">INSTALLATION</option>
                <option value="Breakdown">BREAKDOWN</option>
                <option value="Visit">VISIT</option>
                <option value="Helpdesk">HELDESK</option>
                <option value="Maintenance">MAINTENANCE</option>
                <option value="Demo">DEMO</option>

              </select>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Msp Name</label>
              <input
                type="text"
                className="form-control"
                name="msp_name"
                value={searchFilters.msp_name}
                placeholder="Search by Msp Name"
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <label>Csp Name</label>
              <input
                type="text"
                className="form-control"
                name="csp_name"
                value={searchFilters.csp_name}
                placeholder="Search by Csp Name"
                onChange={handleFilterChange}
              />
            </div>
          </div>



        </div>
        <div className="row mb-3">
          <div className="col-md-12 d-flex justify-content-end align-items-center mt-3">
            <div className="form-group">
              <input type="file" accept=".xlsx, .xls" onChange={importexcel} />
              <button className="btn btn-primary" onClick={uploadexcel}
                style={{
                  marginLeft: '-100px',
                }}>
                Import Pincode Allocation
              </button>

            </div>
            <div className="form-group">
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
        </div>
        </div>
        <div className=" col-md-12 col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              <div className='table-responsive'>
                <table id="example" className="table table-striped">
                  <thead>
                    <tr>
                      <th width="3%">#</th>
                      <th width="5%">Pincode</th>
                      <th width="5%">Country</th>
                      <th width="5%">Region</th>
                      <th width="5%">State</th>
                      <th width="5%">City</th>
                      <th width="10%">Msp Name</th>
                      <th width="10%">Csp Name</th>
                      <th width="10%">Customer Classification</th>
                      <th width="10%">Call Type</th>

                    </tr>
                  </thead>
                  <tbody>
                    {Pincodedata.map((item, index) => {
                      const displayIndex = (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr key={item.id}>
                          <td >{displayIndex}</td>
                          <td>{item.pincode}</td>
                          <td>{item.country}</td>
                          <td>{item.region}</td>
                          <td>{item.state}</td>
                          <td>{item.city}</td>
                          <td>{item.msp_name}</td>
                          <td>{item.csp_name}</td>
                          <td>{item.customer_classification}</td>
                          <td>{item.call_type}</td>
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

export default PincodeAllocation;
