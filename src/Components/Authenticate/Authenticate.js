import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { App_Url, Base_Url } from '../Utils/Base_Url';

const Authenticate = () => {

  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token"); // Get token from localStorage



  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }


  async function checkuser(params) {

   const user =  parseJwt(token)

 
    const data = {
      email: user.email
    }

    axios.post(`${Base_Url}/checkuser`, data, {
      headers: {
        Authorization: token, // Send token in headers
      }
    })
      .then((res) => {

        if(!token){
           window.location.href = App_Url
        }

        if (res.data[0].userrole == 'lhi_user') {
          setLoading(false)

          window.location.pathname = '/dashboard'

        } else if (res.data[0].userrole == 'awt_franchisemaster') {
          setLoading(false)
          window.location.pathname = '/msp/ticketlistmsp'
        } else if (res.data[0].userrole == 'awt_childfranchisemaster') {
          setLoading(false)
          window.location.pathname = '/csp/ticketlist'
        } else if (res.data[0].userrole == 'awt_engineermaster') {
          setLoading(false)
          window.location.pathname = '/mobapp/dash'
        }
      })
      .catch((res) => {
        console.log(res)
      })
  }

  useEffect(() => {
    checkuser()
  }, []);

  return (
    <div>
      {loading ? <h2>Redirecting ....</h2> : null}
    </div>
  )
};

export default Authenticate;
