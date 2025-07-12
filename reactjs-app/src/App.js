import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';  // Added for MUI theme and baseline styling
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationConfirmationPage from './pages/RegistrationConfirmationPage';
import HomePage from './pages/HomePage';
import './App.css';

import config from './config.json';
const { coreInfrastructure, hostingInfrastructure } = config.environmentConfig || {};
const cognitoConfiguration = coreInfrastructure?.cognitoConfiguration || {};
const { websiteDomain = 'localhost', apiDomain = 'localhost' } = hostingInfrastructure || {};

export const APP_CONFIG = {
  cognito: cognitoConfiguration,
  apiUrl: `https://${apiDomain}`,
  websiteDomain,
};

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />  
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm" element={<RegistrationConfirmationPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;