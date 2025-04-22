import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from "axios";
import { Base_Url, secretKey } from '../../Utils/Base_Url';

function AllocationTab() {

  const [activeTab, setActiveTab] = useState('/pincode_allocation');
  const token = localStorage.getItem("token");
  const [status, setStatus] = useState([])

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
      allocationpage: '48',
     
    }


    axios.post(`${Base_Url}/getallocationroledata`, data, {
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
              font-family: Nunito;
            }

            .nav-link.active{
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>PINCODE ALLOCATION</span>
        </div>

        {/* Nav Tabs */}
        <div className="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
              <div className="tabsMenu" style={{ fontSize: "14px", marginLeft: "12px", fontWeight: "600", fontFamily: "Nunito" }}>
                <ul className="nav nav-tabs">
                  {status.allocationpage == 1 &&
                    <li className="nav-item">
                      <Link to="/pincode_allocation">
                        <button
                          className={`nav-link ${activeTab === '/pincode_allocation' ? 'active' : ''}`}
                          onClick={() => setActiveTab('/pincode_allocation')}
                        >
                          Pincode Allocation
                        </button>
                      </Link>
                    </li>
                  }
                 

                  {/* <li className="nav-item">
                    <Link to="/business_partner">
                      <button
                        className={`nav-link ${activeTab === '/business_partner' ? 'active' : ''}`}
                        onClick={() => setActiveTab('/business_partner')}
                      >
                       Business Partner
                      </button>
                    </Link>
                  </li> */}

                  {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
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

export default AllocationTab;
