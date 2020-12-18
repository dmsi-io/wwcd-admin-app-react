import React, { Component } from 'react';
import moment from 'moment';

import { Loading, Card, StackedCard } from '@wedgekit/core';
import Layout from '@wedgekit/layout';
import { Title, Text } from '@wedgekit/primitives';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './selections.module.scss';

const sortSelections = (a, b) => {
  if (a.used === b.used) {
    if (a.lastname === b.lastname) {
      return a.firstname < b.firstname ? -1 : 1;
    }
    return a.lastname < b.lastname ? -1 : 1;
  }
  return a.used < b.used ? -1 : 1;
};

class PrizesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selections: [],
      loading: true,
    };
  }

  componentDidMount() {
    Api.get('/selections', true).then(
      ([err, data]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error getting selections', err);
          return;
        }

        if (data && data.data) {
          console.log(data);
          this.setState({
            selections: data.data
              .map((selection) => ({
                key: `${selection.id} ${selection.attributes.created}`,
                ...selection.attributes,
              }))
              .sort(sortSelections),
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

  onClick = async (key) => {
    /* eslint-disable-next-line no-alert */
    if (window.confirm('Mark gift as fulfilled?')) {
      const { selections } = this.state;
      const index = selections.findIndex((selection) => selection.key === key);

      if (index >= 0) {
        await Api.post(
          '/tickets/markused',
          JSON.stringify({
            data: {
              attributes: {
                prizeId: selections[index].prizeId,
                userId: selections[index].id,
              },
            },
          }),
          true,
        );

        this.setState({
          selections: [
            ...selections.slice(0, index),
            {
              ...selections[index],
              used: 1,
            },
            ...selections.slice(index + 1),
          ].sort(sortSelections),
        });
      }
    }
  };

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
                Selections
              </Title>
            </Layout.Grid>
            <Layout.Grid columns={[1]} multiplier={2} areas={[]}>
              {this.state.selections.map((selection) => (
                <StackedCard key={selection.key} onClick={() => this.onClick(selection.key)}>
                  <Layout.Grid
                    align="start"
                    columns={['minmax(0, max-content)', 1]}
                    multiplier={2}
                    areas={[]}
                  >
                    <Layout.Grid columns={[1]} areas={[]} multiplier={2}>
                      <Title level={3} elementLevel={3}>
                        {selection.firstname} {selection.lastname}
                      </Title>
                      <Text>
                        {moment(selection.created).format('M/D/YY h:mm:ss A')} - {selection.title}
                      </Text>
                      <Text>{selection.used === 0 ? 'Not yet delivered' : 'Fulfilled'}</Text>
                    </Layout.Grid>
                  </Layout.Grid>
                </StackedCard>
              ))}
            </Layout.Grid>
          </Layout.Grid>
        </Card>
      </div>
    );
  }
}

export default PrizesPage;
