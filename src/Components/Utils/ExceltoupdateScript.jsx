import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExceltoScript = () => {
  const [fileData, setFileData] = useState([]);
  const [sqlScript, setSqlScript] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length < 2) {
        alert("Excel file must have at least one row of data!");
        return;
      }

      // Extract header and rows
      const headers = jsonData[0];
      const rows = jsonData.slice(1);

      setFileData(rows);

      // Generate SQL script
      generateSQL(rows);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateSQL = (data) => {
    let groupedData = {};

    data.forEach((row) => {
      let [ID, Company, Team, test, test2, Email] = row;

      if (!Email) return; // Skip rows without an email

      if (!groupedData[Email]) {
        groupedData[Email] = { Company, Email, test2, IDs: new Set() };
      }
      groupedData[Email].IDs.add(ID); // Store unique IDs only
    });

    const formatDate = () => {
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // Month (01-12)
      const dd = String(date.getDate()).padStart(2, "0"); // Day (01-31)
      const hh = String(date.getHours()).padStart(2, "0"); // Hours (00-23)
      const mi = String(date.getMinutes()).padStart(2, "0"); // Minutes (00-59)
      const ss = String(date.getSeconds()).padStart(2, "0"); // Seconds (00-59)

      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    };

    let sqlStatements = Object.entries(groupedData).map(([Email, { Company, test2, IDs }]) => {
      let mergedIDs = Array.from(IDs).join(","); // Convert Set to string (avoid duplicates)
      return `update lhi_user set assigncsp = ${mergedIDs} where email = '${Email}'`;
    });

    setSqlScript(sqlStatements.join("\n"));
  };

  const downloadSQLFile = () => {
    const blob = new Blob([sqlScript], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exported_script.sql";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Excel to SQL Script Converter</h2>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      <br />

      {sqlScript && (
        <div>
          <h3>Generated SQL Script</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{sqlScript}</pre>
          <button onClick={downloadSQLFile}>Download .sql File</button>
        </div>
      )}
    </div>
  );
};

export default ExceltoScript;
