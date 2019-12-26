import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import PropTypes from 'prop-types';

import 'video-react/dist/video-react.css';
import '@dmsi/wedgekit/dist/wedgekit.css';

import store from './redux/store';

// import Draw from './pages/draw/draw';
import Home from './pages/home/home';
import Login from './pages/login';
import PageNotFound from './pages/404/404';
import Prize from './pages/prize/prize';
import PrizesList from './pages/prizes/prizes';
import User from './pages/user/user';
import Users from './pages/users/users';
import ExportUsers from './pages/exportusers/exportusers';

import './App.scss';
import storage from './utils/storage';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        storage.get('token') ? (
          <Component {...props} />
        ) : (
          <>
            {(() => {
              console.log('redirecting to login');
              return true;
            })() && (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from: props.location },
                }}
              />
            )}
          </>
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
  location: PropTypes.object,
};

PrivateRoute.defaultProps = {
  location: null,
};

const App = () => (
  <ReduxProvider store={store}>
    <Router>
      <div>
        <Switch>
          <Route path="/login" exact component={Login} />
          <PrivateRoute path="/" exact component={Home} />
          <PrivateRoute path="/prizes" exact component={PrizesList} />
          <PrivateRoute path="/prize/:id?" component={Prize} />
          <PrivateRoute path="/users" exact component={Users} />
          <PrivateRoute path="/user/:id?" component={User} />
          <PrivateRoute path="/users/export" exact component={ExportUsers} />
          {/* <PrivateRoute path="/draw" exact component={Draw} />
          <PrivateRoute path="/users" exact component={Users} />
          <PrivateRoute path="/user/:id?" component={User} />
          <PrivateRoute path="/users/export" exact component={ExportUsers} />
          <PrivateRoute path="/prizes" exact component={PrizesList} />
          <PrivateRoute path="/prize/:id?" component={Prize} /> */}
          <Route component={PageNotFound} />
        </Switch>
      </div>
    </Router>
  </ReduxProvider>
);

export default App;
