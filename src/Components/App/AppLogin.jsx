import './App.css';
import { useEffect, useState } from 'react';
import { BASE_URL } from './Compo/BaseUrl.js';
import axios from 'axios';
function AppLogin() {
  const [checkstatus, setCheckstatus] = useState([]);
  const user_id = localStorage.getItem('userid');
  console.log(user_id);

useEffect(() => {

}, [])



  if (user_id != null) {
    axios.get(`${BASE_URL}/checkstatus_app/${user_id}`)
    .then((res) => {
      if (res.data != 0) {
        console.log(res.data);

      }
    })
    .catch((err) => {
      console.log(err)
    })
  }



  return (
    <>
      <div className="">
        {/* <Outlet /> */}
        {/* <SwipeableOutlt/> */}
      </div>
    </>
  );
}




export default AppLogin;
