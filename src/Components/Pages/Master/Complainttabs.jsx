import React, { useEffect, useState } from 'react';
import ComplaintCode from './Complaintcode';
import ActionCode from './Actioncode';
import ReasonCode from './Reasoncode';
import { Complaintlist } from '../Complaint/Complaintlist';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

function Complainttabs() {
  const [activeTab, setActiveTab] = useState('DefectGroup');

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
          <span style={{paddingLeft:"20px",color:'#FFFFFF'}}>Fault Code</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="container-fluid">
            <div className="col-sm-6 p-0" style={{ width: '100%' }}>
            <div className="tabsMenu" style={{fontSize:"14px", marginLeft: "12px",fontWeight:"600",fontFamily:"Nunito"}}>
              <ul className="nav nav-tabs ">

              <Link to={`/DefectGroup`}><li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "/DefectGroup" ? "active" : "onClick={() => setActiveTab('DefectGroup')}"}`}

                  >
                  DEFECT GROUP
                  </button>
                </li></Link>
                <Link to={`/TypeOfDefect`}> <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "/TypeOfDefect" ? "active" : "onClick={() => setActiveTab('TypeOfDefect')}"}`}

                  >
                    TYPE OF DEFECT
                  </button>
                </li></Link>
                <Link to={`/SiteDefect`}>  <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "/SiteDefect" ? "active" : "onClick={() => setActiveTab('SiteDefect')}"}`}

                  >
                   SITE DEFECT
                  </button>
                </li></Link>
                <Link to={`/Activity`}>  <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "/Activity" ? "active" : "onClick={() => setActiveTab('Activity')}"}`}

                  >
                   ACTIVITY
                  </button>
                </li></Link>
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

export default Complainttabs;
