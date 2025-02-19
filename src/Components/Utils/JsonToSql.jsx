import { useState } from "react";
import axios from "axios";
import { Base_Url } from "./Base_Url";

function JsonToSql() {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState("complaint_ticket");

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
        const jsonData = JSON.parse(reader.result);

        const finaldata = JSON.stringify(jsonData)

        // Send parsed data to the backend for bulk insertion
        const response = await axios.post(`${Base_Url}/uploadtickets`, {
            jsonData: finaldata, // Ensure the data is an array of complaint_ticket objects
        }, {
          headers: {
            "Content-Type": "application/json",
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

export default JsonToSql;
