import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Loading, Button } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Firebase from '../../fire';

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
        <div className={s.contentContainer}>
          <div>
            <div className={s.usersHeader}>
              <h1>Users</h1>
              <div>
                <span style={{ marginRight: '10px' }}>
                  <Link to="/users/export">
                    <Button>Export Users</Button>
                  </Link>
                </span>
                <span>
                  <Link to="/user">
                    <Button>+ Add User</Button>
                  </Link>
                </span>
              </div>
            </div>
            <div className={s.usersContainer}>
              {this.state.users.map((user) => (
                <Link key={user.id} to={`/user/${user.id}`}>
                  <div className={s.userContainer}>
                    <div className={s.userInfoContainer}>
                      <h3>
                        {user.lastName}, {user.firstName}
                      </h3>
                      <p>Tickets: {user.tickets}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UsersPage;
