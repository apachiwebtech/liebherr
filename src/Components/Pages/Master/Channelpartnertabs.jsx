import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Channelpartner from './Channelpartner';

function Channelpartnertabs() {
  const [activeTab, setActiveTab] = useState('Channelpartner');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Channelpartner':
        return <Channelpartner />;
   
      default:
        return <Channelpartner />;
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
              padding: 10px 15px;
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
          <span>CHANNEL PARTNER MASTER</span>
        </div>

        {/* Nav Tabs */}
        <div class="row">
          <div className="gray-tab">
            <div className="tabsMenu.container-fluid" style={{ width: '100%' }}>

              <ul className="nav nav-tabs mb-3">
              
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'Channelpartner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Channelpartner')}>
                    CHANNEL PARTNER
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

export default Channelpartnertabs;