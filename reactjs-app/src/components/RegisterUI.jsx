import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { TextField, Button, CircularProgress, Box, Typography } from '@mui/material';  // Added MUI components

const RegisterUI = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Added for loading spinner
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);  // Start loading
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userPool = new CognitoUserPool(poolData);

    const attributeList = [
      new CognitoUserAttribute({ Name: 'given_name', Value: givenName }),
      new CognitoUserAttribute({ Name: 'family_name', Value: familyName }),
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      setIsLoading(false);  // Stop loading
      if (err) {
        toast.error(err.message || 'Registration failed');
      } else {
        toast.success('Registration successful! Check email for confirmation code.');
        navigate('/confirm', { state: { username: result.user.username } });
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleRegister} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      <TextField
        fullWidth
        label="Given Name"
        value={givenName}
        onChange={(e) => setGivenName(e.target.value)}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Family Name"
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>
    </Box>
  );
};

export default RegisterUI;