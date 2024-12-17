import React, { useEffect, useState } from 'react';

const Authenticate = () => {
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
      // Get the current reload count from localStorage or initialize to 0
      const count = parseInt(localStorage.getItem("reloadCount") || "0", 10);
  
      if (count < 1) {
        // If this is the first visit, reload the page and increment the counter
        localStorage.setItem("reloadCount", count + 1);
        window.location.reload();
      } else {
        // Update the counter in state
        setReloadCount(count);
        window.location.pathname = '/'
      }
      
    }, []);

    return null; // The component does not render anything
};

export default Authenticate;
