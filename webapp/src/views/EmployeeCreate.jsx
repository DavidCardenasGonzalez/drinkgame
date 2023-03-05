/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, TextField, Card, Avatar, CardContent, Button } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Page from '../containers/Page';
import { createEmployeee, getEmployees, createContract } from '../services';
import { useUser } from '../UserContext';

const useStyles = makeStyles((theme) => ({
  input: {
    marginBottom: theme.spacing(3),
  },
  card: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
  },
  container: {
    display: 'flex',
  },
  actionItemsContainer: {
    textAlign: 'right',
    margin: '10px 0',
  },
  alert: {
    marginBottom: theme.spacing(3),
  },
  profilePicPreview: {
    width: '120px',
    height: '120px',
    marginBottom: theme.spacing(4),
  },
  button: {
    marginRight: theme.spacing(1),
  },
  stepperContainer: {
    margin: 15,
  },
}));

function EmployeeCreate() {
  const { employeeId } = useParams();
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState({});
  const classes = useStyles();
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  // const [curp, setCurp] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const { updateAllUserProfiles } = useUser();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [profileImageURL, setProfileImageURL] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [updating, setUpdating] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidPassword, setisValidPassword] = useState(false);

  useEffect(() => {
    if (!name || name.length < 1) {
      setIsValid(false);
      return;
    }
    if (!lastname || lastname.lastname < 1) {
      setIsValid(false);
      return;
    }
    if (!email || email.length < 3) {
      setIsValid(false);
      return;
    }
    if (!telephone || telephone.length < 3) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [name, email, lastname, telephone]);

  useEffect(() => {
    if (!password || password.lastname < 5) {
      setisValidPassword(false);
      return;
    }
    if (!confirmPassword || confirmPassword.length < 5) {
      setisValidPassword(false);
      return;
    }
    if (password != confirmPassword) {
      setisValidPassword(false);
      return;
    }
    setisValidPassword(true);
  }, [password, confirmPassword]);

  useEffect(() => {
    (async () => {
      const data = await getEmployees(employeeId);
      console.log(data);
      setName(data.name);
      setLastname(data.lastname);
      setEmail(data.email);
      setTelephone(data.telephone);
    })();
  }, [employeeId]);

  const createEmployee = async () => {
    setSubmitting(true);
    try {
      await createEmployeee({ name, email, lastname, telephone, password });
    } catch (err) {
      setSubmitting(false);
      setIsSuccessVisible(false);
      setIsErrorVisible(true);
      return;
    }
    setSubmitting(false);
    setIsSuccessVisible(true);
    setIsErrorVisible(false);
  };

  const createContractF = async () => {
    setSubmitting(true);
    try {
      const file = await createContract(employeeId);
      const data = Uint8Array.from(file.data);
      const content = new Blob([data.buffer], { type: file.contentType });

      const encodedUri = window.URL.createObjectURL(content);
      const link = document.createElement('a');

      link.setAttribute('href', encodedUri);
      link.setAttribute('download', "contrato.docx");
      link.click();
      
    } catch (err) {
      console.log(err);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleImageChange = (event) => {
    const newImage = event.target?.files?.[0];
    setProfileImageFile(newImage);
    setProfileImageURL(URL.createObjectURL(newImage));
  };

  const removeFile = () => {
    setProfileImageFile(null);
    setProfileImageURL(null);
    setFileKey(Date.now());
  };

  // Determine what icon is used with the upload button
  const getButtonIcon = () => {
    if (submitting) {
      return <CircularProgress size={22} />;
    }
    return <PermIdentityIcon />;
  };

  // Breadcrumb values for the header
  const getBreadcrumbs = () => [
    {
      name: 'All Documents',
      link: '/',
    },
    {
      name: 'Empleados',
      link: '/employees',
    },
  ];

  return (
    <Page title="Crear Empleado" breadcrumbs={getBreadcrumbs()}>
      {isSuccessVisible && (
        <MuiAlert
          onClose={() => setIsSuccessVisible(false)}
          className={classes.alert}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Empleado Creado con Exito
        </MuiAlert>
      )}
      {isErrorVisible && (
        <MuiAlert
          onClose={() => setIsErrorVisible(false)}
          className={classes.alert}
          severity="error"
          elevation={6}
          variant="filled"
        >
          No ha sido posible crear al empleado, intenta más tarde
        </MuiAlert>
      )}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={12} className={classes.container}>
          <Card className={classes.card}>
            {/* <CardHeader title="User Details" subheader="Enter the details for the new user" /> */}
            <CardContent>
              <div className={classes.stepperContainer}>
                <Stepper nonLinear activeStep={activeStep}>
                  <Step completed={isValid}>
                    <StepButton color="inherit" onClick={handleStep(0)}>
                      Información General
                    </StepButton>
                  </Step>
                  <Step completed={isValid && profileImageURL}>
                    <StepButton color="inherit" onClick={handleStep(1)} disabled={!isValid}>
                      Tomar Foto
                    </StepButton>
                  </Step>
                  <Step completed={isValid && profileImageURL && isValidPassword}>
                    <StepButton
                      color="inherit"
                      onClick={handleStep(2)}
                      disabled={!isValid && profileImageURL}
                    >
                      Crear Contraseña
                    </StepButton>
                  </Step>
                </Stepper>
                {/* const steps = ['Información General', 'Tomar Foto', 'Crear Firma', 'Aceptar']; */}
              </div>
              {activeStep == 0 ? (
                <div>
                  <TextField
                    id="name"
                    className={classes.input}
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                    fullWidth
                  />
                  <TextField
                    id="lastname"
                    className={classes.input}
                    label="Apellidos"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    disabled={submitting}
                    fullWidth
                  />
                  <TextField
                    id="email"
                    className={classes.input}
                    label="Correo Electronicó"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    required
                    fullWidth
                  />
                  <TextField
                    id="telephone"
                    className={classes.input}
                    label="Teléfono"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    disabled={submitting}
                    required
                    fullWidth
                  />
                </div>
              ) : null}
              {activeStep == 1 ? (
                <div>
                  <Avatar src={profileImageURL} className={classes.profilePicPreview} />
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    key={fileKey}
                    onChange={handleImageChange}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    {!profileImageURL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Add Picture
                      </Button>
                    )}
                    {profileImageURL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Edit Picture
                      </Button>
                    )}
                  </label>
                  {profileImageURL && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="span"
                      onClick={removeFile}
                      disabled={updating}
                      className={classes.button}
                    >
                      Remove Picture
                    </Button>
                  )}
                </div>
              ) : null}
              {activeStep == 2 ? (
                <div>
                  <TextField
                    id="password"
                    type="password"
                    className={classes.input}
                    label="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                    fullWidth
                  />
                  <TextField
                    id="lastname"
                    type="password"
                    className={classes.input}
                    label="Apellidos"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={submitting}
                    fullWidth
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item className={classes.actionItemsContainer} xs>
          <Button
            variant="outlined"
            color="primary"
            disabled={!isValid}
            startIcon={getButtonIcon()}
            onClick={createEmployee}
          >
            Crear Empleado
          </Button>
          <Button
            variant="outlined"
            color="primary"
            disabled={!isValid}
            startIcon={getButtonIcon()}
            onClick={createContractF}
          >
            Crear Contrato
          </Button>
        </Grid>
      </Grid>
    </Page>
  );
}

export default EmployeeCreate;
