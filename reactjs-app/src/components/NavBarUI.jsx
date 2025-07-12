import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { AppBar, Toolbar, Button } from '@mui/material'; 

const NavBarUI = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      toast.success('Logged out');
      navigate('/login');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBarUI;