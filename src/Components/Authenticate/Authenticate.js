import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { App_Url, Base_Url, secretKey } from '../Utils/Base_Url';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const Authenticate = () => {

  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token"); // Get token from localStorage
  const navigate = useNavigate()


  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  const Encrypt = (id) => {
    id = id.toString();
    let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
    encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encrypted; // Return the encrypted value
  };


  async function checkuser(params) {



    if (token) {

      const user = parseJwt(token)


      const data = {
        email: user.email
      }

      axios.post(`${Base_Url}/checkuser`, data, {
        headers: {
          Authorization: token, // Send token in headers
        }
      })
        .then((res) => {

          if (res.data.length <= 0) {
            navigate('/notauthenticate');
            return; // Stop further execution
          }


          const role = res.data[0].role

          if (res.data[0].userrole == 'lhi_user') {
            localStorage.setItem('licare_code', res.data[0].usercode)
            localStorage.setItem('Userrole', Encrypt(role))
            setLoading(false)
            window.location.pathname = '/dashboard'
          } else if (res.data[0].userrole == 'awt_franchisemaster') {
            localStorage.setItem('licare_code', res.data[0].usercode)
            localStorage.setItem('Userrole', Encrypt(role))
            setLoading(false)
            window.location.pathname = '/msp/ticketlistmsp'
          } else if (res.data[0].userrole == 'awt_childfranchisemaster') {
            localStorage.setItem('licare_code', res.data[0].usercode)
            localStorage.setItem('Userrole', Encrypt(role))
            setLoading(false)
            window.location.pathname = '/csp/ticketlist'
          } else if (res.data[0].userrole == 'awt_engineermaster') {
            localStorage.setItem('userid', res.data[0].usercode)
            localStorage.setItem('Userrole', Encrypt(role))
            setLoading(false)
            window.location.pathname = '/mobapp/dash'
          } else if (res.data[0].userrole == 'lhi_trainer') {
            localStorage.setItem('licare_code', res.data[0].usercode)
            localStorage.setItem('Userrole', Encrypt(role))
            setLoading(false)
            window.location.pathname = '/trainer/engineerlist'
          }

        })
        .catch((res) => {
          console.log(res)
        })

    } else {

      navigate('/notauthenticate');
    }



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
