import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Breadcrumbs, Link } from '@material-ui/core';
import { Helmet } from 'react-helmet-async';
import Grid from '@material-ui/core/Grid';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
// import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Header from './Header';
import Menu from './Menu';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  rootView: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(7),
  },
  contentContainer: {
    marginBottom: theme.spacing(4),
  },
}));

function Page({
  title, breadcrumbs, actionItems, children,
}) {
  const classes = useStyles();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* <CssBaseline /> */}
      <Header drawerWidth={drawerWidth} />
      <Menu drawerWidth={drawerWidth} />

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Container className={classes.rootView}>
          <Helmet title={title} />
          <Grid container spacing={3} className={classes.contentContainer}>
            <Grid item xs={7}>
              <Typography variant="h3" gutterBottom display="inline">
                {title}
              </Typography>
              {breadcrumbs && (
                <Breadcrumbs aria-label="Breadcrumb" mt={2}>
                  {breadcrumbs.map((bc, idx, arr) => {
                    if (idx === arr.length - 1) {
                      return <Typography key={`bc-${bc.name}`}>{bc.name}</Typography>;
                    }
                    return (
                      <Link component={NavLink} exact to={bc.link} key={`bc-${bc.name}`}>
                        {bc.name}
                      </Link>
                    );
                  })}
                </Breadcrumbs>
              )}
            </Grid>
            <Grid item xs={5}>
              {actionItems}
            </Grid>
          </Grid>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

Page.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      link: PropTypes.string,
    }),
  ),
  actionItems: PropTypes.node,
  children: PropTypes.node.isRequired,
};

Page.defaultProps = {
  breadcrumbs: [],
  actionItems: <></>,
};

export default Page;
