import React from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import { App_Url } from '../Utils/Base_Url';
const NotAuthenticate = () => {
    
    
    return (
        <div class="w3-display-middle p-5" >
            <h1 class="w3-jumbo w3-animate-top w3-center"><code>Access Denied</code></h1>
            <hr class="w3-border-white w3-animate-left" style={{margin:"auto;width:50%"}} />
            <h3 class="w3-center w3-animate-right">You dont have permission to view this site.</h3>
            <h3 class="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
            <h6 class="w3-center w3-animate-zoom">error code:403 forbidden</h6>
            <p style={{color : "blue",cursor :"pointer",fontSize:"15px"}} onClick={() => window.location.href = App_Url}> <FaArrowLeftLong />  Back to Login </p>
        </div>
    )
}

export default NotAuthenticate