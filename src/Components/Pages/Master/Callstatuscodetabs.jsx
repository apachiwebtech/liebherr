import React, { useEffect, useState } from "react";


import "bootstrap/dist/css/bootstrap.min.css";
import Callstatus from "./Callstatus";
import { Link } from 'react-router-dom';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import axios from "axios";

function Callstatuscodetabs() {
  const [activeTab, setActiveTab] = useState("/callstatus");
  const [status, setStatus] = useState([])
  const token = localStorage.getItem("token");

  useEffect(() => {

    setActiveTab(window.location.pathname);
    getpageroledata()
  }, [window.location.pathname]);


  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };


  async function getpageroledata() {

    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const data = {
      role: decryptedRole,
      callstatuspage: '26',
      subcallstatuspage: '51',
    }


    axios.post(`${Base_Url}/getcallstatusroledata`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        setStatus(res.data)
      })
      .then((err) => {
        console.log(err)
      })
  }


  return (
    <>
      <style>
        {`
           
           .headings {
              background: #2779c4;
              margin-bottom: 15px;
              padding: 10px 0px;
              font-size: 18px;
              font-weight: 600;
              text-transform: uppercase;
              box-shadow: 0 0 4px #ddd;
              font-family:Nunito;
            }

            .nav-link.active{
                font-family:Nunito;
                color:#495057 !important;
                font-size:14px;
                width:168.75px;
                height:38.6;
          }
          
          
        `}
      </style>

      <div className="container-fluid p-0">
        {/* Top Header */}
        <div className="text-left headings">
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>Call Status Code Master </span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: "100%" }}>
              <div
                className="tabsMenu"
                style={{
                  fontSize: "14px",
                  marginLeft: "12px",
                  fontWeight: "600",
                  fontFamily: "Nunito",
                }}
              >
                <ul className="nav nav-tabs ">

                  {status.callstatuspage == 1 &&
                    <Link to={`/callstatus`}> <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "/callstatus" ? "active" : "onClick={() => setActiveTab('callstatus')}"
                          }`}

                      >
                        CALL STATUS CODE
                      </button>
                    </li></Link>
                  }
                  {status.subcallstatuspage == 1 &&
                    <Link to={`/subcallstatus`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "/subcallstatus" ? "active" : "onClick={() => setActiveTab('subcallstatus')}"
                          }`}

                      >
                        SUB CALL STATUS
                      </button>
                    </li></Link>
                  }

                </ul>
              </div>
            </div>

            {/* Tab Content */}
            <div
              className="col-12 col-custom"
              style={{ paddingLeft: "12px", paddingRight: "12px" }}
            >
              <div className="tab-content">
                {/* {renderTabContent()} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Callstatuscodetabs;
