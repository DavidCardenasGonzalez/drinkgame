import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import Page from '../containers/Page';
import CardsTable from '../tables/CardsTable';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(5),
  },
  title: {
    marginBottom: theme.spacing(5),
  },
  datagrid: {
    flexGrow: 1,
  },
}));

function Card() {
  const theme = useTheme();
  const history = useHistory();
  const classes = useStyles(theme);
  const location = useLocation();
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (location.state && location.state.category && location.state.category.name) {
      setCategoryName(location.state.category.name);
    }
  }, [categoryId]);

  const onCreateCard = () => {
    history.push(`/cards/${categoryId}/create`);
  };

  const onSimulateCard = () => {
    history.push(`/category/simulate/${categoryId}`);
  };

  const getActionButtons = () => (
    <Grid container direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid item>
        <Button variant="outlined" color="primary" onClick={onCreateCard}>
          Crear Carta
        </Button>
        <Button variant="outlined" color="primary" onClick={onSimulateCard}>
          Simular Carta
        </Button>
      </Grid>
    </Grid>
  );

  const getBreadcrumbs = () => [
    {
      name: 'All Documents',
      link: '/',
    },
    {
      name: 'Cartas',
    },
  ];

  return (
    <Page title={categoryName} breadcrumbs={getBreadcrumbs()} actionItems={getActionButtons()}>
      <CardsTable className={classes.datagrid} />
    </Page>
  );
}

export default Card;
