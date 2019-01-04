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
        this.setState({
          prizes: snapshot.docs,
          loading: false,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log('Error getting documents', err);
      });

    this.prizeUpdateUnsubscribe = prizesRef.onSnapshot({
      next: (snapshot) => {
        this.setState({
          prizes: snapshot.docs,
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
              {this.state.prizes.map((prize) => {
                const data = prize.data();
                return (
                  <Link key={prize.id} to={`/prize/${prize.id}`}>
                    <div className={s.prizeContainer}>
                      {
                        data.image !== '' &&
                        <div className={s.prizeImageContainer}>
                          <img
                            className={s.prizeImage}
                            src={data.image}
                            alt="Prize"
                          />
                        </div>
                      }
                      <div className={s.prizeInfoContainer}>
                        <h3>{data.title}</h3>
                        <p>{data.description}</p>
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

export default PrizesPage;
