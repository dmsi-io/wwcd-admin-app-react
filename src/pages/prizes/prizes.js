import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Loading, Button, Card, StackedCard } from '@wedgekit/core';
import Layout from '@wedgekit/layout';
import { Title, Text } from '@wedgekit/primitives';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './prizes.module.scss';

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    object-fit: cover;
  }
`;

class PrizesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prizes: [],
      loading: true,
    };
  }

  componentDidMount() {
    Api.get('/prizes').then(
      ([err, data]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error getting prizes', err);
          return;
        }

        if (data && data.data) {
          this.setState({
            prizes: data.data
              .map(({ attributes }) => attributes)
              .sort((a, b) => {
                if (a.title < b.title) {
                  return -1;
                }
                return a.title > b.title ? 1 : 0;
              }),
            loading: false,
          });
        }
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.log('Error getting prizes', err);
      },
    );
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        <Card className={s.contentContainer}>
          <Layout.Grid columns={[1]} multiplier={4} areas={[]}>
            <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} align="center" justify="space-between">
              <Title level={1} elementLevel={1}>Prizes</Title>
              <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} align="center" mutliplier={2}>
                <Link to="/user">
                  <Button>+ Add Prize</Button>
                </Link>
              </Layout.Grid>
            </Layout.Grid>
            <Layout.Grid columns={[1]} multiplier={2} areas={[]}>
              {this.state.prizes.map((prize) => (
                <Link key={prize.id} to={`/prize/${prize.id}`}>
                  <StackedCard>
                    <Layout.Grid align="start" columns={['minmax(0, max-content)', 1]} multiplier={2} areas={[]}>
                      {prize.image !== null && (
                        <ImageContainer>
                          <img src={prize.image} alt="Prize" />
                        </ImageContainer>
                      )}
                      <Layout.Grid columns={[1]} areas={[]} multiplier={2}>
                        <Title level={3} elementLevel={3}>{prize.title}</Title>
                        <Text>{prize.description}</Text>
                        {prize.category !== undefined && prize.category !== '' && (
                          <Text><strong>Category: {prize.category}</strong></Text>
                        )}
                      </Layout.Grid>
                    </Layout.Grid>
                  </StackedCard>
                </Link>
              ))}
            </Layout.Grid>
          </Layout.Grid>
        </Card>
      </div>
    );
  }
}

export default PrizesPage;
