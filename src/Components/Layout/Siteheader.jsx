import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Logo from '../../images/Liebherr-logo-768x432.png'
import { Avatar } from '@mui/material';
import { App_Url, Base_Url, secretKey } from '../Utils/Base_Url';
import CryptoJS from 'crypto-js';
import axios from "axios";
import { AllMasterpage, AnnextureReport, BussinessArray, CallStatusArray, ClaimReport, customerArray, EnquiryArray, FaultArray, FeedbackReport, FranchiseArray, LhiArray, locationArray, PincodeAlloArray, ProductArray, QuotationArray, RateCardArray, ReportsArray, ServiceContract, SpareArray, TicketArray, TicketReport, ShipmentArray, EngineerArray, FaultReportArray, FaqArray, AssetArray, SpareReportArray, GrnArray } from '../Utils/PageArray';


export function Siteheader() {
  const [Name, setName] = useState([])
  const token = localStorage.getItem("token");
  const [masterpage, setMasterPage] = useState([])
  const [ticketpage, setTicketpage] = useState([])
  const [enquirypage, setEnquirypage] = useState([])
  const [quotationpage, setQuotationpage] = useState([])
  const [reportpage, setReportpage] = useState([])
  const [grnpage, setGrnpage] = useState([])
  const [faqpage, setFaqpage] = useState([])
  const [status, setStatus] = useState([])
  const Username = localStorage.getItem('lhiuser')

  const redirect = () => {
    window.location.pathname = '/registercomaplaint'
  }

  function clearAllCookies() {
    document.cookie.split(";").forEach(cookie => {
      let [name] = cookie.split("=");
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    });
  }

  const clearLocal = async () => {
    try {

      clearAllCookies();
      localStorage.clear();
      window.location.href = App_Url
    }
    catch (error) {
      console.error('error signing out', error)
    }
  }

  const Decrypt = (encrypted) => {
    encrypted = encrypted.replace(/-/g, '+').replace(/_/g, '/'); // Reverse URL-safe changes
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Convert bytes to original string
  };

  async function getpageroledata() {

    const storedEncryptedRole = localStorage.getItem("Userrole");
    const decryptedRole = Decrypt(storedEncryptedRole);

    const data = {
      role: decryptedRole,
      masterpageid: AllMasterpage,
      ticketpageid: TicketArray,
      quotationpageid: QuotationArray,
      enquirypageid: EnquiryArray,
      reportpageid: ReportsArray,
      locationpageid: locationArray,
      pincodepageid: PincodeAlloArray,
      productpageid: ProductArray,
      customerpageid: customerArray,
      bussinesspageid: BussinessArray,
      franchpageid: FranchiseArray,
      callstatuspageid: CallStatusArray,
      lhiuserpageid: LhiArray,
      servicepageid: ServiceContract,
      faultpageid: FaultArray,
      ratepageid: RateCardArray,
      sparearray: SpareArray,
      ticketreportid: TicketReport,
      claimreportid: ClaimReport,
      feedbackreportid: FeedbackReport,
      annexureid: AnnextureReport,
      shipmentpageid: ShipmentArray,
      engineermasterpageid: EngineerArray,
      faultreportid: FaultReportArray,
      faqpageid: FaqArray,
      assetreportid: AssetArray,
      sparereportid: SpareReportArray,
      grnpageid: GrnArray,
    }


    axios.post(`${Base_Url}/getpageroledata`, data, {
      headers: {
        Authorization: token, // Send token in headers
      },
    })
      .then((res) => {
        setMasterPage(res.data.masterpage)
        setEnquirypage(res.data.enquirypage)
        setQuotationpage(res.data.quotationpage)
        setReportpage(res.data.reportpage)
        setTicketpage(res.data.ticketpage)
        setFaqpage(res.data.faqpage)
        setStatus(res.data)
      })
      .then((err) => {
        console.log(err)
      })
  }



  useEffect(() => {
    getpageroledata()
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

            {masterpage == 1 && <li className="nav-item dropdown">
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
                {status.locationpage == 1 &&
                  <li><Link className="dropdown-item" to="/location">Location</Link></li>
                }
                {status.pincodepage == 1 &&
                  <li><Link className="dropdown-item" to="/pincode_allocation">Pincode Allocation</Link></li>

                }
                {status.productpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/products">Product Master</Link></li>
                }
                {status.customerpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/Customerlist">End Customer Master</Link></li>}
                {status.bussinesspage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/business_partner">Business Partner Master</Link></li>}
                {status.franchpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/Franchisemasterlist">Franchise Master</Link></li>}
                {status.franchpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/Engineerlist">Engineer Master</Link></li>}
                {status.engineermasterpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/callstatus">Call Status Code Master</Link></li>}
                {status.lhiuserpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/Lhiuser">LHI User Master</Link></li>}
                {status.servicepage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/servicecontract">Service Contract Registration</Link></li>}
                {status.faultpage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/DefectGroup">Fault Code</Link></li>}
                {status.ratepage == 1 &&
                  <li>
                    <Link className="dropdown-item" to="/ratecard">Rate card Matrix</Link></li>}
                {status.sparearray == 1 &&
                  <li><Link className="dropdown-item" to="/productspare">Service BOM</Link></li>
                }
                {status.shipmentpage == 1 &&
                  <li><Link className="dropdown-item" to="/shipment_fg">Shipment Filters</Link></li>
                }
                {status.grnpage == 1 &&
                  <li><Link className="dropdown-item" to="/inwardLiebherr">GRN</Link></li>
                }


              </ul>
            </li>}
            {ticketpage == 1 &&
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
            }

            {quotationpage == 1 &&
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
            }
            {enquirypage == 1 &&
              <li className="nav-item dropdown">
                <Link className={`nav-link site `}
                  to={`/enquiryListing`}
                  id="navbarDropdown"
                  role="button"
                  aria-expanded="false"
                >
                  Enquiry
                </Link>

              </li>
            }

            {reportpage == 1 &&
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
                  {status.ticketreport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/complaintreport">Ticket Report</Link></li>}
                  {status.claimreport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/claimreport">Claim Report</Link></li>}
                  {status.feedbackreport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/feedbackreportlist">FeedBack Report</Link></li>}
                  {status.annexure == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/annexturelist">Annexture Report</Link></li>}
                  {status.faultreport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/faultcodereport">Fault Code Report</Link></li>}
                  {status.assetreport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/assetreport">All Asset Report</Link></li>}
                  {status.sparereport == 1 &&
                    <li>
                      <Link className="dropdown-item" to="/sparereport">Spare Consumption Report</Link></li>}
                </ul>
              </li>
            }



            {/* {faqpage == 1 &&
              <li className="nav-item dropdown">
                <Link className={`nav-link site `}
                  to={`/faq`}
                  id="navbarDropdown"
                  role="button"
                  aria-expanded="false"
                >
                  FAQ
                </Link>

              </li>
            } */}

          </ul>





          <div className="dropdown text-end d-flex  justify-content-center" style={{ alignItems: "center" }}>
            <div className='mx-2'>
              <p className='m-0'>Welcome User , <b style={{ textTransform: "capitalize" }}>{Username}</b></p>
            </div>
            <Link className="btn btn-primary mr-2 newcomplaint text-light" onClick={redirect}>New Ticket</Link>


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
