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
function ProMaster() {
  const [activeTab, setActiveTab] = useState('/category');

  useEffect(() => {

    setActiveTab(window.location.pathname);

  }, [window.location.pathname]);



  return (
    <>
      <style>
        {`
               .headings {
              background: #ffd000ea;
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
          <span style={{ paddingLeft: "20px" }}>PRODUCT MASTER</span>
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
                  <li className="nav-item">
                    <Link to={`/category`}><button
                      className={`nav-link ${
                        activeTab === "/category" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("category")}
                    >
                      CATEGORY
                    </button></Link>
                  </li>
                  <li className="nav-item">
                  <Link to={`/subcategory`}><button
                      className={`nav-link ${
                        activeTab === "/subcategory" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("subcategory")}
                    >
                      SUBCATEGORY
                    </button></Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/products`}><button
                      className={`nav-link ${
                        activeTab === "/products" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("products")}
                    >
                      PRODUCT
                    </button></Link>
                  </li>
                  <li className="nav-item">
                  <Link to={`/producttype`}><button
                      className={`nav-link ${
                        activeTab === "/producttype" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("producttype")}
                    >
                      PRODUCT TYPE
                    </button></Link>
                  </li>
                  <li className="nav-item">
                  <Link to={`/productline`}> <button
                      className={`nav-link ${
                        activeTab === "/productline" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("productline")}
                    >
                      PRODUCT LINE
                    </button></Link>
                  </li>
                  <li className="nav-item">
                    <Link  to={`/material`}><button
                      className={`nav-link ${
                        activeTab === "/material" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("material")}
                    >
                      MATERIAL
                    </button></Link>
                  </li>
                  <li className="nav-item">
                  <Link  to={`/manufacturer`}><button
                      className={`nav-link ${
                        activeTab === "/manufacturer" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("manufacturer")}
                    >
                      MANUFACTURER
                    </button></Link>
                  </li>
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
