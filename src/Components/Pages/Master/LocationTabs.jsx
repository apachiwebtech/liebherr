import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function LocationTabs() {
  const [activeTab, setActiveTab] = useState('/location');


  useEffect(() => {

    setActiveTab(window.location.pathname);

  }, [window.location.pathname]);



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
          <span style={{paddingLeft:"20px"}}>LOCATION</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
            <div className="tabsMenu" style={{fontSize:"14px", marginLeft: "12px",fontWeight:"600",fontFamily:"Nunito"}}>
              <ul className="nav nav-tabs ">
                <li className="nav-item">
                <Link to={`/location`}><button
                    className={`nav-link ${activeTab === '/location' ? 'active' : ''}`}
                    onClick={() => setActiveTab('location')}
                  >
                    COUNTRY
                  </button></Link>
                </li>
                <li className="nav-item">
                <Link to={`/regions`}> <button
                    className={`nav-link ${activeTab === '/regions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('regions')}
                  >
                    REGION
                  </button></Link>
                </li>
                <li className="nav-item">
                <Link to={`/geostate`}> <button
                    className={`nav-link ${activeTab === '/geostate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('geostate')}
                  >
                    GEO STATE
                  </button></Link>
                </li>
                <li className="nav-item">
                  <Link to={`/area`}><button
                    className={`nav-link ${activeTab === '/area' ? 'active' : ''}`}
                    onClick={() => setActiveTab('area')}
                  >
                    DISTRICT 
                  </button></Link>
                </li>
                <li className="nav-item">
                  <Link to={`/geocity`}><button
                    className={`nav-link ${activeTab === '/geocity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('geocity')}
                  >
                    GEO CITY
                  </button></Link>
                </li>
                <li className="nav-item">
                <Link to={`/pincode`}><button
                    className={`nav-link ${activeTab === '/pincode' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pincode')}
                  >
                    PINCODE
                  </button></Link>
                </li>
                {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
              </ul>
            </div> 
            </div>


            {/* Tab Content */}       
              <div className="col-12 col-custom" style={{paddingLeft:"12px",paddingRight:"12px"}}>
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

export default LocationTabs;
