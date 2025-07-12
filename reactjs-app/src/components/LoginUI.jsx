import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { toast } from 'react-toastify';
import { APP_CONFIG } from '../App';
import { TextField, Button, Link, CircularProgress, Box, Typography } from '@mui/material';  

const LoginUI = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);  
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userPool = new CognitoUserPool(poolData);
    const userData = { Username: email, Pool: userPool };
    const cognitoUser = new CognitoUser(userData);
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: () => {
        toast.success('Login successful!');
        setIsLoading(false);  // Stop loading
        navigate('/');
      },
      onFailure: (err) => {
        toast.error(err.message || 'Login failed');
        setIsLoading(false); 
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>  
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}  {/* Added spinner */}
      </Button>
      <Link href="/register" underline="hover" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
        Don't have an account? Register
      </Link>  
    </Box>
  );
};

export default LoginUI;