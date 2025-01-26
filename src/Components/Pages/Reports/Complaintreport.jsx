import React, { useState, useEffect } from "react";
import { Base_Url } from "../../Utils/Base_Url";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";
import DatePicker from "react-datepicker";

const Complaintreport = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [startDate, setStartdate] = useState('')
  const [endDate, setEnddate] = useState('')
  const [loading, setLoading] = useState([]);
  const [data, setL] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");

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
      endDate: endDate
    };

    try {
      setLoading(true);  // Show loading indicator before making API call
      const response = await axiosInstance.post(`${Base_Url}/getcomplainticketdump`, data, {
        headers: { Authorization: token },
      });

      console.log("API Response:", response.data);

      if (response.data && response.data.length > 0) {
        // Extract column names dynamically from the keys of the first object
        setColumns(Object.keys(response.data[0]));

        // Ensure all data is loaded before exporting
        await exportToExcel(response.data);
      } else {
        setError("No data available for the selected date range.");
      }
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

    saveAs(dataBlob, "ExportedData.xlsx");
  };




  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
  
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (date) => {
    if (date) {
      const formattedDate = formatDate(date);
      setStartdate(formattedDate);
    } else {
      setStartdate('');
    }
  };
  
  const handleEndDateChange = (date) => {
    if (date) {
      const formattedDate = formatDate(date);
      setEnddate(formattedDate);
    } else {
      setEnddate('');
    }
  };

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

      <div className="row mp0">
        <div className="col-12">
          <div className="card mt-3 mb-3">
            <div className="card-body">
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
      </div>

    </div>
  );
};

export default Complaintreport;
