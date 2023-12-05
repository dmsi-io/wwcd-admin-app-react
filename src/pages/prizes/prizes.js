import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Loading, Button, Card, StackedCard } from '@wedgekit/core';
import colors from '@wedgekit/color';
import Layout from '@wedgekit/layout';
import { Title, Text } from '@wedgekit/primitives';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './prizes.module.scss';

const MultiplierNoImage = styled.p`
  background-color: ${colors.R500};
  border-radius: 50%;
  height: 7rem;
  width: 7rem;
  font-size: 4rem;
  line-height: 7rem;
  text-align: center;
  vertical-align: middle;
  color: ${colors.N050};
  margin: 0 0.5rem 0 0;
`;

const ImageContainer = styled.div`
  width: 7rem;
  height: 7rem;
  position: relative;
  margin-right: 0.5rem;

  p {
    background-color: ${colors.R500};
    border-radius: 50%;
    height: 2rem;
    width: 2rem;
    font-size: 1.5rem;
    line-height: 2rem;
    text-align: center;
    vertical-align: middle;
    color: ${colors.N050};

    position: absolute;
    top: -2rem;
    right: -0.5rem;
    z-index: 1;
  }

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
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();
                return aTitle.localeCompare(bTitle);
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
            <Layout.Grid
              columns={['repeat(2, minmax(0, max-content))']}
              areas={[]}
              align="center"
              justify="space-between"
            >
              <Title level={1} elementLevel={1}>
                Prizes
              </Title>
              <Layout.Grid
                columns={['repeat(2, minmax(0, max-content))']}
                areas={[]}
                align="center"
                mutliplier={2}
              >
                <Link to="/prize">
                  <Button>+ Add Prize</Button>
                </Link>
              </Layout.Grid>
            </Layout.Grid>
            <Layout.Grid columns={[1]} multiplier={2} areas={[]}>
              {this.state.prizes.map((prize) => (
                <Link key={prize.id} to={`/prize/${prize.id}`}>
                  <StackedCard>
                    <Layout.Grid
                      align="start"
                      columns={['minmax(0, max-content)', 1]}
                      multiplier={2}
                      areas={[]}
                    >
                      {prize.image === null ? (
                        prize.multiplier && prize.multiplier > 1 ? (
                          <MultiplierNoImage>x{prize.multiplier}</MultiplierNoImage>
                        ) : null
                      ) : (
                        <ImageContainer>
                          {prize.multiplier && prize.multiplier > 1 ? (
                            <p>x{prize.multiplier}</p>
                          ) : null}
                          <img src={prize.image} alt="Prize" />
                        </ImageContainer>
                      )}
                      <Layout.Grid columns={[1]} areas={[]} multiplier={2}>
                        <Title level={3} elementLevel={3}>
                          {prize.title}
                        </Title>
                        <Text>{prize.description}</Text>
                        {prize.category !== undefined && prize.category !== '' && (
                          <Text>
                            <strong>Category: {prize.category}</strong>
                          </Text>
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
