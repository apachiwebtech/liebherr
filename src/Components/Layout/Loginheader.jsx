import React from "react";
import { Link } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'


const Loginheader = (params) => {
    const redirect = () =>{
        window.location.pathname = '/registercomaplaint'
      }
      return (
    
        <header className="p-3 border-bottom">
          <div className="container-fuild">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
              <a href="/" className="d-flex align-items-center  mb-2 mb-lg-0 mr-5 text-dark text-decoration-none img" >
                <img src={Logo}  />
              </a>
    
              <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0 ml-5">
    
                <li>
                  <Link className="nav-link   px-2 link-secondary site" to="/" >Dashboard </Link></li>
    
            
                <li className="nav-item dropdown">
                  <Link to={`/csp/ticketlist`} className="nav-link  site" href="#" id="navbarDropdown" role="button"  aria-expanded="false" >
                    Tickets
                  </Link>
               
                </li>
                
            
              </ul>
    
    
    
    
    
              <div className="dropdown text-end">
                {/* <Link className="btn btn-primary newcomplaint" onClick={redirect}>New Ticket</Link> */}
    
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

export default Loginheader