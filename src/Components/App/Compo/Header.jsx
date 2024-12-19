import React, { useEffect, useState } from 'react';
import img from './image.png';
import { Navigate, useNavigate } from 'react-router-dom';
import { Network } from '@capacitor/network';
function Header() {
  const navigate = useNavigate();


const logout = () =>{
  localStorage.removeItem('userid')
  navigate('/')
}

const [isOnline, setIsOnline] = useState(true); // Default to true, assuming online initially.

// useEffect(() => {
//   // Check the initial network status
//   if (localStorage.getItem('userid')==null) {
//     navigate('/')
//   }
//   const checkNetworkStatus = async () => {
//     const status = await Network.getStatus();
//     setIsOnline(status.connected);
//   };

//   // Check initial network status on component mount
//   checkNetworkStatus();

//   // Set up the network status listener
//   const setupNetworkListener = async () => {
//     await Network.addListener('networkStatusChange', (status) => {
//       setIsOnline(status.connected);
//     });
//   };

//   // Call setup function
//   setupNetworkListener();

//   // No cleanup needed here since we avoid directly calling remove
// }, []);

// if (!isOnline) {
//   return <Navigate to="/offline" replace />;
// }

useEffect(() => {
  const checkDevice = () => {
    const check = window.matchMedia('(max-width: 768px)').matches ? 'Mobile' : 'Desktop';
    if (check == 'Desktop') {
      navigate('/mobapp/mobile')
    }
  };

  checkDevice(); // Initial check
  window.addEventListener('resize', checkDevice); // Add resize listener

  return () => {
    window.removeEventListener('resize', checkDevice); // Cleanup
  };
}, []);



  return (
    <>
      <nav
  className="navbar navbar-expand-md  navbar-dark fixed-top"
  style={{ backgroundColor: '#2779C4', padding: '8px 0px' }}
>
  <div className="container-fluid ">
    <a className="navbar-brand" style={{overflow:'hidden',height : '44px' ,width : '78%'}} href="#">
      <img src={img} alt="Liebherr Logo" style={{ maxWidth: '200px' , position :'absolute' , top : '-6%' }} />
    </a>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarCollapse"
      aria-controls="navbarCollapse"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse " id="navbarCollapse">
      <ul className="navbar-nav me-auto mb-2 mb-md-0">

        <li className="nav-item">
          <a className="nav-link text-light active" href={`/mobapp/dash`}>Home</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-light" type="button" onClick={logout} tabIndex="-1">Logout</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

    </>
  );
}

export default Header;
