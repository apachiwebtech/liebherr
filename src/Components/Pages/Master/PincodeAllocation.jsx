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
  const [loader, setLoader] = useState(false);
  const token = localStorage.getItem("token"); // Get token from localStorage





  const importexcel = (event) => {
    setLoader(true);
    const file = event?.target?.files ? event.target.files[0] : null;
  
    if (!file) {
      alert("Please upload an Excel file first!");
      setLoader(false);  // Stop loader if no file is selected
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
  
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
  
        console.log("Sheet Loaded:", sheet);
  
        const chunkSize = 70000; // Process in smaller chunks to avoid memory issues
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  

  
        // Column mapping function
        const mapKeys = (obj) => {
          const keyMapping = {
            "RESIDENT BRANCH": "resident_branch",
          };
  
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
              keyMapping[key] || key.toLowerCase().replace(/\s+/g, "_"),
              String(value),
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
        console.log("Processed Data:", processedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("An error occurred while processing the file.");
      } finally {
        setLoader(false);  // Stop loader after processing completes or if an error occurs
      }
    };
  
    reader.onerror = () => {
      alert("Failed to read file!");
      setLoader(false);  // Stop loader if file reading fails
    };
  
    reader.readAsArrayBuffer(file);
  };
  


  const uploadexcel = () => {
    setLoader(true);
  
    try {
      // Ensure excelData is converted to JSON string before encryption
      const jsonData = JSON.stringify(excelData);
  
    
  
      axios.post(`${Base_Url}/uploadpinexcel`, { jsonData: jsonData })
        .then((res) => {
          if (res.data) {
            alert("Uploaded successfully!");
          }
          console.log(res);
        })
        .catch((err) => {
          console.error("Upload error:", err);
          alert("Error uploading file. Please try again.");
        })
        .finally(() => {
          setLoader(false);
        });
  
    } catch (error) {
      console.error("Encryption error:", error);
      alert("Error during encryption.");
      setLoader(false);
    }
  };
  


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
      {(loaders || loader) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders || loader} color="#FFFFFF" />
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
