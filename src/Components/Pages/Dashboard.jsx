import axios from "axios";
import React, { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import {Base_Url} from '../Utils/Base_Url'

export function Dashboard(params) {
  const token = localStorage.getItem("token");

     const [value, setValue] = useState({
        cancelled: 0,
        closed: 0,
        totalTickets: 0,
        open: 0,
      });
    
    const Navigate = useNavigate()
    const handleSubmit= ()=> {
        Navigate('/')
    }

    async function getdata() {
        
    
        axios.get(`${Base_Url}/getheaddata_web`,{
          headers: {
              Authorization: token, // Send token in headers
              },
          })
          .then((res) => {
            if (res.data !== 0) {
              setValue({
                cancelled: res.data.cancelled,
                closed: res.data.closed,
                totalTickets: res.data.totalTickets,
                open: res.data.open,
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });

          
      }

      useEffect(() => {
        getdata();
    
      }, []);

    return(
    
         

            

        <div id="compTag" className="rounded row m-3" >
          <div className="col-3">
            <div className="colorTotal" style={{}}>
              <div className="dcount">{value.totalTickets}</div>
              <h5>Total Calls</h5>
            </div>
          </div>
          <div className="col-3">
            <div className="colorPending">
              <div className="dcount">{value.open}</div>
              <h5>Open</h5>
            </div>
          </div>
          <div className="col-3">
            <div className="colorCompleted">
              <div className="dcount">{value.cancelled}</div>
              <h5>Cancelled</h5>
            </div>
          </div>
          <div className="col-3">
            <div className="colorCompleted">
              <div className="dcount">{value.closed}</div>
              <h5>Closed</h5>
            </div>
          </div>
        </div>
        

    )
}