import React, { useEffect,useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

function EnquiryTabs() {
  const [activeTab, setActiveTab] = useState('/addenuiry');
 
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
             <span style={{ paddingLeft: "20px",color:'#FFFFFF' }}>Enquiry MASTER</span>
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
                           activeTab === "/addenquiry" ? "active" : "onClick={() => setActiveTab('addenquiry')}"
                         }`}
                         
                       >
                         Enquiry
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

export default EnquiryTabs;
