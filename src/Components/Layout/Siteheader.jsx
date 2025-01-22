import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'
import { Avatar } from '@mui/material';
import { App_Url } from '../Utils/Base_Url';




export function Siteheader({ headerState }) {
  const [Name, setName] = useState([])

  const navigate = useNavigate();
  const getsearch = localStorage.getItem("search")

  const redirect = () => {
    window.location.pathname = '/registercomaplaint'
  }

  const clearLocal = async () => {
    try {
      localStorage.clear();
      window.location.href = App_Url
    }
    catch (error) {
      console.error('error signing out', error)
    }
  }

  useEffect(() => {
    const updatedTickets = localStorage.getItem('Lhiuser') || ""; // Directly use the stored string or an empty string
    const firstLetter = updatedTickets.charAt(0); // Safe to use charAt here
    setName(firstLetter)
  }, [])


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
                to="/dashboard"
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
                  <Link className="dropdown-item" to="/Franchisemasterlist">Franchise Master</Link></li>
                {/* <li>
                  <Link className="dropdown-item" to="/serviceagent">Service Agent Master</Link></li> */}
                <li>
                  <Link className="dropdown-item" to="/callstatus">Call Status Code Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/Lhiuser">LHI User Master</Link></li>
                <li>
                  <Link className="dropdown-item" to="/servicecontract">Service Contract Registration</Link></li>
                {/* <li>

                  <Link className="dropdown-item" to="/serviceproduct">Service Product Master</Link></li> */}
                <li>
                  <Link className="dropdown-item" to="/DefectGroup">Fault Code</Link></li>
                <li>
                  <Link className="dropdown-item" to="/ratecard">Rate card Matrix</Link></li>
                <li>
                  <Link className="dropdown-item" to="/addenquiry">Enquiry Master</Link></li>
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
              <Link className={`nav-link site `}
                to={`/quotationlist`}
                id="navbarDropdown"
                role="button"
                aria-expanded="false"
              >
                Quotations
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
                  <li>
                  <Link className="dropdown-item" to="/feedbackreportlist">FeedBack Report</Link></li>
              </ul>
            </li>
          </ul>





          <div className="dropdown text-end d-flex align-content-center justify-content-center">
           {headerState ? null: <Link className="btn btn-primary mr-2 newcomplaint text-light" onClick={redirect}>New Ticket</Link>}


            <a href="#" className="link-dark d-flex align-content-center justify-content-center text-decoration-none " id="dropdownUser1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  textTransform: "uppercase", // Convert text to uppercase
                  display: 'flex',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
              >
                {Name}
              </Avatar>

            </a>
            <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" onClick={clearLocal} tabIndex="0">Sign out</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </header>
  )
}
