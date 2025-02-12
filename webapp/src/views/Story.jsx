import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Page from '../containers/Page';
import StoriesTable from '../tables/StoriesTable';

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

function Story() {
  const theme = useTheme();
  const history = useHistory();
  const classes = useStyles(theme);

  const onCreateStory = () => {
    history.push('/story/create');
  };

  const getActionButtons = () => (
    <Grid container direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid item>
        <Button variant="outlined" color="primary" onClick={onCreateStory}>Crear Historia</Button>
      </Grid>
    </Grid>
  );

  const getBreadcrumbs = () => [
    {
      name: 'All Documents',
      link: '/',
    },
    {
      name: 'Historias',
    },
  ];

  return (
    <Page
      title="Historias"
      breadcrumbs={getBreadcrumbs()}
      actionItems={getActionButtons()}
    >
      <StoriesTable className={classes.datagrid} />
    </Page>
  );
}

export default Story;
