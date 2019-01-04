import React from 'react';
import { Link } from 'react-router-dom';

import { IconChevron } from '@dmsi/wedgekit';

import Header from '../../components/header/header';

import s from './home.module.scss';

export default () => (
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
    </div>
  </div>
);
