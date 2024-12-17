// authService.js
import { UserManager } from "oidc-client-ts";
import { oidcConfig } from "./OidcConfig";
import React, { useEffect, useState } from "react";

const userManager = new UserManager(oidcConfig);

export const login = () => userManager.signinRedirect();
export const logout = () => userManager.signoutRedirect();
export const getUser = () => userManager.getUser();
export const handleCallback = () => userManager.signinRedirectCallback();

const USerLogin = () => {
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      // Handle callback after login
      if (window.location.pathname === "/callback") {
        handleCallback().then(() => {
          window.location = "/";
        });
      } else {
        // Check if user is logged in
        getUser().then((user) => {
          if (user) {
            setUser(user.profile);
          }
        });
      }
    }, []);
  
    return (
      <div>
        <h1>React OpenID Connect</h1>
        {user ? (
          <div>
            <p>Welcome, {user.name}</p>
            <p>Email: {user.email}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
    );
  };
  
  export default USerLogin;
