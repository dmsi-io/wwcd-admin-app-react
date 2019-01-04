import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Button } from '@dmsi/wedgekit';

import Firebase from '../../fire';

import s from './header.module.scss';

const header = (props) => {
  const { currentUser } = Firebase.auth();

  return (
    <div className={s.headerContiner}>
      <Link to="/">
        <h2>WWCD</h2>
      </Link>
      <div>
        <span>
          Hello {currentUser.displayName || currentUser.email}
        </span>
        <Button
          onClick={() => {
            Firebase.auth().signOut().then(
              () => props.history.push('/login'),
              (err) => {
                // eslint-disable-next-line no-console
                console.log('Error signing out', err);
              },
            );
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

header.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(header);
