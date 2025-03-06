import { useState } from "react";
import axios from "axios";
import { Base_Url } from "./Base_Url";
import { useAxiosLoader } from "../Layout/UseAxiosLoader";
import { SyncLoader } from "react-spinners";

function UploadMobile() {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState("upload_mobile");
  const { loaders, axiosInstance } = useAxiosLoader();
  const token = localStorage.getItem("token");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTableNameChange = (event) => {
    setTableName(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a JSON file first.");
      return;
    }
    if (!tableName.trim()) {
      alert("Please enter a valid table name.");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = async () => {
      try {
        // Parse the JSON file content
        let jsonData = JSON.parse(reader.result);
  
        // Convert all values to strings
        const transformData = (data) => {
          return data.map((item) => {
            return Object.fromEntries(
              Object.entries(item).map(([key, value]) => [key, value !== null ? String(value) : ""])
            );
          });
        };


  
        const finalData = JSON.stringify(transformData(jsonData));
  
        // Send parsed data to the backend for bulk insertion
        const response = await axiosInstance.post(`${Base_Url}/uploadmobile`, {
          jsonData: finalData, // Ensure the data is an array of complaint_ticket objects
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization" : token
          },
        });
  
        alert("Data uploaded successfully!");
        console.log(response.data);
      } catch (error) {
        console.error("Error reading or uploading file:", error);
        alert("Error reading or uploading the file!");
      }
    };
  
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading the file!");
    };
  
    reader.readAsText(file); // Read the file as text
  };
  

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
               {loaders && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SyncLoader loading={loaders} color="#FFFFFF" />
          </div>
        )}
      <h2>Upload JSON File</h2>

      <input
        type="text"
        placeholder="Enter Table Name"
        value={tableName}
        onChange={handleTableNameChange}
        style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
      />

      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />

      <button onClick={handleUpload} style={{ padding: "10px 15px", cursor: "pointer" }}>
        Upload JSON
      </button>
    </div>
  );
}

export default UploadMobile;
