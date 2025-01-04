import React, { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Lhiuser from "./Lhiuser";
import { Link } from "react-router-dom";

function Lhiusertabs() {
  const [activeTab, setActiveTab] = useState("Lhiuser");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Lhiuser":
        return <Lhiuser />;

      default:
        return <Lhiuser />;
    }
  };

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
             <span style={{ paddingLeft: "20px",color:'#FFFFFF' }}>LHI USER MASTER</span>
           </div>
   
           {/* Nav Tabs */}
           <div class="row">
             <div className="container-fluid">
               <div className="col-sm-6 p-0" style={{ width: "100%" }}>
                 <div
                   className="tabsMenu"
                   style={{
                     fontSize: "14px",
                     marginLeft: "12px",
                     fontWeight: "600",
                     fontFamily: "Nunito",
                   }}
                 >
                   <ul className="nav nav-tabs ">
                     <li className="nav-item">
                       <Link to={`/Lhiuser`}><button
                         className={`nav-link ${
                           activeTab === "/Lhiuser" ? "active" : "onClick={() => setActiveTab('Lhiuser')}"
                         }`}
                         
                       >
                         LHI USER
                       </button></Link>
                     </li>
                     <li className="nav-item">
                     <Link to={`/Roleright`}><button
                         className={`nav-link ${
                           activeTab === "/Roleright" ? "active" : "onClick={() => setActiveTab('Roleright')}"
                         }`}
                         
                       >
                         Role Rights
                       </button></Link>
                     </li>
                    
                     <li className="nav-item">
                     <Link to={`/Roleassign`}><button
                         className={`nav-link ${
                           activeTab === "/producttype" ? "active" : "onClick={() => setActiveTab('Roleassign')}"
                         }`}
                         
                       >
                         Role Assign
                       </button></Link>
                     </li>
                   </ul>
                 </div>
   
   
               </div>
             </div>
           </div>
         </div>
    </>
  );
}

export default Lhiusertabs;
