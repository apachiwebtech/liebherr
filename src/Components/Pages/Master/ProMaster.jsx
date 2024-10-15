import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import  Category from './Category';
import Subcategory from './Subcategory';
import Product from './Product';
import ProductType from './ProductType';

function ProMaster() {
  const [activeTab, setActiveTab] = useState('category');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'category':
        return <Category />;
      case 'subcategory':
        return <Subcategory />;
      case 'product':
        return <Product />;
        case 'producttype':
           return <ProductType />;
      default:
        return <Category />;
    }
  };

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
          <span style={{paddingLeft:"20px"}}>PRODUCT MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
            <div className="tabsMenu" style={{fontSize:"14px", marginLeft: "12px",fontWeight:"600",fontFamily:"Nunito"}}>
              <ul className="nav nav-tabs ">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'category' ? 'active' : ''}`}
                    onClick={() => setActiveTab('category')}
                  >
                    CATEGORY
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'subcategory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('subcategory')}
                  >
                    SUBCATEGORY
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'product' ? 'active' : ''}`}
                    onClick={() => setActiveTab('product')}
                  >
                    PRODUCT
                  </button>
                </li>
                <li className="nav-item">

                  
                  <button
                    className={`nav-link ${activeTab === 'producttype' ? 'active' : ''}`}
                    onClick={() => setActiveTab('producttype')}
                  >
                    PRODUCT TYPE
                  </button>
                </li>
              </ul>
            </div>

{/* this is  */}
            {/* Tab Content */}
            <div className="col-12 col-custom" style={{paddingLeft:"12px",paddingRight:"12px"}}>
            <div className="tab-content">
                <div className="tab-content">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default ProMaster;