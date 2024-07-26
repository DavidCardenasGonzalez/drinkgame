import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  TextField,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import Page from '../containers/Page';
import { getCategory, simulateCategory } from '../services';

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
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

function SimulateCategory() {
  const { categoryId } = useParams();
  const classes = useStyles();
  const [game, setGame] = useState([]);
  const [members, setMembers] = useState([
    { name: 'Juan', gender: 'male' },
    { name: 'Pedro', gender: 'male' },
    { name: 'Maria', gender: 'female' },
    { name: 'Elena', gender: 'female' },
  ]);

  // eslint-disable-next-line no-unused-vars
  const [originalCard, setOrignalCard] = useState({});
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    (async () => {
      console.log('categoryId', categoryId);
      if (!categoryId || categoryId === 'create') {
        return;
      }
      const data = await getCategory(categoryId);
      setOrignalCard(data);
    })();
  }, [categoryId]);

  const createCardF = async () => {
    setSubmitting(true);
    try {
      const response = await simulateCategory({
        categoryId,
        members,
      });
      console.log('response', response);
      setGame(response);
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

  const handleModification = (value, index, field) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
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
      name: 'Simular',
      link: '/cards',
    },
  ];

  return (
    <Page title="Simular Carta" breadcrumbs={getBreadcrumbs()}>
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
      <Grid container spacing={2}>
        <Card className={classes.card}>
          <CardContent>
            {members.map((member, index) => (
              <>
                <Grid container spacing={2} key={member.name}>
                  <Grid item sm={6}>
                    <TextField
                      id="name"
                      className={classes.input}
                      label="Nombre"
                      value={member.name}
                      onChange={(e) => handleModification(e.target.value, index, 'name')}
                      disabled={submitting}
                      fullWidth
                    />
                  </Grid>
                  <Grid item sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Genero</InputLabel>
                      <Select
                        className={classes.input}
                        labelId="status-label"
                        id="status"
                        value={member.gender}
                        onChange={(e) => handleModification(e.target.value, index, 'gender')}
                        disabled={submitting}
                        required
                      >
                        <MenuItem value="male">Hombre</MenuItem>
                        <MenuItem value="female">Mujer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </>
            ))}
            <ul>
              {game.map((item) => (
                <li key={item.PK} className={classes.listItem}>
                  {item.displayText}
                  <IconButton
                    component={Link}
                    to={`/cards/${item.categoryId}/${item.PK}`}
                    color="primary"
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Grid>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item className={classes.actionItemsContainer} xs>
          <Button
            variant="outlined"
            color="primary"
            startIcon={getButtonIcon()}
            onClick={createCardF}
          >
            Simular
          </Button>
        </Grid>
      </Grid>
    </Page>
  );
}

export default SimulateCategory;
