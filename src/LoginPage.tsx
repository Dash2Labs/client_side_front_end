// This page will be shown when the user is not logged in
import React, { useState } from 'react';
import { msalInstance } from './Authorization/MsalInstance.ts';

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      await msalInstance.loginPopup();
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      {!isLoggedIn ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <p>You are logged in!</p>
      )}
    </div>
  );
}