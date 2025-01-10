import logo from './logo.svg';
import './siteheader.css'
import './App.css';
import React, { Suspense, useState } from 'react';
import {
  createBrowserRouter,
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
import ProtectedRoute from './Components/Authenticate/ProtectedRoute';
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


const isAuthenticated = () => {
  const token = localStorage.getItem('token');

  alert(token)

  if (!token) {
    return false; // No token found, user is not authenticated

  } else {
    return true
  }

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
    element: <Dash />,

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
    path: "/msp",
    element: <MSPAPP />,
    children: [

      {
        path: "/msp/ticketlistmsp",
        element: <Ticketlistmsp />,
      },
      {
        path: "/msp/csplist",
        element: <Csplisting />,
      },
      {
        path: "/msp/complaintviewmsp/:complaintid",
        element: <Complaintviewmsp />,
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
        element: <Ticketlistcsp />,

      },
      {
        path: "/csp/engineeringlist",
        element: <Engineeringlist />,

      },
      {
        path: "/csp/ticketview/:complaintid",
        element: <CspTicketView />,

      },
      {
        path: "/csp/adduser",
        element: <AddCspUser />,
      },
      {
        path:"/csp/rolerights",
        element: <CspRoleright />,
      },
      {
        path:"/csp/roleassign",
        element: <RoleassignCsp />,
      },
      {
        path: "/csp/mspdata",
        element: <Mspdata />,
      },
    ],
  },
  {
    path: "/trainer",
    element: <TrainerApp />,
    children: [

      {
        path: "/trainer/engineerlist",
        element: <Engineers />,

      }
    ],
  },
  {
    path: "/mobapp",
    element: <MobApp />,
    children: [

      {
        path: "/mobapp/dash",
        element: <Dashbord />,
      },
      {
        path: '/mobapp/details',
        element: <Details />,
      },
      {
        path: '/mobapp/details/:id',
        element: <Details />,
      },
      {
        path: '/mobapp/history/:id',
        element: <History />,
      },
      {
        path: '/mobapp/offline',
        element: <Data_lost />,
      },
      {
        path: '/mobapp/mobile',
        element: <Mobile />,
      },
      {
        path: '/mobapp/applogin',
        element: <AppLogin />,
      },
    ],
  },

  {
    path: "/",
    element: <App />,
    children: [

      {
        path: "/area",
        element: <Area />,

      },
      {
        path: "/callstatus",
        element: <Callstatus />,

      },
      {
        path: "/promaster",
        element: <ProMaster />,

      },
      {
        path: "/category",
        element: <Category />,

      },
      {
        path: "/locationtabs",
        element: <LocationTabs />,

      },
      {
        path: "/regions",
        element: <Regions />,

      },
      {
        path: "/location",
        element: <Location />,

      },
      {
        path: "/channelpartner",
        element: <Channelpartner />,

      },
      {
        path: "/channelpartnertabs",
        element: <Channelpartnertabs />,

      },
      {
        path: "/DefectGroup",
        element: <Complaintcode />,

      },
      {
        path: "/faultcodetabs",
        element: <Complainttabs />,

      },
      {
        path: "/TypeOfDefect",
        element: <ReasonCode />,


      },
      {
        path: "/SiteDefect",
        element: <ActionCode />,

      },
      {
        path: "/Activity",
        element: <Activity />,

      },
      {
        path: "/complaint-grid",
        element: <Complaintgrid />,

      },
      {
        path: "/complaintlist",
        element: <Complaintlist />,

      },
      {
        path: "/complaint-view",
        element: <Complaintview />,

      },
      {
        path: "/country",
        element: <Country />,

      },
      {
        path: "/callstatuscodetabs",
        element: <Callstatuscodetabs />,

      },
      {
        path: "/callstatus",
        element: <Callstatus />,

      },
      {
        path: "/customerlocation",
        element: <Customerlocation />,

      },
      {
        path: "/customerlocation/:customer_id",
        element: <Customerlocation />
      },
      {
        path: "/customer/:customerid",
        element: <Customer />
      },
      {
        path: "/uniqueproduct/:customer_id",
        element: <Uniqueproduct />
      },
      {
        path: "/Customerlist",
        element: <Customerlist />

      },
      {
        path: "/Customer",
        element: <Customer />,

      },
      {
        path: "/Uniqueproduct",
        element: <Uniqueproduct />,

      },
      {
        path: "/dashboard",
        element: <Dashboard />,

      },
      {
        path: "/endcustomer",
        element: <Endcustomertabs />,

      },
      {
        path: "/geocity",
        element: <Geocity />,

      },
      {
        path: "/geostate",
        element: <Geostate />,

      },
      {
        path: "/lhiuser",
        element: <Lhiuser />,

      },
      {
        path: "/lhiusertabs",
        element: <Lhiusertabs />,

      },
      {
        path: "/Roleright",
        element: <Roleright />,

      },
      {
        path: "/Roleassign",
        element: <Roleassign />,

      },
      {
        path: "/lhiuser",
        element: <Lhiuser />,

      },
      {
        path: "/linklocation",
        element: <Linklocation />,

      },
      {
        path: "/pincode",
        element: <Pincode />,

      }, {
        path: "/products",
        element: <Products />
      },
      {
        path: "/productspare",
        element: <Productspare />,

      },
      {
        path: "/ratecard",
        element: <Ratecard />,

      },
      {
        path: "/ratecardtabs",
        element: <Ratecardtabs />,

      },
      {
        path: "/master_warrenty",
        element: <Master_Warrenty />,

      },
      {
        path: "/post_sale_warrenty",
        element: <PostSaleWarrenty />,

      },
      {
        path: "/register-complaint",
        element: <Registercomplaint />,

      },
      {
        path: "/serviceagent",
        element: <Serviceagent />,

      },
      {
        path: "/serviceagenttabs",
        element: <Serviceagenttabs />,

      },
      {
        path: "/serviceproduct",
        element: <Serviceproduct />,

      },
      {
        path: "/serviceproducttabs",
        element: <Serviceproducttabs />,

      },
      {
        path: "/subcategory",
        element: <Subcategory />,

      },
      {
        path: "/producttype",
        element: <ProductType />,

      },
      {
        path: "/franchisemaster",
        element: <Franchisemaster />,

      },
      {
        path: "/childFranchiselist",
        element: <ChildFranchiselist />
      },
      {
        path: "/engineermaster",
        element: <EngineerMaster />,

      },
      {
        path: "/franchisemasterlist",
        element: <Franchisemasterlist />
      },
      {
        path: "/MasterFranchise",
        element: <MasterFranchise />,

      },
      {
        path: "/Masterfranchise/:masterid",
        element: <MasterFranchise />,
      },
      {
        path: "/Childfranchisemaster",
        element: <Childfranchisemaster />,

      },
      {
        path: "/Childfranchisemaster/:childid",
        element: <Childfranchisemaster />,

      },
      {
        path: "/registercomaplaint",
        element: <Registercomplaint />,

      },
      {
        path: "/registercomaplaint/:Comp_id",
        element: <Registercomplaint />,

      },
      {
        path: "/complaintview/:complaintid",
        element: <Complaintview />,
      },
      {
        path: "/groupmaster",
        element: <Groupmaster />,

      },
      {
        path: "/productline",
        element: <ProductLine />,

      },
      {
        path: "/material",
        element: <Material />,
      },
      {
        path: "/manufacturer",
        element: <Manufacturer />,
      },
      {
        path: "/addproduct/:productid",
        element: <AddProduct />,
      },
      {
        path: "/engineermaster/:engineerid",
        element: <EngineerMaster />,
      },


      {
        path: "/engineer",
        element: <Engineer />,
      },
      {
        path: "/engineerlist",
        element: <Engineerlist />
      },
      {
        path: "/complaintreporttabs",
        element: <Complaintreporttabs />
      },
      {
        path: "/complaintreport",
        element: <Complaintreport />
      },
      {
        path: "/claimreporttabs",
        element: <Claimreporttabs />
      },
      {
        path: "/servicecontract",
        element: <Servicecontract />
      },
      {
        path: "/Servicecontract/:serviceid/:view",
        element: <Servicecontract />
      },
      {
        path: "/servicecontracttabs",
        element: <Servicecontracttabs />
      },
      {
        path: "/servicecontractlist",
        element: <Servicecontractlist />
      },
      {
        path: "claimreport",
        element: <Claimreport />
      },
      {
        path: "Feedbackreportlist",
        element: <FeedBackreport />
      },
      {
        path: "addenquiry",
        element: <AddEnquiry />
      },
      {
        path: "enuiry",
        element: <EnquiryTabs />
      },
      {
        path: "/datatable",
        element: <DataTable />
      },
      {
        path: "/quotationlist",
        element: (
          <Suspense fallback={<div>Loading data...</div>}>
            <Quotationlist />
          </Suspense>
        )
      },
      {
        path: "/quotation/:qid",
        element: <QuotationEdit />
      }



    ],
  },
]);

function TrainerApp() {

  const navigate = useNavigate()

  React.useEffect(() => {
    checkLocalStorageAndRedirect(navigate);
  }, [navigate])



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
    navigate('/login'); // Redirect to dashboard if id exists in localStorage
  }
}

function checkLocalStorageAndRedirectCSP(navigate) {
  const user_id = localStorage.getItem('licare_code')
  if (user_id == null) {
    navigate('/csp/csplogin'); // Redirect to dashboard if id exists in localStorage
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
