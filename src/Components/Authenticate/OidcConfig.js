// oidcConfig.js
export const oidcConfig = {
    authority: "https://loginst.liebherr.com/", // Replace with your OIDC authority URL
    client_id: "c20df6f1-377b-4c6e-a2fb-44352fb8344f",                   // Replace with your client ID
    post_logout_redirect_uri: "http://localhost:3000/",
    response_type: "bTL9X38uSWt8d2VfwyRE1dfewLCUBCsmDAvyXDQzrF8z2",                          // Use "code" for authorization code flow
    scope: "openid profile email",                 // Define your scopes
  };