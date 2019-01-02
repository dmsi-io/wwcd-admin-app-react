import React from 'react';
import PropTypes from 'prop-types';

const PageNotFound = ({ location }) => (
  <div>
    <h3>
      No match for <code>{location.pathname}</code>
    </h3>
  </div>
);

PageNotFound.propTypes = {
  location: PropTypes.object.isRequired,
};

export default PageNotFound;
