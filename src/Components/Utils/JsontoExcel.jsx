import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const JsonToExcel = () => {
  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setJsonData(data);
    };
    reader.readAsText(file);
  };

  const exportToExcel = (jsonData) => {
    if (!jsonData.length) return;
    
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "exported_data.xlsx");
  };

  return (
    <div>
      <h2>Convert JSON to Excel</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />
      <button onClick={() => exportToExcel(jsonData)}>Download Excel</button>
    </div>
  );
};

export default JsonToExcel;
