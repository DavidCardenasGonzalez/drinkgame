import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  TextField,
  Card,
  Avatar,
  CardContent,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Page from '../containers/Page';
import { createCategory, getCategory } from '../services';
// import { useUser } from '../UserContext';

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

function CategoryCreate() {
  const { categoryId } = useParams();
  const [activeStep, setActiveStep] = React.useState(0);
  // const [completed, setCompleted] = React.useState({});
  const classes = useStyles();
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState('active');

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [profileImageURL, setProfileImageURL] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  // eslint-disable-next-line no-unused-vars
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (!name || name.length < 1) {
      setIsValid(false);
      return;
    }
    if (!order) {
      setIsValid(false);
      return;
    }
    if (!status || status.length < 3) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [name, order, status, isPremium]);

  useEffect(() => {
    (async () => {
      if (!categoryId) {
        return;
      }
      const data = await getCategory(categoryId);
      setName(data.name);
      setOrder(data.order);
      setStatus(data.status);
      isPremium(data.isPremium);
    })();
  }, [categoryId]);

  const createCategoryF = async () => {
    setSubmitting(true);
    try {
      await createCategory({
        name,
        order,
        status,
        isPremium,
      });
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
      name: 'Inicio',
      link: '/',
    },
    {
      name: 'Categorías',
      link: '/categories',
    },
  ];

  return (
    <Page title="Crear Categoría" breadcrumbs={getBreadcrumbs()}>
      {isSuccessVisible && (
        <MuiAlert
          onClose={() => setIsSuccessVisible(false)}
          className={classes.alert}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Categoría Creada con Exito
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
          No ha sido posible crear la categoría, intenta más tarde
        </MuiAlert>
      )}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={12} className={classes.container}>
          <Card className={classes.card}>
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
                </Stepper>
              </div>
              {activeStep === 0 ? (
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
                    id="order"
                    className={classes.input}
                    label="Orden"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    required
                    disabled={submitting}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Estado</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={submitting}
                      required
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    id="status"
                    className={classes.input}
                    label="status"
                    type="email"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitting}
                    required
                    fullWidth
                  />
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={isPremium}
                        onChange={setIsPremium}
                        color="primary" // Opcional, puedes personalizar el color del checkbox
                      />
                    )}
                    label="¿Es premium?"
                  />
                </div>
              ) : null}
              {activeStep === 1 ? (
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
            onClick={createCategoryF}
          >
            Crear Categoría
          </Button>
        </Grid>
      </Grid>
    </Page>
  );
}

export default CategoryCreate;
