import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    textDecoration: 'none',
    color: theme.palette.text.primary,
  },
  typeIcon: {
    maxWidth: 20,
    marginRight: 20,
  },
  nameLabel: {
    marginTop: 3,
    fontWeight: 500,
  },
}));

function LinkCell({ data, url }) {
  const classes = useStyles();

  return (
    <Link className={classes.root} to={url}>
      <div className={classes.nameLabel}>{data}</div>
    </Link>
  );
}

LinkCell.propTypes = {
  data: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};
export default LinkCell;
