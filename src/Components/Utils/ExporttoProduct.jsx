import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExporttoProduct = () => {

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
            const selectedColumns = parsedData.map((row) => ({
                    CustomerID: row.CustomerNumber || null,
                    CustomerName: row.customer_name || null,
                    ModelNumber: row.model_no || null,
                    serial_no : row.serial_no || null,
                    address : row.address || null,
                    pincode : row.pincode || null,
                    created_date : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : null,
                    purchase_date : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : null,
                    warrenty_sdate : row.WarrantyStartDate ? excelSerialToDate(row.WarrantyStartDate) : null,
                    warrenty_edate : row.WarrantyEndDate ? excelSerialToDate(row.WarrantyEndDate) : null,
                    InvoiceDate : row.InvoiceDate ? excelSerialToDate(row.InvoiceDate) : null,
                    InvoiceNumber : row.InvoiceNumber || null,
                    ModelName : row.Name || null,
                    Short_model_no :  null,
                    SerialStatus : row['Serial Status'] || null,
                    Notes : row['Notes'] || null,
                    BranchName : row.BranchName || null,
                    CustomerAccountStatus : row['Customer Account Status'] || null,
                    SalesDealer : row.SalesDealer || null,
                    SubDealer : row.SubDealer || null,
                    customer_classification : row.customer_classification || null,
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

export default ExporttoProduct;
