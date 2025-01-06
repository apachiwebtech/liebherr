import axios from "axios";
import React, { useEffect, useState } from "react";
import { Base_Url ,secretKey} from "../../Utils/Base_Url";
import Ratecardtabs from "./Ratecardtabs";
import { useSelector } from 'react-redux';
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';
import * as XLSX from "xlsx";
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import { useDispatch } from "react-redux";
import { getRoleData } from "../../Store/Role/role-action";


const  Master_Warrenty = () => {

  const [excelData, setExcelData] = useState([]);
  const { loaders, axiosInstance } = useAxiosLoader();

  const importexcel = (event) => {
    // If triggered by file input
    const file = event?.target?.files ? event.target.files[0] : null;

    // If triggered by button click, use the file uploaded
    if (!file) {
      alert("Please upload an Excel file first!");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert to JSON
      setExcelData(jsonData);
      console.log("Excel Data Imported:", jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const uploadexcel = () => {
    // Convert excelData to a string (assuming it's an array or object)
    const data = {
      excelData: JSON.stringify(excelData) ,
      created_by : localStorage.getItem("licare_code")
    };
  
    axios.post(`${Base_Url}/uploadmasterwarrantyexcel`, data)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
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
      pageid: String(38)
    }
  
    const dispatch = useDispatch()
    const roleaccess = useSelector((state) => state.roleAssign?.roleAssign[0]?.accessid);
  
  
    useEffect(() => {
      dispatch(getRoleData(roledata))
    }, [])
  
    // Role Right End 
  

  return (
    <div className="tab-content">
      <Ratecardtabs />
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
    {roleaccess > 1 ?    <div className="row mp0">
        <div className="col-12">
          <div className="card mb-3 tab_box">
            <div
              className="card-body"
              style={{ flex: "1 1 auto", padding: "13px 28px" }}
            >
                    <div>
                <input type="file" accept=".xlsx, .xls" onChange={importexcel} />
                <button className="btn btn-primary" onClick={uploadexcel}>
                  Import Rate Card
                </button>

              </div>

              <pre>{JSON.stringify(excelData, null, 2)}</pre>
             
            </div>
          </div>
        </div>
      </div> : null}
      </div>
  );
};

export default  Master_Warrenty;
