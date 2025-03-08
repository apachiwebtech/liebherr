import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelforRemarks = () => {

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
  
      // Transform data to separate remarks while keeping ticketno common
      const transformedData = parsedData.flatMap((row) => [
        { ticket_no: row.ticket_no, remark: row.fault_description ,created_date : row.ticket_date ? convertExcelSerialToDateTime(row.ticket_date) : null ,test_data1: "1",test_data2: null,test_data3: null,test_data4: null,test_data5: null,test_data6: null,test_data7: null,test_data8: null,test_data9: null,test_data10: null,test_data11: null,test_data1: null,test_data12: null,test_data1: null  },
        { ticket_no: row.ticket_no, remark: row.remarks ,created_date : row.ticket_date ? convertExcelSerialToDateTime(row.ticket_date) : null }
      ]);
  
      setJsonData(transformedData);
      exportJson(transformedData);
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

export default ExcelforRemarks;
