import { SyncLoader } from 'react-spinners';
import * as XLSX from "xlsx";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrash, FaEye } from 'react-icons/fa';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useSelector } from 'react-redux';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from '../../Layout/UseAxiosLoader';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";

export function Complaintlist(params) {

  const [Complaintdata, setComplaintdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage
  const licare_code = localStorage.getItem("licare_code"); // Get token from localStorage
  const [currentPage, setCurrentPage] = useState(1);
  const [excelData, setExcelData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const { loaders, axiosInstance } = useAxiosLoader();
  const [loader, setLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const handlePageChange = (page) => {

    setCurrentPage(page);
    fetchComplaintlist(page); // Fetch data for the new page
  };

  const [formData, setFormData] = useState({
    title: '',
    cfranchise_id: '',
    password: '',
    email: '',
    mobile_no: '',
    Priority: '',
  });
  const [searchFilters, setSearchFilters] = useState({
    fromDate: '',
    toDate: '',
    customerName: '',
    customerEmail: '',
    serialNo: '',
    productCode: '',
    customerMobile: '',
    ticketno: '',
    status: '',
    customerID: '',
    csp: '',
    msp: '',
    mode_of_contact: '',
    customer_class: '',
    upcoming: '',
    ticket_type: '',

  });



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/\//g, '-');
  };



  const fetchComplaintlist = async (page) => {
    try {
      // Build the params object dynamically
      const params = {
        page: page,
        pageSize: pageSize,
        licare_code: licare_code,
        role: decryptedRole
      };

      // Add search filters dynamically to params
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) { // Only add if the value is not empty
          params[key] = value;
        }
      });


      // Send the request with the built params
      const response = await axiosInstance.get(`${Base_Url}/getcomplainlist`, {
        headers: {
          Authorization: token, // Send token in headers
        },
        params: params, // Pass the dynamic params object
      });

      // Filter out 'Cancelled' complaints by default
      const filteredComplaints = response.data.data.filter(complaint =>
        !['Cancelled'].includes(complaint.call_status)
      );



      // Update state
      setComplaintdata(response.data.data); // Full data
      setFilteredData(filteredComplaints); // Filtered data
      setTotalCount(response.data.totalCount); // Total count

    } catch (error) {
      console.error('Error fetching Ticketdata:', error);
      setComplaintdata([]);
      setFilteredData([]);
      // navigate('/login')
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

      params.append('licare_code', licare_code)
      params.append('role', decryptedRole)


      const response = await axiosInstance.get(`${Base_Url}/getcomplainlist?${params}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setFilteredData(response.data.data);
      setComplaintdata(response.data.data);
      setTotalCount(response.data.totalCount);

    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setComplaintdata([]);
      setFilteredData([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Filter changed:', name, value); // Debug log
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
    setSearchFilters({});
    fetchComplaintlist(); // Reset to original data
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
            "TicketNo": "ticket_no",
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



      axios.post(`${Base_Url}/uploadtickets`, { jsonData: jsonData })
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

  const edit = async (id) => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/requestengineer/${id}`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });
      setFormData(response.data)
      setIsEdit(true);
      console.log(response.data);
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  useEffect(() => {
    fetchComplaintlist();
  }, []);

  const navigate = useNavigate();

  const isActionDisabled = (status) => {
    return ['Closed', 'Cancelled'].includes(status);
  };



  // This is for tab section

  const addInTab = (ticket_no, ticket_id) => {
    // Retrieve the existing array of ticket numbers, or initialize as an empty array
    const prevTickets = JSON.parse(localStorage.getItem('tabticket')) || [];

    // Check if the ticket already exists in the array
    const isTicketExists = prevTickets.some(
      (ticket) => ticket.ticket_id === ticket_id
    );

    // Add the current ticket number to the array only if it doesn't already exist
    if (!isTicketExists) {
      prevTickets.push({
        ticket_id: ticket_id,
        ticket_no: ticket_no,
      });

      // Store the updated array back in localStorage
      localStorage.setItem('tabticket', JSON.stringify(prevTickets));
    }
  };




  const sendtoedit = async (id) => {
    // alert(id)
    id = id
    let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // navigate(`/quotation/${encrypted}`)
    navigate(`/registercomaplaint/${encrypted}`)
  };

  const sendtoedit123 = async (id) => {
    // alert(id)
    id = id.toString()
    let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    // navigate(`/quotation/${encrypted}`)
    navigate(`/complaintview/${encrypted}`)
  };

  // export to excel 
  const exportToExcel = async () => {
    // Check if From and To Dates are selected
    if (!searchFilters.fromDate || !searchFilters.toDate) {
      alert("Please select both From Date and To Date.");
      return;
    }

    try {
      // Convert From and To Date to the desired format (if necessary)
      const fromDate = new Date(searchFilters.fromDate).toISOString().split('T')[0];
      const toDate = new Date(searchFilters.toDate).toISOString().split('T')[0];

      // Fetch all ticket data based on From and To Date filter, without pagination
      const response = await axiosInstance.get(`${Base_Url}/getcomplaintexcel`, {
        headers: {
          Authorization: token,
        },
        params: {
          pageSize: 10000, // Large page size to fetch all records without pagination (you can adjust this)
          page: 1,         // Fetch from page 1
          fromDate: fromDate,
          toDate: toDate,
          licare_code: licare_code, // Ensure licare_code is sent as before
        },
      });


      const allTicketData = response.data.data;

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Convert data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(
        allTicketData.map((item) => {
          if (role_id == 2 || role_id == 8 || role_id == 12) {
            return {
              TicketNo: item.ticket_no,
              TicketDate: item.ticket_date ? formatDate(item.ticket_date) : '',
              CustomerId: item.customer_id,
              Salutation: item.salutation,
              CustomerName: item.customer_name,
              Address: item.address,
              State: item.state,
              City: item.city,
              District: item.area,
              Pincode: item.pincode,
              CustomerClass: item.customer_class,
              CustomerMobile: item.customer_mobile,
              AlternateMobileNo: item.alt_mobile,
              CustomerType: item.call_type,
              CustomerEmail: item.customer_email,
              TicketType: item.ticket_type,
              ModelNumber: item.ModelNumber,
              SerialNo: item.serial_no,
              PurchaseDate: item.purchase_date ? formatDate(item.purchase_date) : '',
              WarrantyStatus: item.warranty_status,
              Ageing: item.ageingdays,
              CallStatus: item.call_status,
              SubCallStatus: item.sub_call_status,
              FaultDescription: item.specification,
              Remark: item.final_remark,
              FinalRemark: item.final_remark?.match(/<b>Remark:<\/b>\s*([^<]*)/i)?.[1].trim() || '',
              FieldCompleteDate: item.closed_date ? formatDate(item.closed_date) : '',
              AdditionalInfo: item.call_remark,
              MotherBranch: item.mother_branch,
              ServicePartner: item.sevice_partner,
              ChildServicePartner: item.child_service_partner,
              EngineerName: item.assigned_to,
              CallChargeable: item.call_charges,
              CallPriority: item.call_priority,
              TOTP: item.totp,

            };
          }

          return {
            TicketNo: item.ticket_no,
              TicketDate: item.ticket_date ? formatDate(item.ticket_date) : '',
              CustomerId: item.customer_id,
              Salutation: item.salutation,
              CustomerName: item.customer_name,
              Address: item.address,
              State: item.state,
              City: item.city,
              District: item.area,
              Pincode: item.pincode,
              CustomerClass: item.customer_class,
              CustomerMobile: item.customer_mobile,
              AlternateMobileNo: item.alt_mobile,
              CustomerType: item.call_type,
              CustomerEmail: item.customer_email,
              TicketType: item.ticket_type,
              ModelNumber: item.ModelNumber,
              SerialNo: item.serial_no,
              PurchaseDate: item.purchase_date ? formatDate(item.purchase_date) : '',
              WarrantyStatus: item.warranty_status,
              Ageing: item.ageingdays,
              CallStatus: item.call_status,
              SubCallStatus: item.sub_call_status,
              FaultDescription: item.specification,
              Remark: item.final_remark,
              FinalRemark: item.final_remark?.match(/<b>Remark:<\/b>\s*([^<]*)/i)?.[1].trim() || '',
              FieldCompleteDate: item.closed_date ? formatDate(item.closed_date) : '',
              AdditionalInfo: item.call_remark,
              MotherBranch: item.mother_branch,
              ServicePartner: item.sevice_partner,
              ChildServicePartner: item.child_service_partner,
              EngineerName: item.assigned_to,
              CallChargeable: item.call_charges,
              CallPriority: item.call_priority,
          }

        })
      );


      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "TicketList");

      // Export the workbook
      XLSX.writeFile(workbook, "TicketList.xlsx");
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
  const role_id = decryptedRole
  const roledata = {
    role: decryptedRole,
    pageid: String(41)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (

    <>
      {roleaccess > 1 ? <div className="row mp0">

        {loaders && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SyncLoader loading={loaders} color="#FFFFFF" />
          </div>
        )}
        <div className="searchFilter" onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission if inside a form
            applyFilters();
          }
        }}>

          <div className='m-3'>

            <div className="row mb-3">
              <div className="col-md-2">
                <div className="form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="fromDate"
                    value={searchFilters.fromDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="toDate"
                    value={searchFilters.toDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Ticket No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ticketno"
                    value={searchFilters.ticketno}
                    placeholder="Search by ticket no"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>Customer ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerID"
                    value={searchFilters.customerID}
                    placeholder="Search by customer Id"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerName"
                    value={searchFilters.customerName}
                    placeholder="Search by customer name"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>


            </div>

            {/* second row of filter */}

            <div className="row mb-3">

              <div className="col-md-2">
                <div className="form-group">
                  <label>Serial No</label>
                  <input
                    type="text"
                    className="form-control"
                    name="serialNo"
                    value={searchFilters.serialNo}
                    placeholder="Search by serial no"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Model No.</label>
                  <input
                    type="text"
                    className="form-control"
                    name="productCode"
                    value={searchFilters.productCode}
                    placeholder="Search by model no"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Call Status</label>
                  <select
                    className="form-control"
                    name="status"
                    value={searchFilters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Select Status</option>

                    <option value="Open">Open</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Approval">Approval</option>
                    <option value="Spares">Spares</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                    <option value="In Process">In Process</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>Customer Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerMobile"
                    value={searchFilters.customerMobile}
                    placeholder="Search by customer mobile"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>Customer Email</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerEmail"
                    value={searchFilters.customerEmail}
                    placeholder="Search by customer email"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>


            </div>

            {/* Third row of filter */}

            <div className="row mb-3">

              <div className="col-md-2">
                <div className="form-group">
                  <label>Master Service Partner</label>
                  <input
                    type="text"
                    className="form-control"
                    name="msp"
                    value={searchFilters.msp}
                    placeholder="Search by Msp"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Child Service partner</label>
                  <input
                    type="text"
                    className="form-control"
                    name="csp"
                    value={searchFilters.csp}
                    placeholder="Search by Csp"
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Call Category</label>
                  <select
                    className="form-control"
                    name="mode_of_contact"
                    value={searchFilters.mode_of_contact}
                    onChange={handleFilterChange}
                  >
                    <option value=""> SELECT</option>
                    <option value="Call">Call</option>
                    <option value="SMS">SMS</option>
                    <option value="Email">Email</option>
                    <option value="In Person">InPerson</option>
                  </select>
                </div>
              </div>


              <div className="col-md-2">
                <div className="form-group">
                  <label>Customer Classification</label>
                  <select
                    className="form-control"
                    name="customer_class"
                    value={searchFilters.customer_class}
                    onChange={handleFilterChange}
                  >
                    <option value=""> SELECT</option>
                    <option value="Import">Import</option>
                    <option value="Consumer">Consumer</option>
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Upcoming tickets</label>
                  <select
                    className="form-control"
                    name="upcoming"
                    value={searchFilters.upcoming}
                    onChange={handleFilterChange}
                  >
                    <option value=""> SELECT</option>
                    <option value="upcoming">Yes</option>
                    <option value="current">no</option>
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <div className="form-group">
                  <label>Ticket Type</label>
                  <select
                    className="form-control"
                    name="ticket_type"
                    value={searchFilters.ticket_type}
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

              <div className="col-md-12 d-flex justify-content-end align-items-center mt-3 "  >

                <div className="form-group ">
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

            {/* No Record Found Message */}


            {/* Table */}
          </div>
        </div>

        <div className="col-md-12 col-12">
          <div className="card mb-3 tab_box">
            <div className="card-body" style={{ flex: "1 1 auto", padding: "13px 28px" }}>
              {/* Search Filters */}




              <div className="gridbox">

                <table className="table">
                  <thead>
                    <tr >
                      <th>#</th>
                      <th>Ticket No.</th>
                      <th>Ticket Date</th>
                      <th>Customer ID</th>
                      <th>Customer Name</th>
                      <th>Model No</th>
                      <th>Serial No</th>
                      <th>Age</th>
                      <th>Assigned Users</th>
                      <th>Status</th>
                      <th>Call Priority</th>
                      {roleaccess > 3 ? <th>Edit</th> : null}
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const displayIndex = (currentPage - 1) * pageSize + index + 1;  // Adjusted index for pagination
                      const rowStyle = {
                        backgroundColor: item.call_priority == "HIGH" ? "#d4edda" : item.call_priority == "REGULAR" ? "#transparent" : "transparent",
                      };
                      return (
                        <tr key={item.id} >
                          <td style={rowStyle}>{displayIndex}</td>  {/* Use displayIndex for correct pagination */}
                          <td style={rowStyle}>{item.ticket_no}</td>
                          <td style={rowStyle}>{formatDate(item.ticket_date)}</td>
                          <td style={rowStyle}>{item.customer_id}</td>
                          <td style={rowStyle}>{item.customer_name}</td>
                          <td style={rowStyle}>{item.ModelNumber}</td>
                          <td style={rowStyle}>{item.serial_no}</td>
                          <td style={rowStyle}>{item.ageingdays}</td>
                          <td style={rowStyle}>{item.assigned_to}</td>
                          <td style={rowStyle}>{item.call_status}</td>
                          <td style={rowStyle}>{item.call_priority}</td>
                          {roleaccess > 3 ? <td style={rowStyle}>
                            <button
                              className='btn'
                              // onClick={() => navigate(`/registercomaplaint/${item.ticket_no}`)}
                              onClick={() => sendtoedit(item.ticket_no)}
                              disabled={isActionDisabled(item.call_status)}
                              title={isActionDisabled(item.call_status) ? "Cannot edit closed or cancelled ticket" : "Edit"}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: isActionDisabled(item.call_status) ? 'gray' : 'blue',
                                fontSize: '20px',
                                cursor: isActionDisabled(item.call_status) ? 'not-allowed' : 'pointer'
                              }}

                            >
                              <FaPencilAlt />
                            </button>
                          </td> : null}
                          <td style={rowStyle}>
                            <button
                              className='btn'
                              onClick={() => {
                                addInTab(item.ticket_no, item.id)
                                sendtoedit123(item.id)

                              }}
                              title="View"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'blue',
                                fontSize: '20px',
                                cursor: 'pointer'
                              }}
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      );
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
    </>
  );
}

export default Complaintlist;
