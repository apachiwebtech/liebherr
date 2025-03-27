import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const Exceltomobile = () => {

  const [jsonData, setJsonData] = useState(null);

  function excelSerialToDate(serial) {
    const date = new Date((serial - 25569) * 86400000); // Convert to milliseconds
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  function convertExcelSerialToDateTime(excelSerial) {
    const millisecondsPerDay = 86400000; // 24 * 60 * 60 * 1000
    const jsDate = new Date((excelSerial - 25569) * millisecondsPerDay);
    return jsDate; // Returns full Date object with time
  }

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

      // Extract only the required columns
      const selectedColumns = parsedData.map((row) => ({
        ticket_no: String(row.ticket_no),
        alt_mobile: String(row.alternate_no),
        customer_mobile: String(row.mobile_no),
        sevice_partner: row["Master Service Partner Name"],
        test1: "",
        test2: "",
        test3: "",
        test4: "",
        test5: "",
        test6: "",
        test7: "",
        test8: "",
        test9: "",
        test10: "",
        test11: "",
        test12: "",
        test13: "",
        test14: "",
        test15: "",
        test16: "",
        test17: "",
        test18: "",
        test19: "",
        test20: "",
        test21: "",
        test22: "",
        test23: "",
        test24: "",
        test25: "",
        test26: "",
        test27: "",
        test28: "",
        test29: "",
        test30: ""


      }));

      setJsonData(selectedColumns);
      exportJson(selectedColumns);
    };
    reader.readAsArrayBuffer(file);
  };

  const exportJson = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_data.json";
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

export default Exceltomobile;
