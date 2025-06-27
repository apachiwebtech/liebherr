import React, { useState, useEffect } from "react";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";
import DatePicker from "react-datepicker";
import CryptoJS from 'crypto-js';
import { useSelector } from 'react-redux';
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action"

const Complaintreport = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [startDate, setStartdate] = useState('')
  const [endDate, setEnddate] = useState('')
  const [loading, setLoading] = useState([]);
  const [data, setL] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');
  const token = localStorage.getItem("token");
  const licare_code = localStorage.getItem("licare_code");



  const columnMapping = {
    TicketNumber: "Ticket Number",
    CreateDate: "Create Date",
    CustomerID: "Customer ID",
    Salutation: "Salutation",
    CustomerName: "Customer Name",
    Address: "Address",
    City: "City",
    District: "District",
    State: "State",
    PINCODE: "Pincode",
    CustomerClassification: "Customer Classification",
    MobileNumber: "Customer Mobile",
    AlternateMobileNumber: "Alternate Mobile",
    CustomerEmailID: "Customer Email",
    CustomerType: "Call Type",
    CallCategory: "Call Category",
    ModelNumber: "Model Number",
    SerialNumber: "Serial Number",
    PurchaseDate: "Purchase Date",
    WarrantyType: "Warranty Type",
    CallStatus: "Call Status",
    CallSubStatus: "Call Sub Status",
    FaultDescription: "Fault Description",
    FeedbackStatus: "Feedback Status",
    FinalRemark: "Final Remark",
    FieldCompletedDate: "Field Completed Date",
    AdditionalInfo: "Additional Info",
    LiebherrBranch: "Liebherr Branch",
    MasterServicePartnerCode: "Master Service Partner Code",
    MasterServicePartnerName: "Master Service Partner Name",
    ChildServicePartnerCode: "Child Service Partner Code",
    ChildServicePartnerName: "Child Service Partner Name",
    EngineerName: "Engineer Name",
    CountOfVisit: "Count Of Visit",
    CallChargeable: "Call Chargeable",
    FieldChargeable: "Field Chargeable",
    Priority: "Priority",
    TOTP: "TOTP"
  };




  const fetchData = async () => {
    setError(''); // Clear any previous errors

    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }

    if (startDate > endDate) {
      setError('Start date cannot be later than end date.');
      return;
    }

    const data = {
      startDate: startDate,
      endDate: endDate,
      licare_code: licare_code
    };

    try {
      setLoading(true);  // Show loading indicator before making API call
      const response = await axiosInstance.post(`${Base_Url}/getcomplainticketdump`, data, {
        headers: { Authorization: token },
      });

      const rawData = response.data;

      const dateFields = [
        "CreateDate",
        "PurchaseDate",
        "FieldCompletedDate"
      ];

      const allowedColumns = { ...columnMapping };

      // Remove TOTP field if role_id is not in allowed list
      if (![2, 8, 12].includes(Number(role_id))) {
        delete allowedColumns["TOTP"];
      }

      const formattedData = rawData.map(item => {
        const row = {};
        for (const [backendKey, frontendLabel] of Object.entries(allowedColumns)) {
          let value = item[backendKey] ?? "";

          if (dateFields.includes(backendKey) && value) {
            value = formatDate(value); // Apply date formatting
          }

          // Extract plain text from Final Remark HTML if field exists
          if (backendKey === "FinalRemark") {
            const extracted = String(value).match(/<b>Remark:<\/b>\s*([^<]*)/i);
            value = extracted?.[1]?.trim() || "";
          }

          row[frontendLabel] = value;
        }
        return row;
      });

      exportToExcel(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);  // Hide loading indicator after operation completes
    }
  };






  const exportToExcel = (exceldata) => {
    if (!exceldata || exceldata.length === 0) {
      alert("No data available to export."); // Alert if no data
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exceldata); // Directly use data

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(dataBlob, "TicketDump.xlsx");
  };




  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

    return `${day}-${month}-${year}`;
  };

  const formatDate2 = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day

    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (date) => {
    if (date) {
      const formattedDate = formatDate2(date);
      setStartdate(formattedDate);
    } else {
      setStartdate('');
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      const formattedDate = formatDate2(date);
      setEnddate(formattedDate);
    } else {
      setEnddate('');
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
  const role_id = decryptedRole
  const roledata = {
    role: decryptedRole,
    pageid: String(46)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 

  return (
    <div className="tab-content">
      {loaders && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}

      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mt-3 mb-3">
            <div className="card-body">
              <h5>Ticket Report :</h5>
              <div className="mb-3">
                <label>Start Date</label>
                <DatePicker
                  selected={startDate ? new Date(startDate) : null}
                  onChange={handleStartDateChange}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label>End Date</label>
                <DatePicker
                  selected={endDate ? new Date(endDate) : null}
                  onChange={handleEndDateChange}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="DD-MM-YYYY"
                  className="form-control"
                />
              </div>
              {error && <p className="text-danger">{error}</p>}
              <button className="btn btn-primary" onClick={fetchData}>
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div> : null}
      <div>
      </div>


    </div>
  );
};

export default Complaintreport;
