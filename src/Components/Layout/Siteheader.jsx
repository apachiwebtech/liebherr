import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'




export function Siteheader(params) {





  const navigate = useNavigate();
  const redirect = () => {
    window.location.pathname = '/registercomaplaint'
  }

  const clearLocal = async () => {
    try {
      localStorage.clear();
      navigate('/login');
    }
    catch (error) {
      console.error('error signing out', error)
    }
  }

  return (

    <header className="p-3 border-bottom">
      <div className="container-fuild">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
          <a href="/" className="d-flex align-items-center  mb-2 mb-lg-0 mr-5 text-dark text-decoration-none img" >
            <img src={Logo} />
          </a>

          <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ml-5">

            <li>
              <Link className={`nav-link px-2 link-secondary site `}
                to="/"
        >
                Dashboard
              </Link></li>

            <li className="nav-item dropdown">
              <Link className={`nav-link dropdown-toggle site `}
                to="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                >
                Master
              </Link>


              <ul className="dropdown-menu site" aria-labelledby="navbarDropdown">
                <li >
                  <Link className="dropdown-item" to="/location">Location</Link></li>
                <li>
                  <Link className="dropdown-item" to="/category">Product Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/Customerlist">End Customer Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/channelpartner">Channel Partner Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/MasterFranchise">Franchise Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/serviceagent">Service Agent Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/callstatus">Call Status Code Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/lhiusertabs">LHI User Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/servicecontract">Service Contract Registration</Link></li>
                <li>

                  <Link className="dropdown-item" to="/serviceproduct">Service Product Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/DefectGroup">Fault Code</Link></li>
                <li>
                  <Link className="dropdown-item" to="/ratecard">Rate card Matrix</Link></li>
                <li>
                  <Link className="dropdown-item" to="/productspare">Product & Spare mapping master</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link className={`nav-link site `}
                to={`/complaintlist`}
                id="navbarDropdown"
                role="button"
                aria-expanded="false"
               >
                Tickets
              </Link>

            </li>
            <li className="nav-item dropdown">
              <Link className={`nav-link dropdown-toggle site `}
                to="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
        >
                Reports
              </Link>
              <ul className="dropdown-menu site" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="/complaintreport">Ticket Report</Link></li>
                <li>
                  <Link className="dropdown-item" to="/claimreport">Claim Report</Link></li>
              </ul>
            </li>
          </ul>





          <div className="dropdown text-end">
            <Link className="btn btn-primary newcomplaint" onClick={redirect}>New Ticket</Link>

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
                <Link className="dropdown-item" onClick={clearLocal} tabIndex="0">Sign out</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </header>
  )
}

  