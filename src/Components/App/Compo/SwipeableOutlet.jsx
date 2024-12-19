import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Outlet } from 'react-router-dom';

function SwipeableOutlet() {
  const navigate = useNavigate();

  useEffect(() => {
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {

        navigate(-1);
      } else {

        App.exitApp();
      }
    });

    // Cleanup the listener when the component is unmounted
    return () => {
      // backButtonListener.remove();
    };
  }, [navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default SwipeableOutlet;
