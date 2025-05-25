import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Base_Url, secretKey } from '../../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import axios from "axios";

function Grntab() {

    const [activeTab, setActiveTab] = useState('/location');
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
            stockpage: '57',
            mslpage: '58',
            addmslpage: '59',
            grnadminlist: '67',
            grnadminoutlist: '68',
            inwardLiebherr: '69',
            outward: '70',
            inwardOthers: '71',

        }


        axios.post(`${Base_Url}/getgrnroledata`, data, {
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
                    <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>GRN</span>
                </div>

                {/* Nav Tabs */}
                <div class="row">
                    <div className="container-fluid">
                        <div className="col-sm-6 p-0" style={{ width: '100%' }}>
                            <div className="tabsMenu" style={{ fontSize: "14px", marginLeft: "12px", fontWeight: "600", fontFamily: "Nunito" }}>
                                <ul className="nav nav-tabs ">
                                    {status.inwardLiebherr == 1 &&
                                        <Link to={`/inwardLiebherr`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/inwardLiebherr" ? "active" : ""}`}>
                                                INWARD LIEBHERR
                                            </button>
                                        </li></Link>
                                    }
                                    {status.inwardOthers == 1 &&
                                        <Link to={`/inwardOthers`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/inwardOthers" ? "active" : ""}`}>
                                                INWARD OTHERS
                                            </button>
                                        </li></Link>
                                    }
                                    {status.grnadminlist == 1 &&
                                        <Link to={`/grnadminlist`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/grnadminlist" ? "active" : ""}`}>
                                                INWARD LISTING
                                            </button>
                                        </li></Link>
                                    }
                                    {status.outward == 1 &&
                                        <Link to={`/outward`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/outward" ? "active" : ""}`}>
                                                 OUTWARD
                                            </button>
                                        </li></Link>
                                    }
                                    {status.grnadminoutlist == 1 &&
                                        <Link to={`/grnadminoutlist`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/grnadminoutlist" ? "active" : ""}`}>
                                                OUTWARD LISTING
                                            </button>
                                        </li></Link>
                                    }
                                    {status.stockpage == 1 &&
                                        <Link to={`/stock`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/stock" ? "active" : ""}`}>
                                                STOCKS
                                            </button>
                                        </li></Link>
                                    }
                                    {status.addmslpage == 1 &&
                                        <Link to={`/addmsl`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/addmsl" ? "active" : ""}`}>
                                                ADD MSL
                                            </button>
                                        </li></Link>
                                    }
                                    {status.mslpage == 1 &&
                                        <Link to={`/msl`}><li className="nav-item">
                                            <button className={`nav-link ${activeTab === "/msl" ? "active" : ""}`}>
                                                MSL LISTING
                                            </button>
                                        </li></Link>
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

export default Grntab;
