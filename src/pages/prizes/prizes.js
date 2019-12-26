import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Loading, Button } from '@dmsi/wedgekit';

import Header from '../../components/header/header';
import Api from '../../utils/api';

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
        <div className={s.contentContainer}>
          <div>
            <div className={s.prizesHeader}>
              <h1>Prizes</h1>
              <span>
                <Link to="/prize">
                  <Button>+ Add Prize</Button>
                </Link>
              </span>
            </div>
            <div className={s.prizesContainer}>
              {this.state.prizes.map((prize) => (
                <Link key={prize.id} to={`/prize/${prize.id}`}>
                  <div className={s.prizeContainer}>
                    {prize.image !== null && (
                      <div className={s.prizeImageContainer}>
                        <img className={s.prizeImage} src={prize.image} alt="Prize" />
                      </div>
                    )}
                    <div className={s.prizeInfoContainer}>
                      <h3>{prize.title}</h3>
                      <p>{prize.description}</p>
                      {prize.category !== undefined && prize.category !== '' && (
                        <p>Category: {prize.category}</p>
                      )}
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
