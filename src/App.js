import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import '@dmsi/wedgekit/dist/wedgekit.css';

import Login from './pages/login/login';
import PageNotFound from './pages/404/404';
import Home from './pages/home/home';

import Firebase from './fire';

import './App.scss';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
        (Firebase.auth().currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        ))
      }
  />
);

const App = () => (
  <Router>
    <div>
      <Switch>
        <Route path="/login" exact component={Login} />
        <PrivateRoute path="/" exact component={Home} />
        <Route component={PageNotFound} />
      </Switch>
    </div>
  </Router>
);

export default App;
