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
import Customer from './Components/Pages/Master/Customer';
import Uniqueproduct from './Components/Pages/Master/Uniqueproduct';
import Childfranchisemaster from './Components/Pages/Master/Childfranchisemaster';
import MasterFranchise from './Components/Pages/Master/MasterFranchise';
import Engineer from './Components/Pages/Master/Engineer';




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
        path: "/complaintcode",
        element: <Complaintcode />,

      },
      {
        path: "/complainttabs",
        element: <Complainttabs />,

      },
      {
        path: "/reasoncode",
        element: <ReasonCode />,


      },
      {
        path: "/actioncode",
        element: <ActionCode />,

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
        path: "/Customerlist",
        element: <Customerlist />,

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
        path: "/",
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
        path: "/linklocation",
        element: <Linklocation />,

      },
      {
        path: "/pincode",
        element: <Pincode />,

      },{
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
        path: "/engineermaster",
        element: <EngineerMaster />,

      },
      {
        path: "/MasterFranchise",
        element: <MasterFranchise />,

      },
      {
        path: "/Childfranchisemaster",
        element: <Childfranchisemaster />,

      },
      {
        path: "/registercomaplaint",
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
        path: "/engineer",
        element: <Engineer />,
      },


    ],
  },
]);


function App() {
  return (
    <>
      <Siteheader />
      <Outlet />
      <Sitefooter />
    </>

  );
}

export default Router;
