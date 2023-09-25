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
import { createCategory, getCategory, updateCategoryProfile } from '../services';
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
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState('active');
  const [originalCategory, setOrignalCategory] = useState({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [avatarImageURL, setAvatarImageURL] = useState(null);
  const [avatarImageFile, setAvatarImageFile] = useState(null);

  const [backgroudImageURL, setBackgroudImageURL] = useState(null);
  const [backgroudImageFile, setBackgroudImageFile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [fileKey, setFileKey] = useState(Date.now());
  // eslint-disable-next-line no-unused-vars
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (!name || name.length < 1) {
      setIsValid(false);
      return;
    }
    if (!description || description.length < 1) {
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
  }, [name, description, order, status, isPremium]);

  useEffect(() => {
    (async () => {
      if (!categoryId) {
        return;
      }
      const data = await getCategory(categoryId);
      setOrignalCategory(data);
      setName(data.name);
      setDescription(data.description);
      setOrder(data.order);
      setStatus(data.status);
      setIsPremium(data.isPremium);
      if (data.avatarURL) {
        setAvatarImageURL(data.avatarURL);
      }
      if (data.backgroundURL) {
        setBackgroudImageURL(data.backgroundURL);
      }
    })();
  }, [categoryId]);

  const createCategoryF = async () => {
    setSubmitting(true);
    try {
      await createCategory({
        ...originalCategory,
        name,
        description,
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

  const handleAvatarChange = (event) => {
    const newImage = event.target?.files?.[0];
    setAvatarImageFile(newImage);
    setAvatarImageURL(URL.createObjectURL(newImage));
  };

  const removeAvatarFile = () => {
    setAvatarImageFile(null);
    setAvatarImageURL(null);
    setFileKey(Date.now());
  };

  const updateAvatarPictures = async () => {
    setUpdating(true);
    let shouldDeletePicture = false;
    let file;
    if (originalCategory.avatarURL && !avatarImageURL) {
      // Photo needs to be deleted
      shouldDeletePicture = true;
    } else if (originalCategory.avatarURL !== avatarImageURL) {
      // Photo needs to be updated
      file = avatarImageFile;
    }
    await updateCategoryProfile(
      originalCategory.PK,
      originalCategory.status,
      shouldDeletePicture,
      file,
      'avatar',
    );
    setUpdating(false);
  };

  const handleBackgroudChange = (event) => {
    const newImage = event.target?.files?.[0];
    setBackgroudImageFile(newImage);
    setBackgroudImageURL(URL.createObjectURL(newImage));
  };

  const removeBackgroudFile = () => {
    setBackgroudImageFile(null);
    setBackgroudImageURL(null);
    setFileKey(Date.now());
  };

  const updateBackgroudPictures = async () => {
    setUpdating(true);
    let shouldDeletePicture = false;
    let file;
    if (originalCategory.backgroudURL && !backgroudImageURL) {
      // Photo needs to be deleted
      shouldDeletePicture = true;
    } else if (originalCategory.backgroudURL !== backgroudImageURL) {
      // Photo needs to be updated
      file = backgroudImageFile;
    }
    await updateCategoryProfile(
      originalCategory.PK,
      originalCategory.status,
      shouldDeletePicture,
      file,
      'backgroud',
    );
    setUpdating(false);
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
    {
      name: 'Formulario',
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
                  <Step completed={isValid && avatarImageURL}>
                    <StepButton color="inherit" onClick={handleStep(1)} disabled={!isValid}>
                      Foto Avatar
                    </StepButton>
                  </Step>
                  <Step completed={isValid && backgroudImageURL}>
                    <StepButton color="inherit" onClick={handleStep(2)} disabled={!isValid}>
                      Foto Fondo
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
                    id="description"
                    className={classes.input}
                    label="DEscripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                        disabled={submitting}
                        onChange={() => setIsPremium(!isPremium)}
                        color="primary" // Opcional, puedes personalizar el color del checkbox
                      />
                    )}
                    label="¿Es premium?"
                  />
                </div>
              ) : null}
              {activeStep === 1 ? (
                <div>
                  <Avatar src={avatarImageURL} className={classes.profilePicPreview} />
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    key={fileKey}
                    onChange={handleAvatarChange}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    {!avatarImageURL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Add Picture
                      </Button>
                    )}
                    {avatarImageURL && (
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
                  {avatarImageURL && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="span"
                      onClick={removeAvatarFile}
                      disabled={updating}
                      className={classes.button}
                    >
                      Remove Picture
                    </Button>
                  )}
                  <br />
                  <Button
                    variant="outlined"
                    component="span"
                    onClick={updateAvatarPictures}
                    // disabled={updating}
                    className={classes.button}
                  >
                    Actualizar imagen
                  </Button>
                </div>
              ) : null}
              {activeStep === 2 ? (
                <div>
                  <Avatar src={backgroudImageURL} className={classes.profilePicPreview} />
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    key={fileKey}
                    onChange={handleBackgroudChange}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    {!backgroudImageURL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Add Picture
                      </Button>
                    )}
                    {backgroudImageURL && (
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
                  {backgroudImageURL && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="span"
                      onClick={removeBackgroudFile}
                      disabled={updating}
                      className={classes.button}
                    >
                      Remove Picture
                    </Button>
                  )}
                  <br />
                  <Button
                    variant="outlined"
                    component="span"
                    onClick={updateBackgroudPictures}
                    // disabled={updating}
                    className={classes.button}
                  >
                    Actualizar Fondo
                  </Button>
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
