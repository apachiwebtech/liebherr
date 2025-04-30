import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from "axios";
import { Base_Url, secretKey } from '../../Utils/Base_Url';

function MasterFranchiseTabs() {
  const [activeTab, setActiveTab] = useState('/Franchisemasterlist');
  const [status, setStatus] = useState([]);
  const token = localStorage.getItem("token");

  const location = useLocation();

  useEffect(() => {
    getpageroledata();

    // Fixing Active Tab Logic
    if (location.pathname.startsWith("/Engineerlist")) {
      setActiveTab("/Engineerlist");
    } else if (location.pathname.startsWith("/Childfranchiselist")) {
      setActiveTab("/Childfranchiselist");
    } else if (location.pathname.startsWith("/Franchisemasterlist")) {
      setActiveTab("/Franchisemasterlist");
    } else if (location.pathname.startsWith("/Childfranchisemaster")) {
      setActiveTab("/Childfranchisemaster");
    } else if (location.pathname.startsWith("/EngineerMaster") || location.pathname.startsWith("/engineermaster")) {
      setActiveTab("/EngineerMaster");
    } else if (location.pathname.startsWith("Engineerlist")) {
      setActiveTab("/Engineerlist");
    }else if (location.pathname.startsWith("/engineerapprove")) {
      setActiveTab("/engineerapprove");
    }
  }, [location.pathname]);

  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  async function getpageroledata() {
    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const data = {
      role: decryptedRole,
      masterfpage: '20',
      childfpage: '21',
      childlistpage: '22',
     
    };

    axios.post(`${Base_Url}/getfranchiseroledata`, data, {
      headers: {
        Authorization: token,
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>SERVICE PARTNER MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div className="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
              <div className="tabsMenu" style={{ fontSize: "14px", marginLeft: "12px", fontWeight: "600", fontFamily: "Nunito" }}>
                <ul className="nav nav-tabs">
                  {status.masterfpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Franchisemasterlist`}>
                        <button className={`nav-link ${activeTab === "/Franchisemasterlist" ? "active" : ""}`}>
                          MASTER SERVICE PARTNER LIST
                        </button>
                      </Link>
                    </li>
                  }

                  {status.childfpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Childfranchisemaster`}>
                        <button className={`nav-link ${activeTab === "/Childfranchisemaster" ? "active" : ""}`}>
                           ADD CHILD SERVICE PARTNER
                        </button>
                      </Link>
                    </li>
                  }

                  {status.childlistpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Childfranchiselist`}>
                        <button className={`nav-link ${activeTab === "/Childfranchiselist" ? "active" : ""}`}>
                          CHILD SERVICE PARTNER MASTER LIST
                        </button>
                      </Link>
                    </li>
                  }

                  {status.engineerpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/EngineerMaster`}>
                        <button className={`nav-link ${activeTab === "/EngineerMaster" ? "active" : ""}`}>
                          ENGINEER MASTER
                        </button>
                      </Link>
                    </li>
                  }

                  {status.engineerlistpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Engineerlist`}>
                        <button className={`nav-link ${activeTab === "/Engineerlist" ? "active" : ""}`}>
                          ENGINEER LIST
                        </button>
                      </Link>
                    </li>
                  }
                  {status.engineerapprovepage == 1 &&
                    <li className="nav-item">
                      <Link to={`/engineerapprove`}>
                        <button className={`nav-link ${activeTab === "/engineerapprove" ? "active" : ""}`}>
                          ENGINEER APPROVE
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

export default MasterFranchiseTabs;
