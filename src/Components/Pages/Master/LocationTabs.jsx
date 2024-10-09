import React, { useState } from 'react';
import Location from './Location';
import Regions from './Regions';
import Geostate from './Geostate';
import Geocity from './Geocity';
import Area from './Area';
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


      default:
        return <Location />;
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
          <span>LOCATION</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="gray-tab">
            <div className="col-sm-6 p-3" style={{ width: '100%' }}>

              <ul className="nav nav-tabs mb-3">
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
                    REGIONS
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
                {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
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

export default LocationTabs;
