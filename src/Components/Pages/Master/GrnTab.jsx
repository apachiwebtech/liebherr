import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function GrnTab() {

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
          <span style={{ paddingLeft: "20px", color: '#FFFFFF' }}>GRN</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
              <div className="tabsMenu" style={{ fontSize: "14px", marginLeft: "12px", fontWeight: "600", fontFamily: "Nunito" }}>
                <ul className="nav nav-tabs ">
                  <li className="nav-item">
                    <Link to={`/csp/cspgrn`}><button
                      className={`nav-link ${activeTab === '/csp/cspgrn' ? 'active' : ' onClick={() => setActiveTab("csp/cspgrn")}'}`}

                    >
                      CREATE GRN
                    </button></Link>
                  </li>

                  <li className="nav-item">
                    <Link to={`/csp/grnlisting`}> <button
                      className={`nav-link ${activeTab === '/csp/grnlisting' ? 'active' : ' onClick={() => setActiveTab("grnlisting")}'}`}

                    >
                      GRN INWARD LISTING
                    </button></Link>
                  </li>

                  <li className="nav-item">
                    <Link to={`/csp/spareoutward`}> <button
                      className={`nav-link ${activeTab === '/csp/spareoutward' ? 'active' : ' onClick={() => setActiveTab("spareoutward")}'}`}

                    >
                      SPARE OUTWARD
                    </button></Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/csp/grnoutward`}> <button
                      className={`nav-link ${activeTab === '/csp/grnoutward' ? 'active' : ' onClick={() => setActiveTab("grnoutward")}'}`}

                    >
                      GRN OUTWARD LISTING
                    </button></Link>
                  </li>
                  <li
                    className="nav-item">
                    <Link to={`/csp/cspstock`}> <button
                      className={`nav-link ${activeTab === '/csp/cspstock' ? 'active' : ' onClick={() => setActiveTab("cspstock")}'}`}

                    >
                      Stock
                    </button></Link>
                  </li>
                  <li
                    className="nav-item">
                    <Link to={`/csp/mslcsp`}> <button
                      className={`nav-link ${activeTab === '/csp/mslcsp' ? 'active' : ' onClick={() => setActiveTab("mslcsp")}'}`}

                    >
                      MSL Listing
                    </button></Link>
                  </li>

                  {/* Add other tabs like GEO STATE, GEO CITY, AREA */}
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

export default GrnTab;
