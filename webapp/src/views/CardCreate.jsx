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
import Autocomplete from '@mui/material/Autocomplete';
import Page from '../containers/Page';
import { createCard, getCard, updateCardProfile } from '../services';

const infoOptions = ['quePrefieresPulgares', 'encuestaDeDedos', 'passcode'];

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

function CardCreate() {
  const { cardId, categoryId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const classes = useStyles();

  const [type, setType] = useState('question');
  // const [categoryId, setCategoryId] = useState('');
  const [text, setText] = useState('');

  // response
  const [text2, setText2] = useState('');
  const [duration, setDuration] = useState(1);
  const [timeout, setTimeout] = useState(0);
  const [passcode, setPasscode] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const [info, setInfo] = useState('');
  const [status, setStatus] = useState('active');

  const [originalCard, setOrignalCard] = useState({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [image1URL, setImage1URL] = useState(null);
  const [image1File, setImage1File] = useState(null);

  const [image2URL, setImage2URL] = useState(null);
  const [image2File, setImage2File] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [fileKey, setFileKey] = useState(Date.now());
  // eslint-disable-next-line no-unused-vars
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (!text || text.length < 1) {
      setIsValid(false);
      return;
    }
    if (!categoryId || categoryId.length < 1) {
      setIsValid(false);
      return;
    }
    if (!type || type.length < 1) {
      setIsValid(false);
      return;
    }

    if ((type === 'question' || type === 'virus') && (!text2 || text2.length < 1)) {
      setIsValid(false);
      return;
    }

    if (type === 'virus' && !duration) {
      setIsValid(false);
      return;
    }

    if (type === 'timeout' && !timeout) {
      setIsValid(false);
      return;
    }

    if (type === 'passcode' && !passcode) {
      setIsValid(false);
      return;
    }

    if (type === 'roulette' && !secondaryText) {
      setIsValid(false);
      return;
    }

    if (!status || status.length < 3) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  }, [text, categoryId, type, text2, duration, status, timeout, passcode, secondaryText]);

  useEffect(() => {
    (async () => {
      console.log('cardId', cardId);
      if (!cardId || cardId === 'create') {
        return;
      }
      const data = await getCard(cardId);
      setOrignalCard(data);
      setType(data.type);
      setText(data.text);
      // setCategoryId(data.categoryId);
      setText2(data.text2);
      setDuration(data.duration);
      setTimeout(data.timeout);
      setStatus(data.status);
      setInfo(data.info);
      setPasscode(data.passcode);
      setSecondaryText(data.secondaryText);
      if (data.image1URL) {
        setImage1URL(data.image1URL);
      }
      if (data.image2URL) {
        setImage2URL(data.image2URL);
      }
    })();
  }, [cardId]);

  const createCardF = async () => {
    setSubmitting(true);
    try {
      await createCard({
        ...originalCard,
        type,
        text,
        categoryId,
        text2,
        duration,
        timeout,
        passcode,
        secondaryText,
        status,
        info,
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

  const handleImage1Change = (event) => {
    const newImage = event.target?.files?.[0];
    setImage1File(newImage);
    setImage1URL(URL.createObjectURL(newImage));
  };

  const removeImage1File = () => {
    setImage1File(null);
    setImage1URL(null);
    setFileKey(Date.now());
  };

  const updateImage1Pictures = async () => {
    setUpdating(true);
    let shouldDeletePicture = false;
    let file;
    if (originalCard.image1 && !image1URL) {
      // Photo needs to be deleted
      shouldDeletePicture = true;
    } else if (originalCard.image1 !== image1URL) {
      // Photo needs to be updated
      file = image1File;
    }
    await updateCardProfile(
      originalCard.PK,
      originalCard.categoryId,
      shouldDeletePicture,
      file,
      'image1',
    );
    setUpdating(false);
  };

  const handleImage2Change = (event) => {
    const newImage = event.target?.files?.[0];
    setImage2File(newImage);
    setImage2URL(URL.createObjectURL(newImage));
  };

  const removeImage2File = () => {
    setImage2File(null);
    setImage2URL(null);
    setFileKey(Date.now());
  };

  const updateImage2Pictures = async () => {
    setUpdating(true);
    let shouldDeletePicture = false;
    let file;
    if (originalCard.image2URL && !image2URL) {
      // Photo needs to be deleted
      shouldDeletePicture = true;
    } else if (originalCard.image2URL !== image2URL) {
      // Photo needs to be updated
      file = image2File;
    }
    await updateCardProfile(
      originalCard.PK,
      originalCard.categoryId,
      shouldDeletePicture,
      file,
      'image2',
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
      name: 'Cartas',
      link: `/cards/${categoryId}`,
    },
    {
      name: 'Formulario',
      link: '/cards',
    },
  ];

  return (
    <Page title="Crear Carta" breadcrumbs={getBreadcrumbs()}>
      {isSuccessVisible && (
        <MuiAlert
          onClose={() => setIsSuccessVisible(false)}
          className={classes.alert}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Carta Creada con Exito
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
                  <Step completed={isValid && image1URL}>
                    <StepButton color="inherit" onClick={handleStep(1)} disabled={!isValid}>
                      Foto 1
                    </StepButton>
                  </Step>
                  <Step completed={isValid && image2URL}>
                    <StepButton color="inherit" onClick={handleStep(2)} disabled={!isValid}>
                      Foto 2
                    </StepButton>
                  </Step>
                </Stepper>
              </div>
              {activeStep === 0 ? (
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Tipo</InputLabel>
                    <Select
                      className={classes.input}
                      labelId="status-label"
                      id="status"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      disabled={submitting}
                      required
                    >
                      <MenuItem value="text">Texto</MenuItem>
                      <MenuItem value="question">Question</MenuItem>
                      <MenuItem value="virus">Virus</MenuItem>
                      <MenuItem value="timeout">Contra reloj</MenuItem>
                      <MenuItem value="passcode">Palabra clave</MenuItem>
                      <MenuItem value="roulette">Ruleta</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    id="text"
                    className={classes.input}
                    label="Texto"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    disabled={submitting}
                    multiline
                    rows={8}
                    fullWidth
                  />
                  {(type === 'question' || type === 'virus') && (
                    <TextField
                      id="text2"
                      className={classes.input}
                      label="Texto 2"
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      multiline
                      rows={8}
                      required={type === 'question' || type === 'virus'}
                      disabled={submitting}
                      fullWidth
                    />
                  )}
                  {type === 'virus' && (
                    <TextField
                      id="duration"
                      className={classes.input}
                      label="Duración"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required={type === 'virus'}
                      disabled={submitting}
                      fullWidth
                    />
                  )}
                  {type === 'timeout' && (
                    <TextField
                      id="timeout"
                      type="number"
                      className={classes.input}
                      label="Duracion en segundos"
                      value={timeout}
                      onChange={(e) => setTimeout(e.target.value)}
                      required={type === 'timeout'}
                      disabled={submitting}
                      fullWidth
                    />
                  )}

                  {type === 'passcode' && (
                    <TextField
                      id="passcode"
                      className={classes.input}
                      label="Palabra clave"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      required={type === 'passcode'}
                      disabled={submitting}
                      fullWidth
                    />
                  )}

                  {type === 'roulette' && (
                    <TextField
                      id="secondaryText"
                      className={classes.input}
                      label="Texto secundario"
                      value={secondaryText}
                      onChange={(e) => setSecondaryText(e.target.value)}
                      required={type === 'roulette'}
                      disabled={submitting}
                      fullWidth
                    />
                  )}

                  <Autocomplete
                    className={classes.input}
                    freeSolo
                    options={infoOptions}
                    value={info}
                    onChange={(e, newValue) => setInfo(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Información adicional"
                        onChange={(e) => setInfo(e.target.value)}
                        fullWidth
                      />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="status-label">Estado</InputLabel>
                    <Select
                      className={classes.input}
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
                </div>
              ) : null}
              {activeStep === 1 ? (
                <div>
                  <Avatar src={image1URL} className={classes.profilePicPreview} />
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    key={fileKey}
                    onChange={handleImage1Change}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    {!image1URL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Add Picture
                      </Button>
                    )}
                    {image1URL && (
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
                  {image1URL && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="span"
                      onClick={removeImage1File}
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
                    onClick={updateImage1Pictures}
                    // disabled={updating}
                    className={classes.button}
                  >
                    Actualizar imagen
                  </Button>
                </div>
              ) : null}
              {activeStep === 2 ? (
                <div>
                  <Avatar src={image2URL} className={classes.profilePicPreview} />
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    key={fileKey}
                    onChange={handleImage2Change}
                    type="file"
                  />
                  <label htmlFor="raised-button-file">
                    {!image2URL && (
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={updating}
                        className={classes.button}
                      >
                        Add Picture
                      </Button>
                    )}
                    {image2URL && (
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
                  {image2URL && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      component="span"
                      onClick={removeImage2File}
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
                    onClick={updateImage2Pictures}
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
            onClick={createCardF}
          >
            Crear Carta
          </Button>
        </Grid>
      </Grid>
    </Page>
  );
}

export default CardCreate;
