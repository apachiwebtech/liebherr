import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Base_Url } from '../Utils/Base_Url';

const Authenticate = () => {

  
    const token = localStorage.getItem("token"); // Get token from localStorage
    async function checkuser(params) {

      const data = {
       email : "akash@gmail.com"
      }

      axios.post(`${Base_Url}/checkuser`,data ,  {
        headers: {
            Authorization: token, // Send token in headers
        }
    })
      .then((res) =>{
       console.log(res)
       window.location.pathname = '/quotationlist'
      })
      .catch((res) =>{
        console.log(res)
      })
    }

    useEffect(() => {
      checkuser()
    }, []);

    return null; // The component does not render anything
};

export default Authenticate;
