import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Auth } from 'aws-amplify';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useUser } from '../UserContext';
import { getAllCategories, getAllStories } from '../services';

const useStyles = makeStyles(() => ({
  menu: {
    backgroundColor: '#fff343',
    color: 'white',
  },
  menuIcon: {
    color: '#b7d0de',
    marginLeft: 20,
  },
  menuIconTree: {
    color: '#b7d0de',
    marginLeft: 20,
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    marginTop: 50,
  },
  avatar: {
    boxShadow: '2px 2px 5px #1c1b1b',
    width: 130,
    height: 130,
  },
  name: {
    color: '#b7d0de',
    fontSize: 16,
    textAlign: 'center',
    margin: '0 15px',
    fontWeight: 700,
    paddingTop: 30,
  },
  logoutButton: {
    color: '#b7d0de',
    fontSize: '11px',
    textAlign: 'center',
  },
  divider: {
    borderColor: '#b7d0de',
    margin: '15px',
  },
}));

function Menu(props) {
  // eslint-disable-next-line react/prop-types
  const { drawerWidth } = props;
  const window = undefined;
  const history = useHistory();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [stories, setStories] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [openNodes, setOpenNodes] = React.useState(false);

  const { user } = useUser();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const fetchData = async () => {
    const data = await getAllCategories();
    const cats = data.sort((a, b) => a.order - b.order);
    // .filter((category) => category.status === 'active');
    setCategories(cats);
    const storiesData = await getAllStories();
    const storiesSorted = storiesData.sort((a, b) => a.order - b.order)
      .filter((story) => story.status === 'active');
    setStories(storiesSorted);
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error signing out: ', error);
    }
  };

  const drawer = (
    <div>
      <div className={classes.avatarContainer}>
        <Avatar className={classes.avatar} src={user.pictureURL} />
        <div className={classes.name}>{user.name}</div>
        <Button onClick={signOut} className={classes.logoutButton} variant="text">
          Cerrar Sesión
        </Button>
      </div>
      <Divider className={classes.divider} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              history.push('/users');
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              history.push('/employees');
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <Diversity3Icon />
            </ListItemIcon>
            <ListItemText primary="Empleados" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              history.push('/categories');
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <Diversity3Icon />
            </ListItemIcon>
            <ListItemText primary="Categorías" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <Diversity3Icon />
            </ListItemIcon>
            <ListItemText primary="Cartas" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div">
            {categories.map((category) => (
              <ListItem key={category.name}>
                <ListItemButton
                  onClick={() => {
                    history.push({
                      pathname: `/cards/${category.PK}`,
                      state: { category },
                    });
                  }}
                >
                  <ListItemIcon className={classes.menuIcon}>
                    <Diversity3Icon />
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              history.push('/stories');
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <Diversity3Icon />
            </ListItemIcon>
            <ListItemText primary="Historias" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setOpenNodes(!openNodes);
            }}
          >
            <ListItemIcon className={classes.menuIcon}>
              <Diversity3Icon />
            </ListItemIcon>
            <ListItemText primary="Nodos" />
            {openNodes ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openNodes} timeout="auto" unmountOnExit>
          <List component="div">
            {stories.map((story) => (
              <ListItem key={story.name}>
                <ListItemButton
                  onClick={() => {
                    history.push({
                      pathname: `/storyNodes/${story.PK}`,
                      state: { story },
                    });
                  }}
                >
                  <ListItemIcon className={classes.menuIcon}>
                    <Diversity3Icon />
                  </ListItemIcon>
                  <ListItemText primary={story.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
      <Divider />
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <Drawer
        className={classes.menu}
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#102E4A',
            color: 'white',
          },
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#102E4A',
            color: 'white',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#102E4A',
            color: 'white',
          },
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#102E4A',
            color: 'white',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default Menu;
