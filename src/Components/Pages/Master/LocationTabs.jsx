import React, { useState } from 'react';
import Location from './Location';
import Regions from './Regions';
import Geostate from './Geostate';
import Geocity from './Geocity';
import Area from './Area';
import Pincode from './Pincode';
import 'bootstrap/dist/css/bootstrap.min.css';

function LocationTabs() {
  const [activeTab, setActiveTab] = useState('country');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'country':
        return <Location />;
      case 'regions':
        return <Regions />;
      case 'geostate':
        return <Geostate />;
      case 'geocity':
        return <Geocity />;
      case 'area':
        return <Area />;
        case 'pincode':
         return <Pincode />;


      default:
        return <Location />;
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
          <span style={{paddingLeft:"20px"}}>LOCATION</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
            <div className="tabsMenu" style={{fontSize:"14px", marginLeft: "12px",fontWeight:"600",fontFamily:"Nunito"}}>
              <ul className="nav nav-tabs ">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'country' ? 'active' : ''}`}
                    onClick={() => setActiveTab('country')}
                  >
                    COUNTRY
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'regions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('regions')}
                  >
                    REGION
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'geostate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('geostate')}
                  >
                    GEO STATE
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'geocity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('geocity')}
                  >
                    GEO CITY
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'area' ? 'active' : ''}`}
                    onClick={() => setActiveTab('area')}
                  >
                    AREA
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'pincode' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pincode')}
                  >
                    PINCODE
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

export default LocationTabs;
