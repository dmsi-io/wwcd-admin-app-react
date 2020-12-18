import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Icon, { IconWidth } from '@wedgekit/icons';
import { Card } from '@wedgekit/core';
import Layout from '@wedgekit/layout';
import { Title } from '@wedgekit/primitives';

import Api from '../../utils/api';
import Header from '../../components/header/header';

const Button = styled.button`
  appearance: none;
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin: 0;
  cursor: pointer;
`;

const Grid = styled(Layout.Grid)`
  width: 85%;
  max-width: 700px;
  margin: 50px auto 24px;
`;

const Home = () => {
  const clearUsed = useCallback(() => {
    Api.post('/tickets/clearused', JSON.stringify({}), true).then(() => {
      alert('All tickets have been cleared from being used.'); // eslint-disable-line
    });
  }, []);

  return (
    <div>
      <Header />
      <Grid columns={[1]} multiplier={4} areas={[]}>
        <Link to="/draw">
          <Card>
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              justify="space-between"
              align="center"
            >
              <Title level={1} elementLevel={2}>
                Draw for Prizes
              </Title>
              <IconWidth iconWidth={24}>
                <Icon>chevron_right</Icon>
              </IconWidth>
            </Layout.Grid>
          </Card>
        </Link>
        <Link to="/prizes">
          <Card>
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              justify="space-between"
              align="center"
            >
              <Title level={1} elementLevel={2}>
                Prizes
              </Title>
              <IconWidth iconWidth={24}>
                <Icon>chevron_right</Icon>
              </IconWidth>
            </Layout.Grid>
          </Card>
        </Link>
        <Link to="/users">
          <Card>
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              justify="space-between"
              align="center"
            >
              <Title level={1} elementLevel={2}>
                Users
              </Title>
              <IconWidth iconWidth={24}>
                <Icon>chevron_right</Icon>
              </IconWidth>
            </Layout.Grid>
          </Card>
        </Link>
        <Link to="/selections">
          <Card>
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              justify="space-between"
              align="center"
            >
              <Title level={1} elementLevel={2}>
                Selections
              </Title>
              <IconWidth iconWidth={24}>
                <Icon>chevron_right</Icon>
              </IconWidth>
            </Layout.Grid>
          </Card>
        </Link>
        <Button onClick={clearUsed}>
          <Card>
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              justify="space-between"
              align="center"
            >
              <Title level={1} elementLevel={2}>
                Mark all tickets as unused
              </Title>
              <IconWidth iconWidth={24}>
                <Icon>check</Icon>
              </IconWidth>
            </Layout.Grid>
          </Card>
        </Button>
      </Grid>
    </div>
  );
};

export default Home;
