import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Loading, Button, Card, StackedCard } from '@wedgekit/core';
import Layout from '@wedgekit/layout';
import { Title, Text } from '@wedgekit/primitives';

import Header from '../../components/header/header';
import Api from '../../utils/api';

import s from './users.module.scss';

class UsersPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      loading: true,
    };
  }

  componentDidMount() {
    const sort = (users) =>
      users.sort((a, b) => {
        const aName = `${a.lastName}, ${a.firstName}`;
        const bName = `${b.lastName}, ${b.firstName}`;
        return aName < bName ? -1 : aName > bName ? 1 : 0; // eslint-disable-line
      });

    Api.get('/users', true).then(([err, data]) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error getting users', err);
        return;
      }

      if (data && data.data) {
        this.setState({
          loading: false,
          users: sort(data.data.map(({ attributes }) => attributes)),
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.usersUpdateUnsubscribe) {
      this.usersUpdateUnsubscribe();
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        <Card className={s.contentContainer}>
          <Layout.Grid columns={[1]} multiplier={4} areas={[]}>
            <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} align="center" justify="space-between">
              <Title level={1} elementLevel={1}>Users</Title>
              <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} align="center" mutliplier={2}>
                <Link to="/users/export">
                  <Button>Export Users</Button>
                </Link>
                <Link to="/user">
                  <Button domain="primary">+ Add User</Button>
                </Link>
              </Layout.Grid>
            </Layout.Grid>
            <Layout.Grid columns={[1]} multiplier={2} areas={[]}>
              {this.state.users.map((user) => (
                <Link key={user.id} to={`/user/${user.id}`}>
                  <StackedCard compact>
                    <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} multiplier={2} align="center" justify="space-between">
                      <Title level={3} elementLevel={3}>
                        {user.lastName}, {user.firstName}
                      </Title>
                      <Text>Tickets: {user.tickets}</Text>
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

export default UsersPage;
