import logo from './logo.svg';
import './siteheader.css'
import './App.css';
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Login } from './Components/Authenticate/Login';
import { Area } from './Components/Pages/Master/Area';
import { Callstatus } from './Components/Pages/Master/Callstatus';
import { Category } from './Components/Pages/Master/Category';
import { Channelpartner } from './Components/Pages/Master/Channelpartner';
import { Complaintcode } from './Components/Pages/Master/Complaintcode';
import { Complaintgrid } from './Components/Pages/Complaint/Complaintgrid';
import { Complaintlist } from './Components/Pages/Complaint/Complaintlist';
import { Complaintview } from './Components/Pages/Complaint/Complaintview';
import { Country } from './Components/Pages/Master/Country';
import { Customerlocation } from './Components/Pages/Master/Customerlocation';
import { Dashboard } from './Components/Pages/Dashboard';
import { Endcustomer } from './Components/Pages/Master/Endcustomer';
import { Geocity } from './Components/Pages/Master/Geocity';
import { Geostate } from './Components/Pages/Master/Geostate';
import { Lhiuser } from './Components/Pages/Master/Lhiuser';
import { Linklocation } from './Components/Pages/Master/Linklocation';
import { Pincode } from './Components/Pages/Master/Pincode';
import { Product } from './Components/Pages/Master/Product';
import { Productspare } from './Components/Pages/Master/Productspare';
import { Ratecard } from './Components/Pages/Master/Ratecard';
import { Region } from './Components/Pages/Master/Region';
import { Registercomplaint } from './Components/Pages/Complaint/Registercomplaint';
import { Serviceagent } from './Components/Pages/Master/Serviceagent';
import { Serviceproduct } from './Components/Pages/Master/Serviceproduct';
import { Subcategory } from './Components/Pages/Master/Subcategory';
import { Siteheader } from './Components/Layout/Siteheader';
import { Sitefooter } from './Components/Layout/Sitefooter';

const Router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    
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
        path: "/category",
        element: <Category />,
        
      },
      {
        path: "/channelpartner",
        element: <Channelpartner />,
        
      },
      {
        path: "/complaincode",
        element: <Complaintcode />,
        
      },
      {
        path: "/complaint-grid",
        element: <Complaintgrid />,
        
      },
      {
        path: "/complaint-list",
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
        path: "/customerlocation",
        element: <Customerlocation />,
        
      },
      {
        path: "/",
        element: <Dashboard />,
        
      },
      {
        path: "/endcustomer",
        element: <Endcustomer />,
        
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
        path: "/linklocation",
        element: <Linklocation />,
        
      },
      {
        path: "/pincode",
        element: <Pincode />,
        
      },
      {
        path: "/product",
        element: <Product />,
        
      },  {
        path: "/productspare",
        element: <Productspare />,
        
      },
      {
        path: "/ratecard",
        element: <Ratecard />,
        
      },  {
        path: "/region",
        element: <Region />,
        
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
        path: "/serviceproduct",
        element: <Serviceproduct />,
        
      },
      {
        path: "/subcategory",
        element: <Subcategory />,
        
      },
    
      
    ],
  },
]);


function App() {
  return (
   <>
 <Siteheader/>
   <Outlet/>
<Sitefooter/>
   </>

  );
}

export default Router;
