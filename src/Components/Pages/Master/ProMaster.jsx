import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Category from "./Category";
import Subcategory from "./Subcategory";
import ProductType from "./ProductType";
import ProductLine from "./ProductLine";
import Material from "./Material";
import Manufacturer from "./Manufacturer";
import { Products } from "./Products";
import { Link } from "react-router-dom";
import CryptoJS from 'crypto-js';
import axios from "axios";
import { Base_Url, secretKey } from '../../Utils/Base_Url';

function ProMaster() {
  const [activeTab, setActiveTab] = useState('/category');
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
      categorypage: '7',
      subcatpage: '8',
      producttypepage: '9',
      productlinepage: '10',
      materialpage: '11',
      manufacturerpage: '12',
      productspage: '13',
    }


    axios.post(`${Base_Url}/getproductroledata`, data, {
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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>PRODUCT MASTER</span>
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
                  {status.categorypage == 1 &&
                    <li className="nav-item">
                      <Link to={`/category`}><button
                        className={`nav-link ${activeTab === "/category" ? "active" : "onClick={() => setActiveTab('category')}"
                          }`}

                      >
                        CATEGORY
                      </button></Link>
                    </li>
                  }
                  {status.subcatpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/subcategory`}><button
                        className={`nav-link ${activeTab === "/subcategory" ? "active" : "onClick={() => setActiveTab('subcategory')}"
                          }`}

                      >
                        SUBCATEGORY
                      </button></Link>
                    </li>
                  }
                  {status.producttypepage == 1 &&
                    <li className="nav-item">
                      <Link to={`/producttype`}><button
                        className={`nav-link ${activeTab === "/producttype" ? "active" : "onClick={() => setActiveTab('producttype')}"
                          }`}

                      >
                        PRODUCT TYPE
                      </button></Link>
                    </li>
                  }

                  {status.productlinepage == 1 &&
                    <li className="nav-item">
                      <Link to={`/productline`}> <button
                        className={`nav-link ${activeTab === "/productline" ? "active" : "onClick={() => setActiveTab('productline')}"
                          }`}

                      >
                        PRODUCT LINE
                      </button></Link>
                    </li>
                  }
                  {status.materialpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/material`}><button
                        className={`nav-link ${activeTab === "/material" ? "active" : "onClick={() => setActiveTab('material')}"
                          }`}

                      >
                        MATERIAL
                      </button></Link>
                    </li>
                  }
                  {status.manufacturerpage == 1 &&
                    <li className="nav-item">
                      <Link to={`/manufacturer`}><button
                        className={`nav-link ${activeTab === "/manufacturer" ? "active" : "onClick={() => setActiveTab('manufacturer')}"
                          }`}

                      >
                        MANUFACTURER
                      </button></Link>
                    </li>
                  }
                  {status.productspage == 1 &&
                    <li className="nav-item">
                      <Link to={`/products`}><button
                        className={`nav-link ${activeTab === "/products" ? "active" : " onClick={() => setActiveTab('products')}"
                          }`}

                      >
                        PRODUCT
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

export default ProMaster;
