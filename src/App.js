import logo from './logo.svg';
import './siteheader.css'
import './App.css';
import React, { Suspense, useState } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Login } from './Components/Authenticate/Login';
import { CSP_Login } from './Components/Authenticate/CSP_Login';
import Callstatus from './Components/Pages/Master/Callstatus';
import Category from './Components/Pages/Master/Category';
import ProductType from './Components/Pages/Master/ProductType';
import Channelpartner from './Components/Pages/Master/Channelpartner';
import Complaintcode from './Components/Pages/Master/Complaintcode';
import { Complaintgrid } from './Components/Pages/Complaint/Complaintgrid';
import { Complaintlist } from './Components/Pages/Complaint/Complaintlist';
import { Complaintview } from './Components/Pages/Complaint/Complaintview';
import { Country } from './Components/Pages/Master/Country';
import Customerlocation from './Components/Pages/Master/Customerlocation';
import { Dashboard } from './Components/Pages/Dashboard';
import Lhiuser from './Components/Pages/Master/Lhiuser';
import { Linklocation } from './Components/Pages/Master/Linklocation';
import Pincode from './Components/Pages/Master/Pincode';
import { Product } from './Components/Pages/Master/Product';
import { Productspare } from './Components/Pages/Master/Productspare';
import Ratecard from './Components/Pages/Master/Ratecard';
import { Registercomplaint } from './Components/Pages/Complaint/Registercomplaint';
import Serviceagent from './Components/Pages/Master/Serviceagent';
import Serviceproduct from './Components/Pages/Master/Serviceproduct';
import Subcategory from './Components/Pages/Master/Subcategory';
import { Siteheader } from './Components/Layout/Siteheader';
import Loginheader from './Components/Layout/Loginheader';
import { Sitefooter } from './Components/Layout/Sitefooter';
import Location from './Components/Pages/Master/Location';
import Regions from './Components/Pages/Master/Regions';
import LocationTabs from './Components/Pages/Master/LocationTabs'
import Geostate from './Components/Pages/Master/Geostate';
import Geocity from './Components/Pages/Master/Geocity';
import Area from './Components/Pages/Master/Area';
import ProMaster from './Components/Pages/Master/ProMaster';
import { Products } from './Components/Pages/Master/Products';
import Franchisemaster from './Components/Pages/Master/Franchisemaster';
import { ChildFranchiselist } from './Components/Pages/Master/Childfranchiselist';
import EngineerMaster from './Components/Pages/Master/EngineerMaster';
import Channelpartnertabs from './Components/Pages/Master/Channelpartnertabs';
import Complainttabs from './Components/Pages/Master/Complainttabs';
import ReasonCode from './Components/Pages/Master/Reasoncode';
import ActionCode from './Components/Pages/Master/Actioncode';
import Serviceagenttabs from './Components/Pages/Master/Serviceagenttabs';
import Groupmaster from './Components/Pages/Master/Groupmaster';
import Callstatuscodetabs from './Components/Pages/Master/Callstatuscodetabs';
import Lhiusertabs from './Components/Pages/Master/Lhiusertabs';
import Serviceproducttabs from './Components/Pages/Master/Serviceproducttabs';
import Ratecardtabs from './Components/Pages/Master/Ratecardtabs';
import EndcustomerTabs from './Components/Pages/Master/Endcustomertabs';
import Endcustomertabs from './Components/Pages/Master/Endcustomertabs';
import ProductLine from './Components/Pages/Master/ProductLine';
import Material from './Components/Pages/Master/Material';
import Manufacturer from './Components/Pages/Master/Manufacturer';
import { AddProduct } from './Components/Pages/Master/AddProduct';
import { Customerlist } from './Components/Pages/Master/Customerlist';
import Ticketlistcsp from './Components/Pages/Master/Ticketlistcsp';
import Customer from './Components/Pages/Master/Customer';
import Uniqueproduct from './Components/Pages/Master/Uniqueproduct';
import Childfranchisemaster from './Components/Pages/Master/Childfranchisemaster';
import MasterFranchise from './Components/Pages/Master/MasterFranchise';
import Engineer from './Components/Pages/Master/Engineer';
import { Engineerlist } from './Components/Pages/Master/Engineerlist';
import Complaintreporttabs from './Components/Pages/Reports/Complaintreporttabs';
import Complaintreport from './Components/Pages/Reports/Complaintreport';
import Claimreporttabs from './Components/Pages/Reports/Claimreporttabs';
import { Claimreport } from './Components/Pages/Reports/Claimreport';
import { MSP_Login } from './Components/Authenticate/MSP_Login';
import { Franchisemasterlist } from './Components/Pages/Master/Franchisemasterlist';
import Servicecontract from './Components/Pages/Master/Servicecontract';
import Ticketlistmsp from './Components/Pages/Master/Ticketlistmsp';
import Servicecontracttabs from './Components/Pages/Master/Servicecontracttabs';
import { Servicecontractlist } from './Components/Pages/Master/Servicecontractlist';
import { App_Url, Base_Url } from './Components/Utils/Base_Url';
import axios from 'axios';
import DataTable from './Components/Pages/Complaint/Compdatatablebackup';
import HeaderMsp from './Components/Layout/HeaderMsp';
import { Quotationlist } from './Components/Pages/Quotation/Quotationlist';
import QuotationEdit from './Components/Pages/Quotation/QuotationEdit';
import Dash from './Components/Authenticate/Dash';
import Authenticate from './Components/Authenticate/Authenticate';
import Dashbord from './Components/App/Compo/Dashbord';
import History from './Components/App/Compo/History';
import Data_lost from './Components/App/Compo/Data_lost';
import Details from './Components/App/Compo/Details';
import Mobile from './Components/App/Compo/Mobile';
import { Complaintviewmsp } from './Components/Pages/Master/Complaintviewmsp';
import { CspTicketView } from './Components/Pages/Master/CspTicketView';
import NotAuthenticate from './Components/Authenticate/NotAuthenticate';
import AppLogin from './Components/App/Compo/Login';
import Activity from './Components/Pages/Master/Activity';
import { Csplisting } from './Components/Pages/Master/Csplisting';
import Engineeringlist from './Components/Pages/Master/Engineeringlist';
import { Mspdata } from './Components/Pages/Master/Mspdata';
import Engineers from './Components/Trainer/Engineers';
import Nps from './Components/Pages/Nps/Nps';
import { TrainerLogin } from './Components/Trainer/TrainerLogin';
import TrainerHeader from './Components/Trainer/TrainerHeader';
import QueryPage from './Components/Pages/QueryPage';
import Master_Warrenty from './Components/Pages/Master/Master_Warrenty';
import PostSaleWarrenty from './Components/Pages/Master/PostSaleWarrenty';
import Roleright from './Components/Pages/Master/Roleright';
import Roleassign from './Components/Pages/Master/Roleassign';
import { FeedBackreport } from './Components/Pages/Reports/Feedbackreport';
import AddCspUser from './Components/Pages/Master/AddCspUser';
import RoleassignCsp from './Components/Pages/Master/RoleAssignCsp';
import CspRoleright from './Components/Pages/Master/CspRoleRights';
import AddEnquiry from './Components/Pages/Master/AddEnquiry';
import EnquiryTabs from './Components/Pages/Master/EnquiryTabs';
import CreateGrn from './Components/Pages/Master/CreateGrn';
import Grndetailspage from './Components/Pages/Master/Grndetailspage';
import { GrnList } from './Components/Pages/Master/GrnList';
import { Grnoutward } from './Components/Pages/Master/Grnoutward';
import Spareoutward from './Components/Pages/Master/Spareoutward';
import { CspStock } from './Components/Pages/Master/CspStock';
import { CspDashboard } from './Components/Pages/Master/CspDashboard';
import { MspDashboard } from './Components/Pages/Master/MspDashboard';
import Sparedetailpage from './Components/Pages/Master/Sparedetailpage';
import PincodeAllocation from './Components/Pages/Master/PincodeAllocation';
import { Shipment_fg } from './Components/Pages/Master/Shipment_fg';
import { Shipment_parts } from './Components/Pages/Master/Shipment_parts';
import { BussinePartner } from './Components/Pages/Master/BussinePartner';
import MspAddtab from './Components/Pages/Master/MspAddtab';
import AddMspUser from './Components/Pages/Master/AddMspUser';
import { EnquiryForm } from './Components/Pages/Master/EnquiryForm';
import EnquiryListing from './Components/Pages/Master/EnquiryListing';
import { EngineerStock } from './Components/App/Compo/EngineerStock';
import { CspQuotationlist } from './Components/Pages/Master/CspQuotationlist';
import CspQuotationEdit from './Components/Pages/Master/CspQuotationEdit';
import AnnextureReport from './Components/Pages/Reports/Annexturereport';
import JsonToSql from './Components/Utils/JsonToSql';
import ExcelToJson from './Components/Utils/ExcelTojson';
import ExcelforRemarks from './Components/Utils/ExcelforRemarks';
import UploadRemarks from './Components/Utils/UploadRemarks';
import ExceltoCustomer from './Components/Utils/ExceltoCustomer';
import ExceltoAddress from './Components/Utils/ExporttoAddress';
import ExporttoProduct from './Components/Utils/ExporttoProduct';
import UploadCustomer from './Components/Utils/UploadCustomer';
import UploadAddress from './Components/Utils/UploadAddress';
import UploadProducts from './Components/Utils/UploadProducts';
import Subcallstatus from './Components/Pages/Master/Subcallstatus';
import ExceltoScript from './Components/Utils/ExceltoScript';
import ExceltoEngScript from './Components/Utils/ExceltoEngScript';
import Exceltomobile from './Components/Utils/Exceltomobile';
import UploadMobile from './Components/Utils/UploadMobile';
import JsontoExcel from './Components/Utils/JsontoExcel';
import Productsparetabs from './Components/Pages/Master/Productsparetabs';
import { Stock } from './Components/Pages/Master/Stock';
import ExceltoUpdateScript from './Components/Utils/ExceltoupdateScript';




// Mock function to check authentication (Replace it with your actual auth logic)
const isAuthenticated = () => {
  return localStorage.getItem("token"); // Example: Using token stored in localStorage
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/VerifyUser" replace />;
};




const Router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,

  },
  {
    path: "/VerifyUser",
    element: <Authenticate />,

  },
  {
    path: "/dash",
    element: <ProtectedRoute><Dash /></ProtectedRoute>,

  },
  {
    path: "/msp/msplogin",
    element: <MSP_Login />,
  },
  {
    path: "/notauthenticate",
    element: <NotAuthenticate />,
  },
  {
    path: "/nps/:email/:ticketNo/:customerId",
    element: <Nps />,
  },
  {
    path: "/query",
    element: <QueryPage />
  },
  {
    path: "/uploadcomplaint",
    element: <JsonToSql />
  },

  {
    path: "/uploadremarks",
    element: <UploadRemarks />
  },
  {
    path: "/uploadcustomer",
    element: <UploadCustomer />
  },
  {
    path: "/uploadaddress",
    element: <UploadAddress />
  },
  {
    path: "/uploadproducts",
    element: <UploadProducts />
  },
  {
    path: "/exceltoremark",
    element: <ExcelforRemarks />
  },
  {
    path: "/exceltocustomer",
    element: <ExceltoCustomer />
  },
  {
    path: "/exceltoaddress",
    element: <ExceltoAddress />
  },
  {
    path: "/exceltoproduct",
    element: <ExporttoProduct />
  },
  {
    path: "/exceltojson",
    element: <ExcelToJson />
  },
  {
    path: "/jsontoexcel",
    element: <JsontoExcel />
  },
  {
    path: "/exceltoscript",
    element: <ExceltoScript />
  },
  {
    path: "/exceltoupdatescript",
    element: <ExceltoUpdateScript />
  },
  {
    path: "/exceltoengscript",
    element: <ExceltoEngScript />
  },
  {
    path: "/exceltomobile",
    element: <Exceltomobile />
  },
  {
    path: "/uploadmobile",
    element: <UploadMobile />
  },


  {
    path: "/msp",
    element: <MSPAPP />,
    children: [

      {
        path: "/msp/ticketlistmsp",
        element: <ProtectedRoute><Ticketlistmsp /></ProtectedRoute>,
      },
      {
        path: "/msp/csplist",
        element: <ProtectedRoute><Csplisting /></ProtectedRoute>,
      },
      {
        path: "/msp/complaintviewmsp/:complaintid",
        element: <ProtectedRoute><Complaintviewmsp /></ProtectedRoute>,
      },
      {
        path: "/msp/dashboard",
        element: <ProtectedRoute><MspDashboard /></ProtectedRoute>,
      },
      {
        path: "/msp/addusertab",
        element: <ProtectedRoute><MspAddtab /></ProtectedRoute>,
      },
      {
        path: "/msp/addusers",
        element: <ProtectedRoute> <AddMspUser /></ProtectedRoute>,
      },
      {
        path: "/msp/roleassign",
        element: <ProtectedRoute><MspAddtab /></ProtectedRoute>,
      },
      {
        path: "/msp/roleright",
        element: <ProtectedRoute><MspAddtab /></ProtectedRoute>,
      },


    ]
  },
  {
    path: "/csp/csplogin",
    element: <CSP_Login />,

  },
  {
    path: "/trainer/login",
    element: <TrainerLogin />,

  },
  {
    path: "/csp",
    element: <CSPAPP />,
    children: [

      {
        path: "/csp/ticketlist",
        element: <ProtectedRoute> <Ticketlistcsp /></ProtectedRoute>,

      },
      {
        path: "/csp/engineeringlist",
        element: <ProtectedRoute><Engineeringlist /></ProtectedRoute>,

      },
      {
        path: "/csp/ticketview/:complaintid",
        element: <ProtectedRoute><CspTicketView /></ProtectedRoute>,

      },
      {
        path: "/csp/adduser",
        element: <ProtectedRoute><AddCspUser /></ProtectedRoute>,
      },
      {
        path: "/csp/rolerights",
        element: <ProtectedRoute><CspRoleright /></ProtectedRoute>,
      },
      {
        path: "/csp/roleassign",
        element: <ProtectedRoute><RoleassignCsp /></ProtectedRoute>,
      },
      {
        path: "/csp/mspdata",
        element: <ProtectedRoute><Mspdata /></ProtectedRoute>,
      },
      {
        path: "/csp/creategrn",
        element: <ProtectedRoute><CreateGrn /></ProtectedRoute>,
      },
      {
        path: "/csp/grnlisting",
        element: <ProtectedRoute><GrnList /></ProtectedRoute>
      },
      {
        path: "/csp/grnview/:grn_no",
        element: <ProtectedRoute><Grndetailspage /></ProtectedRoute>
      },
      {
        path: "/csp/issueview/:issue_no",
        element: <ProtectedRoute><Sparedetailpage /></ProtectedRoute>
      },
      {
        path: "/csp/spareoutward",
        element: <ProtectedRoute><Spareoutward /></ProtectedRoute>
      },
      {
        path: "/csp/grnoutward",
        element: <ProtectedRoute><Grnoutward /></ProtectedRoute>
      },
      {
        path: "/csp/cspstock",
        element: <ProtectedRoute> <CspStock /></ProtectedRoute>
      },
      {
        path: "/csp/dashboard",
        element: <ProtectedRoute><CspDashboard /></ProtectedRoute>
      },
      {
        path: "/csp/quotationlist",
        element: (
          <ProtectedRoute>
            <CspQuotationlist />
          </ProtectedRoute>
        )
      },
      {
        path: "/csp/quotation/:qid",
        element: <ProtectedRoute><CspQuotationEdit /></ProtectedRoute>
      },

    ],
  },
  {
    path: "/trainer",
    element: <TrainerApp />,
    children: [

      {
        path: "/trainer/engineerlist",
        element: <ProtectedRoute><Engineers /></ProtectedRoute>,

      }
    ],
  },
  {
    path: "/mobapp",
    element: <MobApp />,
    children: [

      {
        path: "/mobapp/dash",
        element: <ProtectedRoute><Dashbord /></ProtectedRoute>,
      },
      {
        path: '/mobapp/details',
        element: <ProtectedRoute><Details /></ProtectedRoute>,
      },
      {
        path: '/mobapp/details/:id',
        element: <ProtectedRoute><Details /></ProtectedRoute>,
      },
      {
        path: '/mobapp/history/:id',
        element: <ProtectedRoute><History /></ProtectedRoute>,
      },
      {
        path: '/mobapp/offline',
        element: <ProtectedRoute><Data_lost /></ProtectedRoute>,
      },
      {
        path: '/mobapp/mobile',
        element: <ProtectedRoute> <Mobile /></ProtectedRoute>,
      },
      {
        path: '/mobapp/stock',
        element: <ProtectedRoute><EngineerStock /></ProtectedRoute>,
      },
      {
        path: '/mobapp/applogin',
        element: <ProtectedRoute><AppLogin /></ProtectedRoute>,
      },
    ],
  },

  {
    path: "/",
    element: <App />,
    children: [

      {
        path: "/area",
        element: <ProtectedRoute><Area /></ProtectedRoute>,

      },
      {
        path: "/callstatus",
        element: <ProtectedRoute> <Callstatus /></ProtectedRoute>,

      },
      {
        path: "/promaster",
        element: <ProtectedRoute><ProMaster /></ProtectedRoute>,

      },
      {
        path: "/category",
        element: <ProtectedRoute><Category /></ProtectedRoute>,

      },
      {
        path: "/locationtabs",
        element: <ProtectedRoute><LocationTabs /></ProtectedRoute>,

      },
      {
        path: "/regions",
        element: <ProtectedRoute><Regions /></ProtectedRoute>,

      },
      {
        path: "/location",
        element: <ProtectedRoute><Location /></ProtectedRoute>,

      },
      {
        path: "/pincode_allocation",
        element: <ProtectedRoute><PincodeAllocation /></ProtectedRoute>,

      },
      {
        path: "/channelpartner",
        element: <ProtectedRoute><Channelpartner /></ProtectedRoute>,

      },
      {
        path: "/channelpartnertabs",
        element: <ProtectedRoute><Channelpartnertabs /></ProtectedRoute>,

      },
      {
        path: "/DefectGroup",
        element: <ProtectedRoute><Complaintcode /></ProtectedRoute>,

      },
      {
        path: "/faultcodetabs",
        element: <ProtectedRoute><Complainttabs /></ProtectedRoute>,

      },
      {
        path: "/TypeOfDefect",
        element: <ProtectedRoute> <ReasonCode /></ProtectedRoute>,


      },
      {
        path: "/SiteDefect",
        element: <ProtectedRoute><ActionCode /></ProtectedRoute>,

      },
      {
        path: "/Activity",
        element: <ProtectedRoute> <Activity /></ProtectedRoute>,

      },
      {
        path: "/complaint-grid",
        element: <ProtectedRoute><Complaintgrid /></ProtectedRoute>,

      },
      {
        path: "/complaintlist",
        element: <ProtectedRoute> <Complaintlist /></ProtectedRoute>,

      },
      {
        path: "/complaint-view",
        element: <ProtectedRoute><Complaintview /></ProtectedRoute>,

      },
      {
        path: "/country",
        element: <ProtectedRoute><Country /></ProtectedRoute>,

      },
      {
        path: "/callstatuscodetabs",
        element: <ProtectedRoute><Callstatuscodetabs /></ProtectedRoute>,

      },
      {
        path: "/customerlocation",
        element: <ProtectedRoute><Customerlocation /></ProtectedRoute>,

      },
      {
        path: "/customerlocation/:customer_id",
        element: <ProtectedRoute><Customerlocation /></ProtectedRoute>
      },
      {
        path: "/customer/:customerid",
        element: <ProtectedRoute><Customer /></ProtectedRoute>
      },
      {
        path: "/uniqueproduct/:customer_id",
        element: <ProtectedRoute><Uniqueproduct /></ProtectedRoute>
      },
      {
        path: "/Customerlist",
        element: <ProtectedRoute> <Customerlist /></ProtectedRoute>

      },
      {
        path: "/Customer",
        element: <ProtectedRoute> <Customer /></ProtectedRoute>,

      },
      {
        path: "/Uniqueproduct",
        element: <Uniqueproduct />,

      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,

      },
      {
        path: "/endcustomer",
        element: <ProtectedRoute><Endcustomertabs /></ProtectedRoute>,

      },
      {
        path: "/geocity",
        element: <ProtectedRoute><Geocity /></ProtectedRoute>,

      },
      {
        path: "/geostate",
        element: <ProtectedRoute><Geostate /></ProtectedRoute>,

      },
      {
        path: "/lhiuser",
        element: <ProtectedRoute><Lhiuser /></ProtectedRoute>,

      },
      {
        path: "/lhiusertabs",
        element: <ProtectedRoute><Lhiusertabs /></ProtectedRoute>,

      },
      {
        path: "/Roleright",
        element: <ProtectedRoute><Roleright /></ProtectedRoute>,

      },
      {
        path: "/Roleassign",
        element: <ProtectedRoute><Roleassign /></ProtectedRoute>,

      },
      {
        path: "/lhiuser",
        element: <ProtectedRoute><Lhiuser /></ProtectedRoute>,

      },
      {
        path: "/linklocation",
        element: <ProtectedRoute><Linklocation /></ProtectedRoute>,

      },
      {
        path: "/pincode",
        element: <ProtectedRoute><Pincode /></ProtectedRoute>,

      }, {
        path: "/products",
        element: <ProtectedRoute><Products /></ProtectedRoute>
      },
      {
        path: "/productspare",
        element: <ProtectedRoute><Productspare /></ProtectedRoute>,

      },
      {
        path: "/ratecard",
        element: <ProtectedRoute><Ratecard /></ProtectedRoute>,

      },
      {
        path: "/ratecardtabs",
        element: <ProtectedRoute> <Ratecardtabs /></ProtectedRoute>,

      },
      {
        path: "/master_warrenty",
        element: <ProtectedRoute><Master_Warrenty /></ProtectedRoute>,

      },
      {
        path: "/post_sale_warrenty",
        element: <ProtectedRoute><PostSaleWarrenty /></ProtectedRoute>,

      },
      {
        path: "/register-complaint",
        element: <ProtectedRoute><Registercomplaint /></ProtectedRoute>,

      },
      {
        path: "/serviceagent",
        element: <ProtectedRoute><Serviceagent /></ProtectedRoute>,

      },
      {
        path: "/serviceagenttabs",
        element: <ProtectedRoute><Serviceagenttabs /></ProtectedRoute>,

      },
      {
        path: "/serviceproduct",
        element: <ProtectedRoute><Serviceproduct /></ProtectedRoute>,

      },
      {
        path: "/serviceproducttabs",
        element: <ProtectedRoute><Serviceproducttabs /></ProtectedRoute>,

      },
      {
        path: "/subcategory",
        element: <ProtectedRoute><Subcategory /></ProtectedRoute>,

      },
      {
        path: "/producttype",
        element: <ProtectedRoute><ProductType /></ProtectedRoute>,

      },
      {
        path: "/franchisemaster",
        element: <ProtectedRoute> <Franchisemaster /></ProtectedRoute>,

      },
      {
        path: "/childFranchiselist",
        element: <ProtectedRoute><ChildFranchiselist /></ProtectedRoute>
      },
      {
        path: "/engineermaster",
        element: <ProtectedRoute><EngineerMaster /></ProtectedRoute>,

      },
      {
        path: "/franchisemasterlist",
        element: <ProtectedRoute><Franchisemasterlist /></ProtectedRoute>
      },
      {
        path: "/MasterFranchise",
        element: <ProtectedRoute><MasterFranchise /></ProtectedRoute>,

      },
      {
        path: "/Masterfranchise/:masterid",
        element: <ProtectedRoute><MasterFranchise /></ProtectedRoute>,
      },
      {
        path: "/Childfranchisemaster",
        element: <ProtectedRoute><Childfranchisemaster /></ProtectedRoute>,

      },
      {
        path: "/Childfranchisemaster/:childid",
        element: <ProtectedRoute><Childfranchisemaster /></ProtectedRoute>,

      },
      {
        path: "/registercomaplaint",
        element: <ProtectedRoute><Registercomplaint /></ProtectedRoute>,

      },
      {
        path: "/registercomaplaint/:Comp_id",
        element: <ProtectedRoute><Registercomplaint /></ProtectedRoute>,

      },
      {
        path: "/complaintview/:complaintid",
        element: <ProtectedRoute> <Complaintview /></ProtectedRoute>,
      },
      {
        path: "/groupmaster",
        element: <ProtectedRoute><Groupmaster /></ProtectedRoute>,

      },
      {
        path: "/productline",
        element: <ProtectedRoute><ProductLine /></ProtectedRoute>,

      },
      {
        path: "/material",
        element: <ProtectedRoute><Material /></ProtectedRoute>,
      },
      {
        path: "/manufacturer",
        element: <ProtectedRoute><Manufacturer /></ProtectedRoute>,
      },
      {
        path: "/addproduct/:productid",
        element: <ProtectedRoute><AddProduct /></ProtectedRoute>,
      },
      {
        path: "/engineermaster/:engineerid",
        element: <ProtectedRoute> <EngineerMaster /></ProtectedRoute>,
      },


      {
        path: "/engineer",
        element: <ProtectedRoute><Engineer /></ProtectedRoute>,
      },
      {
        path: "/engineerlist",
        element: <ProtectedRoute><Engineerlist /></ProtectedRoute>
      },
      {
        path: "/complaintreporttabs",
        element: <ProtectedRoute> <Complaintreporttabs /></ProtectedRoute>
      },
      {
        path: "/complaintreport",
        element: <ProtectedRoute><Complaintreport /></ProtectedRoute>
      },
      {
        path: "/claimreporttabs",
        element: <ProtectedRoute><Claimreporttabs /></ProtectedRoute>
      },
      {
        path: "/servicecontract",
        element: <ProtectedRoute><Servicecontract /></ProtectedRoute>
      },
      {
        path: "/Servicecontract/:serviceid/:view",
        element: <ProtectedRoute> <Servicecontract /></ProtectedRoute>
      },
      {
        path: "/servicecontracttabs",
        element: <ProtectedRoute><Servicecontracttabs /></ProtectedRoute>
      },
      {
        path: "/servicecontractlist",
        element: <ProtectedRoute><Servicecontractlist /></ProtectedRoute>
      },
      {
        path: "claimreport",
        element: <ProtectedRoute> <Claimreport /></ProtectedRoute>
      },
      {
        path: "Feedbackreportlist",
        element: <ProtectedRoute><FeedBackreport /></ProtectedRoute>
      },
      {
        path: "/addenquiry",
        element: <ProtectedRoute><EnquiryForm /></ProtectedRoute>
      },
      {
        path: "enuiry",
        element: <ProtectedRoute><EnquiryTabs /></ProtectedRoute>
      },
      {
        path: "/datatable",
        element: <ProtectedRoute><DataTable /></ProtectedRoute>
      },

      {
        path: "/quotationlist",
        element: (
          <ProtectedRoute>
            <Quotationlist />
          </ProtectedRoute>
        )
      },
      {
        path: "/quotation/:qid",
        element: <ProtectedRoute><QuotationEdit /></ProtectedRoute>
      },
      {
        path: "/enquiryListing",
        element: <ProtectedRoute><EnquiryListing /></ProtectedRoute>
      },
      {
        path: "/enquiryListing/:enquiryid",
        element: <ProtectedRoute><EnquiryForm /></ProtectedRoute>
      },
      {
        path: "/shipment_fg",
        element: <ProtectedRoute><Shipment_fg /></ProtectedRoute>
      },
      {
        path: "shipmentparts",
        element: <ProtectedRoute><Shipment_parts /></ProtectedRoute>
      },
      {
        path: "/business_partner",
        element: <ProtectedRoute><BussinePartner /></ProtectedRoute>
      },
      {
        path: "/annexturelist",
        element: <ProtectedRoute><AnnextureReport /></ProtectedRoute>
      },
      {
        path: "/subcallstatus",
        element: <ProtectedRoute><Subcallstatus /></ProtectedRoute>
      },
      {
        path: "/engineerapprove",
        element: <ProtectedRoute><Engineers /></ProtectedRoute>
      },
      {
        path: "/stock",
        element: <Stock />,
      },
      {
        path: "/productsparetabs",
        element: <Productsparetabs />
      },


    ],
  },
]);

function TrainerApp() {

  const navigate = useNavigate()

  React.useEffect(() => {
    checkLocalStorageAndRedirect(navigate);
  }, [navigate])

  React.useEffect(() => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        window.location.reload()
      }
    });

    window.addEventListener("contextmenu", (event) => event.preventDefault());



  }, [])



  return (
    <>
      <TrainerHeader />
      <Outlet />
      <Sitefooter />
    </>

  );
}

function checkLocalStorageAndRedirect(navigate) {
  const user_id = localStorage.getItem('userId')
  if (user_id == null) {
    window.location.href = App_Url
  }
}

function checkLocalStorageAndRedirectCSP(navigate) {
  const user_id = localStorage.getItem('licare_code')
  if (user_id == null) {
    window.location.href = App_Url
  }
}

function App() {


  const [headerState, setHeaderState] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const fetchProtectedData = async () => {
    const token = localStorage.getItem("token"); // Get token from localStorage

    try {
      const response = await axios.get(`${Base_Url}/protected-route`, {
        headers: {
          Authorization: token, // Send token in headers
        },
      });

    } catch (error) {
      console.error("Error fetching protected route:", error);
      // alert(error.response.data.message || "Access denied");
      // navigate('/login')
      window.location.href = App_Url

    }
  };

  React.useEffect(() => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        window.location.reload()
      }
    });

    window.addEventListener("contextmenu", (event) => event.preventDefault());



  }, [])

  React.useEffect(() => {
    fetchProtectedData()




    const timer = setTimeout(() => {
      alert("Session Timeout")
      window.location.reload();
    }, 3600 * 8000);

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, [navigate])


  React.useEffect(() => {
    setHeaderState(false);
  }, [location]);


  return (
    <>
      <Siteheader headerState={headerState} />
      <Outlet context={{ setHeaderState }} />
      <Sitefooter />
    </>

  );
}

function CSPAPP() {

  const navigate = useNavigate()

  React.useEffect(() => {
    checkLocalStorageAndRedirectCSP(navigate)

  }, [navigate])

  React.useEffect(() => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        window.location.reload()
      }
    });

    window.addEventListener("contextmenu", (event) => event.preventDefault());



  }, [])



  return (
    <>
      <Loginheader />
      <Outlet />
      <Sitefooter />
    </>

  );
}

function MSPAPP() {

  const navigate = useNavigate()

  React.useEffect(() => {
    checkLocalStorageAndRedirect(navigate);
  }, [navigate])



  React.useEffect(() => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        window.location.reload()
      }
    });

    window.addEventListener("contextmenu", (event) => event.preventDefault());



  }, [])



  return (
    <>
      <HeaderMsp />
      <Outlet />
      <Sitefooter />
    </>

  );
}
function MobApp() {



  return (
    <>
      <Outlet />
    </>

  );
}



export default Router;
