import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExceltoCustomer = () => {

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
    
            // Transform data
            const selectedColumns = parsedData.map((row) => ({
                customer_id: row.CustomerNumber || null,
                salutation: row.Salutation || null,
                customer_name: row.customer_name || null,
                customer_type: row.customer_type || null,
                customer_classification: row.customer_classification || null,
                mobile_no: row.mobile_no || null,
                m_whatsapp: row.m_whatsapp || null,
                alternate_mobile: row.alternate_mobile || null,
                a_whatsapp: row.a_whatsapp || null,
                email: row.email || null,
                date_of_birth: row.date_of_birth || null,
                anniversary_date: row.anniversary_date || null,
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

export default ExceltoCustomer;
