// import React from 'react';
import axios from 'axios';
import '../App.css';
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from "react";
import { BASE_URL } from './BaseUrl';
import { Navigate, useNavigate } from 'react-router-dom';
import { Network } from '@capacitor/network';


function AppLogin() {


  const navigate = useNavigate();
  const [datas, setdatas] = useState({})
  const [value, setValue] = useState({
    username: "",
    password: "",
    err: "",
  })



  const [isOnline, setIsOnline] = useState(true); // Default to true, assuming online initially.

  useEffect(() => {
    // Check the initial network status
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };

    // Check initial network status on component mount
    checkNetworkStatus();

    // Set up the network status listener
    const setupNetworkListener = async () => {
      await Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
    };

    // Call setup function
    setupNetworkListener();

    // No cleanup needed here since we avoid directly calling remove
  }, []);

  if (!isOnline) {
    return <Navigate to="/offline" replace />;
  }

  const handleChange = (e) => {
    setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const mobileRegex = /^\d{10}$/;
  const handleBlur = () => {
    let isValid = true
    if (!mobileRegex.test(value.username)) {
      isValid = false
      setValue({
        err: 'Please enter a valid 10-digit mobile number.'
      });
    } else {
      setValue({
        err: ''
      }); // Clear the error message if valid
    }
    return isValid
  };


  const handleSubmit = (e) => {
    e.preventDefault()



    const passwordMd5 = CryptoJS.MD5(value.password).toString();
    const data = {
      username: value.username,
      password: passwordMd5
    }

    axios.post(`${BASE_URL}/login`, data)
      .then((res) => {
        console.log(res)
        setValue({
          err: '',
          username: '',
          password: '',
        })
        console.log(res.data.id)

        localStorage.setItem('userid', res.data.engineer_id)
        localStorage.setItem('Name', res.data.title)
        localStorage.setItem('employee_code', res.data.employee_code)

        navigate('/mobapp/dash')
      })
      .catch((err) => {
        console.log(err)

        if (err) {

          setValue({
            err: 'Invalid username or password',
            // err: err,
            username: '',
            password: '',
          })

          setTimeout(() => {
            setValue({
              err: ''
            })
          }, 2000);
        }

      })

  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="pt-5 p-5 pb-0 mt-5 text-center">
            <img src="https://liebherr.thetalentclub.co.in/engineer/images/Liebherr-logo-768x432.png" alt="Liebherr Logo" className="logo" />
            <h3 className="headh3">Engineer Login</h3>
          </div>

          <form onSubmit={handleSubmit} className="form-container" style={{ maxWidth: '450px', margin: '0 auto' }}>
            <div className="user-form p-5 pt-0 pb-0" >
              <div className="form-group mb-3">


                <input type="text" value={value.username} onChange={handleChange} required style={{ borderRadius: '5px' }} name="username" class="form-control form-control-user" id="exampleInputEmail" placeholder="Enter Engineer Id..." />
              </div>

              <div className="form-group mb-3">



                <input type="password" value={value.password} onChange={handleChange} required style={{ borderRadius: '5px' }} name="password" class="form-control form-control-user"
                  id="exampleInputPassword" placeholder="Password" />
              </div>
              <p className='text-danger'>{value.err}</p>
              <button type="submit" className="btn btn-liebherr btn-user btn-block width100" >Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppLogin;
