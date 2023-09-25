import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import Footer from './views/Footer';
import './App.css';
import Home from './views/Home';
import Profile from './views/Profile';
import Users from './views/Users';
import UserCreate from './views/UserCreate';
import Employee from './views/Employees';
import EmployeeCreate from './views/EmployeeCreate';
import NotFound from './views/NotFound';
// import Upload from './views/Upload';
import { UserProvider } from './UserContext';
import Category from './views/Categories';
import CategoryCreate from './views/CategoryCreate';

const useStyles = makeStyles(() => ({
  root: {
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flexGrow: 1,
    backgroundColor: 'rgb(247, 249, 252)',
  },
}));

function Routes() {
  const classes = useStyles();

  return (
    <Router>
      <Route
        render={() => (
          <UserProvider>
            <Paper className={classes.root}>
              <div className={classes.content}>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/profile" component={Profile} />
                  <Route exact path="/employees" component={Employee} />
                  <Route exact path="/employee/create" component={EmployeeCreate} />
                  <Route path="/employee/:employeeId" component={EmployeeCreate} />
                  <Route exact path="/categories" component={Category} />
                  <Route exact path="/category/create" component={CategoryCreate} />
                  <Route path="/category/:categoryId" component={CategoryCreate} />
                  <Route exact path="/users" component={Users} />
                  <Route exact path="/users/create" component={UserCreate} />
                  {/* <Route exact path="/upload" component={Upload} /> */}
                  <Route path="*" component={NotFound} />
                </Switch>
              </div>
              <Footer />
            </Paper>
          </UserProvider>
        )}
      />
    </Router>
  );
}

export default Routes;
