import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Grid, Button } from '@material-ui/core';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import Page from '../containers/Page';
import StoryNodesTable from '../tables/StoryNodesTable';

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

function StoryNode() {
  const theme = useTheme();
  const history = useHistory();
  const classes = useStyles(theme);
  const location = useLocation();
  const { storyId } = useParams();
  const [storyName, setCategoryName] = useState('');

  useEffect(() => {
    if (location.state && location.state.story && location.state.story.name) {
      setCategoryName(location.state.story.name);
    }
  }, [storyId]);

  const onCreateStoryNode = () => {
    history.push(`/storyNodes/${storyId}/create`);
  };

  const onSimulateStoryNode = () => {
    history.push(`/story/simulate/${storyId}`);
  };

  const getActionButtons = () => (
    <Grid container direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
      <Grid item>
        <Button variant="outlined" color="primary" onClick={onCreateStoryNode}>
          Crear Nodo
        </Button>
        <Button variant="outlined" color="primary" onClick={onSimulateStoryNode}>
          Simular Nodo
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
    <Page title={storyName} breadcrumbs={getBreadcrumbs()} actionItems={getActionButtons()}>
      <StoryNodesTable className={classes.datagrid} />
    </Page>
  );
}

export default StoryNode;
