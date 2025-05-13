import axios from "axios";
import { Base_Url ,secretKey } from "../Utils/Base_Url";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import md5 from "js-md5";
import logo from '../../images/Liebherr-logo-768x432.png'
import back from '../../images/login.jpeg'
import { useAxiosLoader } from "../Layout/UseAxiosLoader";
import { SyncLoader } from 'react-spinners';
import CryptoJS from 'crypto-js';


export function Login() {


  const [Lhiuser, setLhiuser] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loaders, axiosInstance } = useAxiosLoader();
  const location = useLocation();
  // Login submit handler
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const hashpass = md5(password)

      const response = await axiosInstance.post(`${Base_Url}/loginuser`, {
        Lhiuser: Lhiuser,
        password: hashpass,
      });


      const Encrypt = (id) => {
        id = id.toString();
        let encrypted = CryptoJS.AES.encrypt(id, secretKey).toString();
        encrypted = encrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return encrypted; // Return the encrypted value
      };

      
      if (response.data) {
        
        const Userrole = response.data.user.Role

        
        
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("lhiuser", response.data.user.Lhiuser);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("Userrole", Encrypt(Userrole));
        
        // Navigate to the home page

        // Start the timer to refresh the page
        setTimeout(() => {
          alert("Session Timeout")
          window.location.reload();
        }, 3600 * 8000);
        const redirectTo = location.state?.from || '/dashboard';
        navigate(redirectTo, { replace: true });
      } else {
        alert("Invalid username or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed, please check your credentials.");
    }
  };

  return (
    <div className="container-fluid">
      {loaders && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SyncLoader loading={loaders} color="#FFFFFF" />
        </div>
      )}
      <div className="row">
        <div className="col-md-4">
          <div className="pt-5 p-5 pb-0 mt-5">
            <h1 className="h4 text-gray-900 mb-4">
              <img src={logo} style={{ width: '130px', height: '50px' }} alt="Logo" />
            </h1>
          </div>

          <div className="pt-0 pl-5 pr-5" style={{ maxWidth: "450px" }}>
            <form onSubmit={handleSubmit} className="user p-5 pt-0 pb-0" method="POST">
              <div className="form-group mb-3">
                <input
                  type="tel"
                  style={{ borderRadius: '5px' }}
                  name="Lhiuser"
                  className="form-control form-control-user"
                  placeholder="Enter Username..."
                  value={Lhiuser}
                  onChange={(e) => setLhiuser(e.target.value)}
                />
              </div>
              <div className="form-group mb-3">
                <input
                  type="password"
                  style={{ borderRadius: '5px' }}
                  name="password"
                  className="form-control form-control-user"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="btn btn-liebherr btn-user btn-block width100"
                type="submit"
                name="login"
                id="login"
              >
                Login
              </button>
            </form>
          </div>
        </div>
        <div className="col-md-8" style={{
          height: "100vh",
          backgroundImage: `url(${back})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}>
          &nbsp;
        </div>
      </div>
    </div>
  );
}
