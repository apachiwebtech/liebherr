import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Ratecard from "./Ratecard";
import { Link, useLocation } from 'react-router-dom';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import { useAxiosLoader } from "../../Layout/UseAxiosLoader";
import CryptoJS from 'crypto-js';
import axios from "axios";

function Ratecardtabs() {
  const [activeTab, setActiveTab] = useState("Ratecard");
  const [status, setStatus] = useState([])
  const token = localStorage.getItem("token");
  const location = useLocation(); // Get current path

  useEffect(() => {
    getpageroledata()
    if (location.pathname.startsWith("/ratecard")) {
      setActiveTab("/ratecard");
    } else if (location.pathname.startsWith("/addrate")) {
      setActiveTab("/addrate");
    } else if (location.pathname.startsWith("/master_warrenty")) {
      setActiveTab("/master_warrenty");
    } else if (location.pathname.startsWith("/post_sale_warrenty")) {
      setActiveTab("/post_sale_warrenty");
    } else if (location.pathname.startsWith("/addmasterwarrenty")) {
      setActiveTab("/addmasterwarrenty");
    } else if (location.pathname.startsWith("/addpostsalewarranty")) {
      setActiveTab("/addpostsalewarranty");
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
      ratecardpage: '37',
      masterpage: '38',
      postsalepage: '39',
      addratepage: '66',
      addmasterwarrentypage: '72',
      addpostsalewarrantypage: '73',
    }


    axios.post(`${Base_Url}/getratecardroledata`, data, {
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>RATE CARD MATRIX MASTER </span>
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
                  {status.addratepage == 1 &&
                    <Link to={`/addrate`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/addrate" ? "active" : ""
                            }`}

                        >
                          ADD RATE CARD
                        </button>
                      </li></Link>
                  }
                  {status.ratecardpage == 1 &&
                    <Link to={`/ratecard`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/ratecard" ? "active" : ""
                            }`}

                        >
                          RATE CARD MATRIX
                        </button>
                      </li></Link>
                  }
                  {status.addmasterwarrentypage == 1 &&
                    <Link to={`/addmasterwarrenty`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/addmasterwarrenty" ? "active" : ""
                            }`}

                        >
                          ADD MASTER WARRANTY
                        </button>
                      </li></Link>
                  }
                  {status.masterpage == 1 &&
                    <Link to={`/master_warrenty`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/master_warrenty" ? "active" : ""
                            }`}

                        >
                          MASTER WARRANTY
                        </button>
                      </li></Link>
                  }
                  {status.addpostsalewarrantypage == 1 &&
                    <Link to={`/addpostsalewarranty`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/addpostsalewarranty" ? "active" : ""
                            }`}

                        >
                          ADD POST SALE WARRANTY
                        </button>
                      </li></Link>
                  }
                  {status.postsalepage == 1 &&
                    <Link to={`/post_sale_warrenty`}>
                      <li className="nav-item">
                        <button
                          className={`nav-link ${activeTab === "/post_sale_warrenty" ? "active" : ""
                            }`}

                        >
                          POST SALE WARRANTY
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
export default Ratecardtabs;
