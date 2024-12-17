import React from 'react';
import { useAuth } from 'react-oidc-context';

const ProtectedPage = () => {
  const auth = useAuth();

  console.log(auth , "DDD")

  if (!auth.isAuthenticated) {
    return <div>You are not logged in. Please login first.</div>;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Only accessible to authenticated users.</p>
    </div>
  );
};

export default ProtectedPage;
