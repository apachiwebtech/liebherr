import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MasterFranchise from './MasterFranchise';
import Childfranchisemaster from './Childfranchisemaster';
import EngineerMaster from './EngineerMaster';

function MasterFranchiseTabs() {
  const [activeTab, setActiveTab] = useState('MasterFranchise');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'MasterFranchise':
        return <MasterFranchise />;
        case 'Childfranchisemaster':
            return <Childfranchisemaster />;
            case 'EngineerMaster':
              return <EngineerMaster />;



      default:
        return <MasterFranchise />;
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
          <span style={{paddingLeft:"20px"}}>FRANCHISE MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
            <div className="tabsMenu" style={{fontSize:"14px", marginLeft: "12px",fontWeight:"600",fontFamily:"Nunito"}}>
              <ul className="nav nav-tabs ">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'MasterFranchise' ? 'active' : ''}`}
                    onClick={() => setActiveTab('MasterFranchise')}
                  >
                   FRANCHISE MASTER
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'Childfranchisemaster' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Childfranchisemaster')}
                  >
                   CHILD FRANCHISE MASTER
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'EngineerMaster' ? 'active' : ''}`}
                    onClick={() => setActiveTab('EngineerMaster')}
                  >
                    ENGINEER MASTER
                  </button>
                </li>    
                {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
              </ul>
            </div> 
            </div>


            {/* Tab Content */}       
              <div className="col-12 col-custom" style={{paddingLeft:"12px",paddingRight:"12px"}}>
                <div className="tab-content">
                  {renderTabContent()}
                </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MasterFranchiseTabs;