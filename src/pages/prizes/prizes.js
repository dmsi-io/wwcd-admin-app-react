import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Loading, Button } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Firebase from '../../fire';

import s from './prizes.module.scss';

class PrizesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prizes: [],
      loading: true,
    };
  }

  componentDidMount() {
    const db = Firebase.firestore();

    const prizesRef = db.collection('prizes');
    prizesRef.get()
      .then((snapshot) => {
        const prizes = snapshot.docs.map((prize) => ({
          ...prize.data(),
          id: prize.id,
        })).sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          return a.title > b.title ? 1 : 0;
        });

        this.setState({
          prizes,
          loading: false,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log('Error getting documents', err);
      });

    this.prizeUpdateUnsubscribe = prizesRef.onSnapshot({
      next: (snapshot) => {
        const prizes = snapshot.docs.map((prize) => ({
          ...prize.data(),
          id: prize.id,
        })).sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          return a.title > b.title ? 1 : 0;
        });

        this.setState({
          prizes,
        });
      },
      error: (err) => {
        // eslint-disable-next-line no-console
        console.log('Error updating documents', err);
      },
    });
  }

  componentWillUnmount() {
    if (this.prizeUpdateUnsubscribe) {
      this.prizeUpdateUnsubscribe();
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        <div className={s.contentContainer}>
          <div>
            <div className={s.prizesHeader}>
              <h1>Prizes</h1>
              <span>
                <Link to="/prize">
                  <Button>
                    + Add Prize
                  </Button>
                </Link>
              </span>
            </div>
            <div className={s.prizesContainer}>
              {this.state.prizes.map((prize) => (
                <Link key={prize.id} to={`/prize/${prize.id}`}>
                  <div className={s.prizeContainer}>
                    {
                      prize.image !== '' &&
                      <div className={s.prizeImageContainer}>
                        <img
                          className={s.prizeImage}
                          src={prize.image}
                          alt="Prize"
                        />
                      </div>
                    }
                    <div className={s.prizeInfoContainer}>
                      <h3>{prize.title}</h3>
                      <p>{prize.description}</p>
                      {prize.category !== undefined && prize.category !== '' &&
                        <p>Category: {prize.category}</p>
                      }
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

export default PrizesPage;
