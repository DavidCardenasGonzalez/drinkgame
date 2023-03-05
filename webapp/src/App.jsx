/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Amplify, Hub, Auth } from 'aws-amplify';
import './App.css';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Routes from './Routes';
import SignInSide from './LoginConfig';

Amplify.configure(window.appConfig);

const helmetContext = {};

function App() {
  const [authState, setAuthState] = React.useState();
  const [authUser, setAuthUser] = React.useState();

  const setUserPayload = (payload) => {
    setAuthState(payload.event);
    setAuthUser(payload.data);
  };

  useEffect(() => {
    (async () => {
      const user = await Auth.currentAuthenticatedUser();
      if (user) {
        setAuthState('signIn');
        setAuthUser(user);
      }
    })();
    Hub.listen('auth', ({ payload }) => {
      setUserPayload(payload);
    });
  }, []);

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet
        titleTemplate="%s | OlafCardiMarco"
        defaultTitle="Sistema adminstración de Usuarios"
      />
      {authState === 'signIn' && authUser ? (
        <Routes />
      ) : (
        <SignInSide setAuthState={setAuthState} setAuthUser={setAuthUser} />
      )}
    </HelmetProvider>
  );
}

export default App;
