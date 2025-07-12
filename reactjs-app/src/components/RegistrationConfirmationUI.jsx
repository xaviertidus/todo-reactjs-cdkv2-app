import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material'; 

const RegistrationConfirmationUI = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsLoading(true);  
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userData = { Username: username, Pool: new CognitoUserPool(poolData) };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, (err) => {
      setIsLoading(false);  
      if (err) {
        toast.error(err.message || 'Confirmation failed');
      } else {
        toast.success('Confirmation successful!');
        navigate('/login');
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleConfirm} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>Confirm Registration</Typography>
      <TextField
        fullWidth
        label="Confirmation Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        margin="normal"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
      </Button>
    </Box>
  );
};

export default RegistrationConfirmationUI;