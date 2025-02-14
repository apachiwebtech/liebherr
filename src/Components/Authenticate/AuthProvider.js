import React from 'react';
import { AuthProvider as OidcProvider, useAuth } from 'react-oidc-context';

const AuthProvider = ({ children }) => {


  const oidcConfig = {
    authority: '', // Replace with your authority URL
    client_id: '',                  // Replace with your client ID
    client_secret: '',             // Replace with your secret key
    redirect_uri: window.location.origin + '/callback', // Redirect URL after login
    post_logout_redirect_uri: window.location.origin,
    response_type: 'code',
    scope: 'openid profile email',               // Adjust the scopes as needed
  };

  return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
};

export default AuthProvider;

