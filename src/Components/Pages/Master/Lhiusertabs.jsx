import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Lhiuser from "./Lhiuser";
import { Link } from "react-router-dom";
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import axios from "axios";

function Lhiusertabs() {
  const [activeTab, setActiveTab] = useState('/Lhiuser');
  const [status, setStatus] = useState([])
  const token = localStorage.getItem("token");

  useEffect(() => {
    getpageroledata()
    setActiveTab(window.location.pathname);

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
      lhiuserpage: '27',
      rolepage: '28',
      roleassignpage: '29',
      mspaccesspage: '61',
      cspaccesspage: '62',

    }


    axios.post(`${Base_Url}/getlhiuserroledata`, data, {
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>LHI USER MASTER</span>
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
                  {status.lhiuserpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Lhiuser`}><button
                        className={`nav-link ${activeTab === "/Lhiuser" ? "active" : "onClick={() => setActiveTab('Lhiuser')}"
                          }`}

                      >
                        LHI USER
                      </button></Link>
                    </li>
                  }
                  {status.rolepage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Roleright`}><button
                        className={`nav-link ${activeTab === "/Roleright" ? "active" : "onClick={() => setActiveTab('Roleright')}"
                          }`}

                      >
                        ROLE RIGHTS
                      </button></Link>
                    </li>
                  }

                  {status.roleassignpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/Roleassign`}><button
                        className={`nav-link ${activeTab === "/Roleassign" ? "active" : "onClick={() => setActiveTab('Roleassign')}"
                          }`}

                      >
                        ROLE ASSIGN
                      </button></Link>
                    </li>
                  }

                  {status.mspaccesspage == 1 &&
                    <li className="nav-item">
                      <Link to={`/mspaccess`}><button
                        className={`nav-link ${activeTab === "/mspaccess" ? "active" : "onClick={() => setActiveTab('mspaccess')}"
                          }`}

                      >
                        MSP ACCESS
                      </button></Link>
                    </li>
                  }

                  {status.cspaccesspage == 1 &&
                    <li className="nav-item">
                      <Link to={`/cspaccess`}><button
                        className={`nav-link ${activeTab === "/cspaccess" ? "active" : "onClick={() => setActiveTab('cspaccess')}"
                          }`}

                      >
                        CSP ACCESS
                      </button></Link>
                    </li>
                  }

                </ul>
              </div>


            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Lhiusertabs;
