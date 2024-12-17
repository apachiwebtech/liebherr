import React from 'react';
import { AuthProvider as OidcProvider, useAuth } from 'react-oidc-context';

const AuthProvider = ({ children }) => {


  const oidcConfig = {
    authority: 'https://loginst.liebherr.com', // Replace with your authority URL
    client_id: 'c20df6f1-377b-4c6e-a2fb-44352fb8344f',                  // Replace with your client ID
    client_secret: 'bTL9X38uSWt8d2VfwyRE1dfewLCUBCsmDAvyXDQzrF8z2',             // Replace with your secret key
    redirect_uri: window.location.origin + '/callback', // Redirect URL after login
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',               // Adjust the scopes as needed
  };

  return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
};

export default AuthProvider;

