import React, { Component } from 'react';

import { Loading } from '@wedgekit/core';

import Header from '../../components/header/header';
import Api from '../../utils/api';

class ExportUsersPage extends Component {
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
          users: sort(data.data.map(({ attributes }) => attributes)),
          loading: false,
        });
      }
    });
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        <div
          style={{
            width: '80%',
            minWidth: '200px',
            margin: '0 auto',
            padding: '10px',
          }}
        >
          <div>First Name,Last Name,Username,Password</div>
          {this.state.users.map((user) => (
            <div key={user.id}>
              {user.firstName},{user.lastName},{user.username},{user.password}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default ExportUsersPage;
