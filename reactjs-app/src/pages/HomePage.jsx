import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';
import { APP_CONFIG } from '../App';
import HomeUI from '../components/HomeUI';
import NavBarUI from '../components/NavBarUI';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const poolData = {
      UserPoolId: APP_CONFIG.cognito.userpoolId,
      ClientId: APP_CONFIG.cognito.userpoolClientId,
    };
    const userPool = new CognitoUserPool(poolData);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          navigate('/login');
        } else {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (!err) {
              const attrs = attributes.reduce((acc, attr) => ({ ...acc, [attr.Name]: attr.Value }), {});
              setUser(attrs);
            }
          });
        }
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <NavBarUI />
      <HomeUI user={user} />
    </div>
  );
};

export default HomePage;