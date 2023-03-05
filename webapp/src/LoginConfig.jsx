/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Auth } from 'aws-amplify';

export default function SignInSide(props) {
  const [currentUser, setCurrentUser] = useState();
  const [needPasswordChange, setNeedPasswordChange] = useState(false);
  const [userNameForm, setUserNameForm] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  // change password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isValidChangePassword, setIsValidChangePassword] = useState(false);

  const getButtonIcon = () => {
    if (submitting) {
      return <CircularProgress size={22} />;
    }
    return null;
  };

  useEffect(() => {
    if (!newPassword || newPassword.length < 1) {
      setIsValidChangePassword(false);
      return;
    }
    if (!confirmPassword || confirmPassword.lastname < 1) {
      setIsValidChangePassword(false);
      return;
    }

    if (confirmPassword !== newPassword) {
      setIsValidChangePassword(false);
      return;
    }
    setIsValidChangePassword(true);
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (!userNameForm || userNameForm.length < 1) {
      setIsValid(false);
      return;
    }
    if (!password || password.lastname < 1) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [userNameForm, password]);

  const signIn = async () => {
    try {
      setSubmitting(true);
      const user = await Auth.signIn(userNameForm, password);
      setSubmitting(false);
      // setAuthState(user.attributes);
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setCurrentUser(user);
        setNeedPasswordChange(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error signing in', error);
    }
  };

  const changePassword = async () => {
    try {
      setSubmitting(true);
      const user = await Auth.completeNewPassword(currentUser, newPassword);
      setSubmitting(false);
      console.log(user);
      // // setAuthState(user.attributes);
      // if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      //   setCurrentUser(user);
      //   setNeedPasswordChange(true);
      // }
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   const data = new FormData(event.currentTarget);
  //   console.log({
  //     email: data.get('email'),
  //     password: data.get('password'),
  //   });
  //   signIn(data.get('email'), data.get('password'));
  // };

  return (
    // <ThemeProvider theme={theme}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(images/background.jpeg)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {!needPasswordChange ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Correo Electrónico"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={userNameForm}
                  onChange={(e) => setUserNameForm(e.target.value)}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Agregar nueva contraseña"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={!isValid || submitting}
                  onClick={signIn}
                  startIcon={getButtonIcon()}
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Iniciar Sesión
                </Button>
              </>
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Agregar nueva contraseña"
                  type="password"
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Confirmar contraseña"
                  type="password"
                  id="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={!isValidChangePassword || submitting}
                  onClick={changePassword}
                  startIcon={getButtonIcon()}
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Cambiar Contraseña
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
