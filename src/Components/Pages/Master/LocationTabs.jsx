import React, { useState } from 'react';
import Location from './Location';
import Regions from './Regions';
import 'bootstrap/dist/css/bootstrap.min.css';

function LocationTabs() {
  const [activeTab, setActiveTab] = useState('country');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'country':
        return <Location />;
      case 'regions':
        return <Regions />;
      // Add cases for other tabs here
      default:
        return <Location />;
    }
  };

  return (
    <>
      {/* Inline CSS to match your desired layout */}
      <style>
        {`
          .container-fluid {
            padding-left: 0 !important; /* Remove left padding */
            padding-right: 0 !important; /* Remove right padding */
          }

          .row.no-gutters {
            margin-right: 0;  /* Remove right margin */
            margin-left: 0;   /* Remove left margin */
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .table {
            margin-top: 20px;
          }

          .nav-tabs .nav-link {
            border-radius: 0;
            padding: 10px;
          }

          .tab-content {
            padding: 5px;
          }

          .col-custom {
            padding-left: 0 !important; /* Remove custom column padding */
            padding-right: 0 !important; /* Remove custom column padding */
          }
        `}
      </style>

      <div className="container-fluid mt-4">
        {/* Top Header */}
        <div className="text-center mb-4">
          <h2>Location</h2>
        </div>

        {/* Nav Tabs */}
        <div className="row justify-content-center no-gutters"> {/* Use no-gutters class */}
          <div className="col-12 col-lg-10 col-custom"> {/* Apply custom column class */}
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
              {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row justify-content-center no-gutters"> {/* Use no-gutters class */}
          <div className="col-12 col-lg-10 col-custom"> {/* Apply custom column class */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}

export default LocationTabs;
