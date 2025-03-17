import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MasterFranchise from './MasterFranchise';
import Childfranchisemaster from './Childfranchisemaster';
import { ChildFranchiselist } from './Childfranchiselist';
import EngineerMaster from './EngineerMaster';
import { Link } from 'react-router-dom';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import axios from "axios";
import { Base_Url, secretKey } from '../../Utils/Base_Url';

function MasterFranchiseTabs() {
  const [activeTab, setActiveTab] = useState('/Franchisemasterlist');
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
      masterfpage: '20',
      childfpage: '21',
      childlistpage: '22',
      engineerpage: '23',
      engineerlistpage: '24',
    }


    axios.post(`${Base_Url}/getfranchiseroledata`, data, {
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>SERVICE PARTNER MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
              <div className="tabsMenu" style={{ fontSize: "14px", marginLeft: "12px", fontWeight: "600", fontFamily: "Nunito" }}>
                <ul className="nav nav-tabs ">

                  {status.masterfpage == 1 &&
                    <Link to={`/Franchisemasterlist`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === '/Franchisemasterlist' ? 'active' : ' onClick={() => setActiveTab("Franchisemasterlist")}'}`}

                      >
                        MASTER SERVICE PARTNER  LIST
                      </button>
                    </li>
                    </Link>
                  }

                  {status.childfpage == 1 &&
                    <Link to={`/Childfranchisemaster`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === '/Childfranchisemaster' ? 'active' : ' onClick={() => setActiveTab("Childfranchisemaster")}'}`}

                      >
                        CHILD SERVICE PARTNER
                      </button>
                    </li>
                    </Link>
                  }



                  {status.childlistpage == 1 &&
                    <Link to={`/Childfranchiselist`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === '/Childfranchiselist' ? 'active' : ' onClick={() => setActiveTab("Childfranchiselist")}'}`}

                      >
                        CHILD SERVICE PARTNER MASTER LIST
                      </button>
                    </li>
                    </Link>
                  }

                  {status.engineerpage == 1 &&
                    <Link to={`/EngineerMaster`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === '/EngineerMaster' ? 'active' : 'onClick={() => setActiveTab("EngineerMaster")}'}`}

                      >
                        ENGINEER MASTER
                      </button>
                    </li>
                    </Link>
                  }
                  {status.engineerlistpage == 1 &&
                    <Link to={`/Engineerlist`}><li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === '/Engineerlist' ? 'active' : 'onClick={() => setActiveTab("Engineerlist")}'}`}

                      >
                        ENGINEER LIST
                      </button>
                    </li>
                    </Link>
                  }

                </ul>
              </div>
            </div>


            {/* Tab Content */}
            <div className="col-12 col-custom" style={{ paddingLeft: "12px", paddingRight: "12px" }}>
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

export default MasterFranchiseTabs;
