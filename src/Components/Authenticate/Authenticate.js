import React, { useEffect } from 'react';

const Authenticate = () => {

    const redirect = () => {
       window.location.pathname = '/'
    }

    useEffect(() =>{
        redirect()
    },[])
    
};

export default Authenticate;
