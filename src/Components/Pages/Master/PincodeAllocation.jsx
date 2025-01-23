import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Base_Url, secretKey } from "../../Utils/Base_Url";
import Ratecardtabs from "./Ratecardtabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";
import * as XLSX from "xlsx";
import AllocationTab from "./AllocationTab";

const PincodeAllocation = () => {
  // Step 1: Add this state to track errors
  const { loaders, axiosInstance } = useAxiosLoader();
  const [excelData, setExcelData] = useState([]);
  const token = localStorage.getItem("token"); // Get token from localStorage



  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("Please select an Excel file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Processed Rows:", result.totalRows);
  } catch (error) {
    console.error("Upload failed", error);
  }
};

const importexcel = (event) => {
  const file = event?.target?.files ? event.target.files[0] : null;

  if (!file) {
    alert("Please upload an Excel file first!");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    console.log("Sheet Loaded:", sheet);

    const chunkSize = 70000; // Process in smaller chunks to avoid memory issues
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log("Total Rows:", jsonData.length);

    // Column mapping function
    const mapKeys = (obj) => {
      const keyMapping = {
        "RESIDENT BRANCH": "resident_branch",
      };

      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          keyMapping[key] || key.toLowerCase().replace(/\s+/g, "_"),
          value,
        ])
      );
    };

    let processedData = [];
    for (let i = 0; i < jsonData.length; i += chunkSize) {
      const chunk = jsonData.slice(i, i + chunkSize).map(mapKeys);
      console.log(`Processing chunk ${i / chunkSize + 1}`);
      processedData.push(...chunk);
      
      // Simulate async processing to avoid UI freeze
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setExcelData(processedData);
    console.log(processedData);
  };

  reader.readAsArrayBuffer(file);
};


  const uploadexcel = () => {

    const data = {
      excelData: JSON.stringify(excelData),
      created_by: localStorage.getItem("licare_code")
    }

    axios.post(`${Base_Url}/uplaodpincodeexcel`, excelData)
      .then((res) => {
        if (res.data) {
          alert("Uploaded")
        }
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  


  // Role Right 


  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };

  const storedEncryptedRole = localStorage.getItem("Userrole");
  const decryptedRole = Decrypt(storedEncryptedRole);

  const roledata = {
    role: decryptedRole,
    pageid: String(37)
  }

  const dispatch = useDispatch()
  const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);


  useEffect(() => {
    dispatch(getRoleData(roledata))
  }, [])

  // Role Right End 
  return (
    <div className="tab-content">
      <AllocationTab />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      {roleaccess > 1 ? <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
              <div>
                <input type="file" accept=".xlsx, .xls" onChange={importexcel} />
                <button className="btn btn-primary" onClick={uploadexcel}>
                  Import Pincode Allocation
                </button>

              </div>

        
            </div>
          </div>
        </div>
      </div> : null}
    </div>
  );
};

export default PincodeAllocation;
