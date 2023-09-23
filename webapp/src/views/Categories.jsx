import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Page from '../containers/Page';
import CategoriesTable from '../tables/CategoriesTable';

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

function Category() {
  const theme = useTheme();
  const history = useHistory();
  const classes = useStyles(theme);

  const onCreateCategory = () => {
    history.push('/category/create');
  };

  const getActionButtons = () => (
    <Grid container direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid item>
        <Button variant="outlined" color="primary" onClick={onCreateCategory}>Crear Categoria</Button>
      </Grid>
    </Grid>
  );

  const getBreadcrumbs = () => [
    {
      name: 'All Documents',
      link: '/',
    },
    {
      name: 'Categorías',
    },
  ];

  return (
    <Page
      title="Categorías"
      breadcrumbs={getBreadcrumbs()}
      actionItems={getActionButtons()}
    >
      <CategoriesTable className={classes.datagrid} />
    </Page>
  );
}

export default Category;
