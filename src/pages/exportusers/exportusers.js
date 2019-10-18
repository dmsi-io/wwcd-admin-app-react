import React, { Component } from 'react';

import { Loading } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Firebase from '../../fire';

class ExportUsersPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      loading: true,
    };
  }

  componentDidMount() {
    const db = Firebase.firestore();

    const sort = (docs) =>
      docs.sort((a, b) => {
        const aName = `${a.lastName}, ${a.firstName}`;
        const bName = `${b.lastName}, ${b.firstName}`;
        return aName < bName ? -1 : aName > bName ? 1 : 0; // eslint-disable-line
      });

    const usersRef = db.collection('users');

    this.usersUpdateUnsubscribe = usersRef.onSnapshot({
      next: (snapshot) => {
        this.setState({
          users: sort(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
          loading: false,
        });
      },
      error: (err) => {
        // eslint-disable-next-line no-console
        console.log('Error updating documents', err);
      },
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
