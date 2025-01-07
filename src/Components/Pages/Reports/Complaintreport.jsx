import React, { useState, useEffect } from "react";
import { Base_Url } from "../../Utils/Base_Url";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";

const Complaintreport = () => {
  const { loaders, axiosInstance } = useAxiosLoader();
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`${Base_Url}/getcomplainticketdump`, {
        headers: { Authorization: token },
      });
      console.log("API Response:", response.data);

      if (response.data && response.data.length > 0) {
        // Extract column names dynamically from the keys of the first object
        setColumns(Object.keys(response.data[0]));
      }
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No data available to export."); // Alert if no data
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data); // Directly use data

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "ExportedData.xlsx");
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
             <div>
                Coming Soon
             </div>
              <button onClick={exportToExcel}>Export to Excel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaintreport;
