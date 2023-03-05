import React from 'react';
import { Toolbar, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BackupIcon from '@material-ui/icons/Backup';
import AppBar from '@mui/material/AppBar';
import { useHistory } from 'react-router-dom';
import UserBadge from '../components/UserBadge';
import AuthGroupWrapper from '../components/AuthGroupWrapper';

const useStyles = makeStyles((theme) => ({
  rootHeader: {
    boxShadow: 'none !important',
    borderBottom: '1px solid #EEE',
    backgroundColor: '#FFFFFF !important',
  },
  logoContainer: {
    flexGrow: 1,
  },
  logo: {
    width: 220,
    cursor: 'pointer',
  },
  uploadButton: {
    marginRight: theme.spacing(2),
  },
}));

function Header(props) {
  // eslint-disable-next-line react/prop-types
  const { drawerWidth } = props;
  const classes = useStyles();
  const history = useHistory();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
      className={classes.rootHeader}
    >
      <Toolbar>
        <div className={classes.logoContainer}>
          <img
            src="/images/globomantics-logo-grey.png"
            alt="Globomantics Logo"
            className={classes.logo}
            onClick={() => history.push('/')}
          />
        </div>
        <AuthGroupWrapper requiredGroups={['admin', 'contributor']}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => history.push('/upload')}
            className={classes.uploadButton}
            startIcon={<BackupIcon />}
          >
            Upload
          </Button>
        </AuthGroupWrapper>
        <UserBadge />
      </Toolbar>
    </AppBar>
  );
}

export default Header;
