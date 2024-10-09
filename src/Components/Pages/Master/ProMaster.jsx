import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import  Category from './Category';
import Subcategory from './Subcategory';
import Product from './Product';

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
      default:
        return <Category />;
    }
  };

  return (
    <>
      <style>
        {`
            .gray-tab{
            background : ##cdd2d7;
            }
  
            .headings {
              background: #ffd000ea;
              margin-bottom: 15px;
              padding: 5px 15px;
              font-size: 18px;
              font-weight: 600;
              text-transform: uppercase;
              box-shadow: 0 0 4px #ddd;
            }
            
            
          `}
      </style>

      <div className="container-fluid p-0">
        {/* Top Header */}
        <div className="text-left headings">
          <span>PRODUCT MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="gray-tab">
            <div className="col-sm-6 p-3" style={{ width: '100%' }}>

              <ul className="nav nav-tabs mb-3">
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
              </ul>
            </div>


            {/* Tab Content */}
            <div className="row justify-content-center no-gutters">
              <div className="col-12 col-lg-10 col-custom">
                <div className="tab-content">
                  {renderTabContent()}
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