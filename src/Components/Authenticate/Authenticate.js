import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url } from '../Utils/Base_Url';

const Authenticate = () => {

  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token"); // Get token from localStorage
  async function checkuser(params) {

    const data = {
      email: "akash@gmail.com"
    }

    axios.post(`${Base_Url}/checkuser`, data, {
      headers: {
        Authorization: token, // Send token in headers
      }
    })
      .then((res) => {
        if (res.data) {
          setInterval(() => {
            setLoading(false)
            window.location.pathname = '/quotationlist'
          }, 2000);

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
