import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'
import { Avatar } from '@mui/material';
import { App_Url } from '../Utils/Base_Url';


const Loginheader = (params) => {
  const [Name, setName] = useState([])
    const location = useLocation(); // Get current route


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





            <li
              className={`nav-item dropdown ${location.pathname === "/csp/ticketlist" ? "active-class" : ""}`}
              style={location.pathname === "/csp/ticketlist" ? { background: '#0d6efd', borderRadius: '5px' } : {}}
            >
              <Link
                to={`/csp/ticketlist`}
                className={`nav-link site ${location.pathname === "/csp/ticketlist" ? "text-light" : ""}`}
                id="navbarDropdown"
                role="button"
                aria-expanded="false"
              >
                Tickets
              </Link>
            </li>

            <li
              className={`nav-item dropdown ${location.pathname === "/csp/engineeringlist" ? "active-class" : ""}`}
              style={location.pathname === "/csp/engineeringlist" ? { background: '#0d6efd', borderRadius: '5px' } : {}}
            >
              <Link
                to={`/csp/engineeringlist`}
                className={`nav-link site ${location.pathname === "/csp/engineeringlist" ? "text-light" : ""}`}
                id="navbarDropdown"
                role="button"
                aria-expanded="false"
              >
                Engineering Listing
              </Link>
            </li>



          </ul>





          <div className="dropdown text-end">
            {/* <Link className="btn btn-primary newcomplaint" onClick={redirect}>New Ticket</Link> */}

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
                <Link className="dropdown-item" to="/msp/mspdata">MSP Data</Link></li>
              <li className="dropdown-item" role="button">
                <Link className="dropdown-item" to="/login" tabIndex="0" onClick={clearLocal}>Sign out</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </header>
  )
}

export default Loginheader
