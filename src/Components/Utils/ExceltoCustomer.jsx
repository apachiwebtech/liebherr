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
                customer_id: row.CustomerNumber || '',
                salutation: row.Salutation || '',
                customer_name: row.customer_name || '',
                customer_type: row.customer_type || '',
                customer_classification: row.customer_classification || '',
                mobile_no: String(row.mobile_no) || '',
                m_whatsapp: row.m_whatsapp || '',
                alternate_mobile: String(row.alternate_mobile ? row.alternate_mobile : '') || '',
                a_whatsapp: row.a_whatsapp || '',
                email: row.email || '',
                date_of_birth: row.date_of_birth || '',
                anniversary_date: row.anniversary_date || '',
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
