import React, { useEffect } from 'react';

const Authenticate = () => {
    useEffect(() => {
        const hasReloaded = sessionStorage.getItem('hasReloaded');

        if (!hasReloaded) {
            sessionStorage.setItem('hasReloaded', 'true');
            window.location.reload(); // Reload the page once
        } else {
           
            window.location.pathname = '/'; // Redirect after reload
        }
    }, []);

    return null; // The component does not render anything
};

export default Authenticate;
