import React from 'react';
import AuthProvider from './AuthProvider';
import ProtectedPage from './ProtectedPage'
import USerLogin from './USerLogin';


const Dash = () => {
  return (
    <AuthProvider>
      <USerLogin />
      <ProtectedPage />
    </AuthProvider>
  );
};

export default Dash;
