import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Network } from '@capacitor/network';

function Data_lost() {
  const [isOnline, setIsOnline] = useState(false); // Start with false to avoid immediate redirect
  const [statusChecked, setStatusChecked] = useState(false); // Flag to check if initial status has been fetched

  useEffect(() => {
    // Check the initial network status
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setStatusChecked(true); // Set flag after initial check
    };

    checkNetworkStatus();

    // Set up the network status listener
    const setupNetworkListener = async () => {
      await Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
    };

    setupNetworkListener();

    // No cleanup needed here since we avoid directly calling remove
  }, []);

  // Only redirect after the initial status has been checked
  if (statusChecked && isOnline) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="offline-container">
      <h1>No Internet Connection</h1>
      <p>Please check your internet connection and try again.</p>
      <button
        onClick={() =>
          Network.getStatus().then((status) => setIsOnline(status.connected))
        }
        className="btn btn-warning"
      >
        Reload
      </button>
    </div>
  );
}

export default Data_lost;
