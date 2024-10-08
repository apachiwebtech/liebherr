import React from "react";

import { Link } from "react-router-dom";


export function Siteheader(params) {
  return (

    <header className="p-3 border-bottom">
      <div className="container-fuild">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center  mb-2 mb-lg-0 mr-5 text-dark text-decoration-none img" >
            <img src="images\Liebherr-logo-768x432.png"  />
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ml-5">

            <li>
              <Link className="nav-link   px-2 link-secondary activeM" to="/" >Dashboard </Link></li>

            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle activeM " to="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Master</Link>
               

              <ul className="dropdown-menu activeM" aria-labelledby="navbarDropdown">
                <li >
                  <Link className="dropdown-item" to="/location">Location</Link></li>
                <li>
                  <Link className="dropdown-item" to="/endcustomer">End Customer Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/channelpartner">Channel Partner Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/serviceagent">Service Agent Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/callstatus">Call Status Code Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/pincode">Pincode Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/lhiuser">LHI User Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/serviceproduct">Service Product Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/complaincode">Complain code, Reason code & Action code</Link></li>
                <li>
                  <Link className="dropdown-item" to="/ratecard">Rate card Matrix</Link></li>
                <li>
                  <Link className="dropdown-item" to="/productspare">Product & Spare mapping master</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle activeM" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" >
                Complaints
              </a>
              <ul className="dropdown-menu activeM" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="/Complaintlist.jsx">Layout 1</Link></li>
                <li>
                  <Link className="dropdown-item" to="/Complaintgrid.jsx">Layout 2</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle activeM" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Reports
              </a>
              <ul className="dropdown-menu activeM" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="#">Complaint Report</Link></li>
                <li>
                  <Link className="dropdown-item" to="#">Claim Report</Link></li>
              </ul>
            </li>
          </ul>





          <div className="dropdown text-end">
            <a className="btn btn-primary newcomplaint" href="Registercomplaint.jsx">New Complaint</a>

            <a href="#" className="link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" className="rounded-circle" />
            </a>
            <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" to="#">New project...</Link></li>
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" to="#">Settings</Link></li>
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" to="#">Profile</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" to="/login" tabIndex="0">Sign out</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </header>
  )
}

