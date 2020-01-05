import React, { useCallback } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { Button } from '@wedgekit/core';
import { Title } from '@wedgekit/primitives';
import Layout from '@wedgekit/layout';

import { userLogout } from '../../redux/modules/userLogout';

const AppHeader = styled.header`
  display: grid;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 16px 12px;
  box-shadow: 0 -6px 22px 0 rgba(0,0,0,0.4);
  z-index: 1030;
  position: relative;
  width: 100%;
  background: #FFFFFF;
  grid-template-columns: repeat(2, minmax(0,max-content));
  box-sizing: border-box;
  justify-content: space-between;
`;

const Header = ({ history }) => {
  const username = useSelector((state) => state.userInfo.username);

  const dispatch = useDispatch();

  const logout = useCallback(() => {
    dispatch(userLogout());
    history.push('/login');
  }, [dispatch, history]);

  return (
    <AppHeader>
      <Link to="/">
        <Title level={2} elementLevel={2}>WWCD</Title>
      </Link>
      <Layout.Grid areas={[]} columns={['repeat(2, minmax(0, max-content))']} multiplier={2} align="center">
        <span>Hello {username}</span>
        <Button onClick={logout} domain="primary">Logout</Button>
      </Layout.Grid>
    </AppHeader>
  );
};

Header.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Header);
