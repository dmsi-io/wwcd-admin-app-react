import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { IconChevron, IconCheck } from '@dmsi/wedgekit';

import Api from '../../utils/api';
import Header from '../../components/header/header';

import s from './home.module.scss';

const Home = () => {
  const clearUsed = useCallback(() => {
    Api.post('/tickets/clearused', JSON.stringify({}), true).then(() => {
      alert('All tickets have been cleared from being used.'); // eslint-disable-line
    });
  }, []);
  return (
    <div>
      <Header />
      <div className={s.contentContainer}>
        <div>
          <Link to="/draw">
            <div>
              <h1>Draw for Prizes</h1>
              <div>
                <IconChevron direction="right" context="brand-dark-blue" />
              </div>
            </div>
          </Link>
        </div>
        <div>
          <Link to="/prizes">
            <div>
              <h1>Prizes</h1>
              <div>
                <IconChevron direction="right" context="brand-dark-blue" />
              </div>
            </div>
          </Link>
        </div>
        <div>
          <Link to="/users">
            <div>
              <h1>Users</h1>
              <div>
                <IconChevron direction="right" context="brand-dark-blue" />
              </div>
            </div>
          </Link>
        </div>
        <div>
          <button onClick={clearUsed}>
            <div>
              <h1>Mark all tickets as unused</h1>
              <div>
                <IconCheck direction="right" context="brand-dark-blue" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
