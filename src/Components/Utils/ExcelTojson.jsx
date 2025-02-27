import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelToJson = () => {
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
        ticket_no: row.ticket_no,
        ticket_date: row.ticket_date ? excelSerialToDate(row.ticket_date) : null,
        customer_id: row.customer_id,
        salutation: row.salutation,
        customer_name: row.customer_name,
        alt_mobile: row.alt_mobile,
        customer_mobile: row.customer_mobile,
        customer_email: null,
        ModelNumber: row.model_no,
        serial_no: row.serial_no,
        address: row.address,
        region: row.district,
        state: row.state,
        city: row.city,
        area: null,
        pincode: row.pincode,
        sevice_partner: row["Master Service Partner Name"],
        child_service_partner: row['Service Partner'],
        msp: row.msp_code,
        csp: row.csp_code,
        sales_partner: row['Sales Partner Name'],
        assigned_to: row.service_engineer_name,
        old_engineer: null,
        engineer_code: row.service_engineer_id,
        engineer_id: row.service_engineer_id,
        ticket_type: row.call_category ? row.call_category?.toUpperCase()  : null,
        call_type: row.installation_type,
        sub_call_status: null,
        call_status: row.call_status, 
        symptom_code: null,
        cause_code: null,
        action_code: null,
        service_charges: null,
        other_charges: null,
        warranty_status: row.coverage_status,
        invoice_date: row.invoice_date ? excelSerialToDate(row.invoice_date) : null,
        call_charges: null,
        mode_of_contact: row.mode_of_contact,
        created_date: row.ticket_date ? convertExcelSerialToDateTime(row.ticket_date) : null,
        created_by: null,
        deleted: 0,
        updated_by: "1",
        updated_date: row['Ticket Last Updated'] ? convertExcelSerialToDateTime(row['Ticket Last Updated']) : null,
        contact_person: null,
        purchase_date: row.invoice_date ? excelSerialToDate(row.invoice_date) : null,
        specification: row.fault_description,
        ageing: row['Ticket Closed -  Agying'],
        area_id: null,
        state_id: null,
        city_id: null,
        pincode_id: null,
        closed_date: row.closed_date ? convertExcelSerialToDateTime(row.closed_date) : null,
        customer_class: row.customer_classification,
        call_priority: null,
        spare_doc_path: null,
        call_remark: null,
        spare_detail: null,
        group_code: row.fault_group_code,
        defect_type: row.fault_type_code,
        site_defect: row.fault_location,
        activity_code: row.fault_activity,
        spare_part_id: null,
        totp: null,
        requested_by: null,
        requested_email: null,
        requested_mobile: null,
        sales_partner2: null,
        mwhatsapp: null,
        awhatsapp: null,
        class_city: row['Price Group - Consumer as per year'],
        mother_branch: null,
        call_status_id: null,
        gas_charges: null,
        gas_transoprt: null,
        transport_charge: null,
        mandays_charges: null,
        visit_count: row['Ticket Claimed - Visits'],
        picking_damages: null,
        product_damages: null,
        missing_part: null,
        leg_adjustment: null,
        water_connection: null,
        abnormal_noise: null,
        ventilation_top: null,
        ventilation_bottom: null,
        ventilation_back: null,
        voltage_supply: null,
        earthing: null,
        gascheck: null,
        transportcheck: null
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

export default ExcelToJson;
