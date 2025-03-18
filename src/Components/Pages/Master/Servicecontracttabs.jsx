import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import axios from "axios";

function Servicecontracttabs() {
  const [activeTab, setActiveTab] = useState("/servicecontract");
  const [status, setStatus] = useState([]);
  const token = localStorage.getItem("token");

  const location = useLocation(); // Get current path

  useEffect(() => {
    getpageroledata();

    // Ensure correct tab is set
    if (location.pathname.startsWith("/servicecontractlist")) {
      setActiveTab("/servicecontractlist");
    } else if (location.pathname.startsWith("/servicecontract")) {
      setActiveTab("/servicecontract");
    }
  }, [location.pathname]);

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
      servicecontractpage: '30',
      servicelistpage: '31',
    };

    axios.post(`${Base_Url}/getserviceroledata`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        setStatus(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
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
            font-family: Nunito;
          }
          .nav-link.active {
            font-family: Nunito;
            color: #495057 !important;
            font-size: 14px;
            width: 168.75px;
            height: 38.6px;
          }
        `}
      </style>

      <div className="container-fluid p-0">
        {/* Top Header */}
        <div className="text-left headings">
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>SERVICE CONTRACT REGISTRATION</span>
        </div>

        {/* Nav Tabs */}
        <div className="row">
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
                <ul className="nav nav-tabs">
                  {status.servicecontractpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/servicecontract`}>
                        <button className={`nav-link ${activeTab === "/servicecontract" ? "active" : ""}`}>
                          SERVICE CONTRACT REGISTRATION
                        </button>
                      </Link>
                    </li>
                  }
                  {status.servicelistpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/servicecontractlist`}>
                        <button className={`nav-link ${activeTab === "/servicecontractlist" ? "active" : ""}`}>
                          SERVICE CONTRACT LIST
                        </button>
                      </Link>
                    </li>
                  }
                </ul>
              </div>
            </div>

            {/* Tab Content */}
            <div className="col-12 col-custom" style={{ paddingLeft: "12px", paddingRight: "12px" }}>
              <div className="tab-content"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Servicecontracttabs;
