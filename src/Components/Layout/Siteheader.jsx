import React from "react";
import { Link } from "react-router-dom";


export function Siteheader(params) {
  return (

    <header className="p-3 border-bottom">
      <div className="container-fuild">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center  mb-2 mb-lg-0 mr-5 text-dark text-decoration-none img" >
            <img src="images/blum.png.png" style={{ height: '50px', width: '130px' }} />
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ml-5">

            <li><a href="/" className="nav-link px-2 link-secondary">Dashboard</a></li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle " href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Master
              </a>

              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li className="dropdown-item" >
                  <Link className="dropdown-item" to="/"></Link></li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/location">Location</Link></li>
                <li className="dropdown-item">
                  <Link classname="dropdown-item" to="/endcustomer" ></Link> End Customer Master</li>
                <li className="dropdown-item">
                  <Link classname="dropdown-item" to="/channelpartner" ></Link>Channel Partner Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/serviceagent" ></Link>Service Agent Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/callstatus"></Link>Call Status Code Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/pincode"></Link>Pincode Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/lhiuser"></Link>LHI User Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/serviceproduct"></Link>Service Product Master</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/complaincode"></Link>Complain code, Reason code & Action code</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/ratecard"></Link>Rate card Matrix</li>
                <li className="dropdown-item">
                  <Link className="dropdown-item" to="/productspare"></Link>Product & Spare mapping master</li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle " href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                Complaints
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a className="dropdown-item " href="Complaintlist.jsx">Layout 1</a></li>
                <li><a className="dropdown-item " href="Complaintgrid.jsx">Layout 2</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Reports
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><a className="dropdown-item" href="#">Complaint Report</a></li>
                <li><a className="dropdown-item" href="#">Claim Report</a></li>
              </ul>
            </li>
          </ul>





          <div className="dropdown text-end">
            <a className="btn btn-primary newcomplaint" href="Registercomplaint.jsx">New Complaint</a>

            <a href="#" className="link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" className="rounded-circle" />
            </a>
            <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
              <li><a className="dropdown-item" href="#">New project...</a></li>
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#">Sign out</a></li>
            </ul>
          </div>
        </div>

      </div>
    </header>
  )
}

