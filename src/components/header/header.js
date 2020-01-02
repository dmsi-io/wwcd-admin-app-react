import React, { useCallback } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Button } from '@dmsi/wedgekit';

import { userLogout } from '../../redux/modules/userLogout';

import s from './header.module.scss';

const Header = ({ history }) => {
  const username = useSelector((state) => state.userInfo.username);

  const dispatch = useDispatch();

  const logout = useCallback(() => {
    dispatch(userLogout());
    history.push('/login');
  }, [dispatch, history]);

  return (
    <div className={s.headerContiner}>
      <Link to="/">
        <h2>WWCD</h2>
      </Link>
      <div>
        <span>Hello {username}</span>
        <Button onClick={logout}>Logout</Button>
      </div>
    </div>
  );
};

Header.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Header);
