import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelToEngScript = () => {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      // Track unique emails to prevent duplicates
      const emailSet = new Set();
      
      const selectedColumns = parsedData
        .filter(row => {
          const email = row['E-Mail']?.trim();
          if (!email || emailSet.has(email)) return false; // Skip duplicate or empty emails
          emailSet.add(email);
          return true;
        })
        .map((row) => ({
          mfranchise_id: row['MASTER SERVICE PARTNER CODE'],
          cfranchise_id: row['CHILD SERVICE PARTNER CODE'],
          engineer_id: row['Technician New ID_01.01.2025'],
          title: row['Technician New Name_01.01.2025'],
          mobile_no: row['Mobile'],
          email: row['E-Mail'],
          status: row['LiCare 2.0 Access 2'],
          employee_code: row['Type'],
          password: 'e10adc3949ba59abbe56e057f20f883e'
        }));

      setJsonData(selectedColumns);
      exportSqlScript(selectedColumns);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportSqlScript = (data) => {
    if (!data || data.length === 0) return;

    const tableName = "awt_engineermaster";
    const keys = Object.keys(data[0]);

    const sqlStatements = data.map(row => {
      const values = keys.map(key => {
        const value = row[key];

        if (value === null || value === undefined) {
          return "NULL";
        } else if (typeof value === "string") {
          return `'${value.replace(/'/g, "''")}'`;
        } else if (value instanceof Date) {
          return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
        } else if (typeof value === "number") {
          return value;
        }
        return `'${value}'`;
      });

      return `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${values.join(", ")});`;
    }).join("\n");

    const blob = new Blob([sqlStatements], { type: "text/sql" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "insert_data.sql";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Convert Excel to JSON</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {jsonData && (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ExcelToEngScript;
