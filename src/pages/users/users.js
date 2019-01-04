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

    const sort = (docs) => docs.slice(0).sort((a, b) => {
      const aData = a.data();
      const bData = b.data();
      const aName = `${aData.lastName}, ${aData.firstName}`;
      const bName = `${bData.lastName}, ${bData.firstName}`;
      return aName < bName ? -1 : aName > bName ? 1 : 0; // eslint-disable-line
    });

    const usersRef = db.collection('users');
    usersRef.get().then((snapshot) => {
      this.setState({
        users: sort(snapshot.docs),
        loading: false,
      });
    }, (err) => {
      // eslint-disable-next-line no-console
      console.log('Error getting documents', err);
    });

    this.usersUpdateUnsubscribe = usersRef.onSnapshot({
      next: (snapshot) => {
        this.setState({
          users: sort(snapshot.docs),
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
              <span>
                <Link to="/user">
                  <Button>
                    + Add User
                  </Button>
                </Link>
              </span>
            </div>
            <div className={s.usersContainer}>
              {this.state.users.map((user) => {
                const data = user.data();
                return (
                  <Link key={user.id} to={`/user/${user.id}`}>
                    <div className={s.userContainer}>
                      <div className={s.userInfoContainer}>
                        <h3>{data.lastName}, {data.firstName}</h3>
                        <p>Tickets: {data.tickets}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UsersPage;
