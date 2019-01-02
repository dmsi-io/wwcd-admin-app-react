import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  Alerts,
  TextInput,
  Loading,
} from '@dmsi/wedgekit';

import Firebase from '../../fire';
import logoImg from '../../resources/logo.png';

import s from './login.module.scss';

const INVALID_CREDENTIALS = 'Invalid username and/or password.';

class LoginPage extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      error: {
        status: false,
      },
      loading: false,
      signedIn: false,
    };
  }

  componentDidMount() {
    this.unsubscribeAuthChange = Firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ signedIn: true });
      } else {
        this.setState({ signedIn: false });
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuthChange) {
      this.unsubscribeAuthChange();
    }
  }

  onInputChange = (value, name) => {
    this.setState({
      [name]: value,
    });
  }

  onFormSubmit = (e) => {
    e.preventDefault();

    if (!this.state.username || !this.state.password) {
      this.setState({
        error: {
          status: true,
          message: INVALID_CREDENTIALS,
        },
      });
    } else {
      this.setState({ loading: true });

      Firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).then(() => {
        this.setState({ loading: false });
      }).catch(() => {
        this.setState({
          error: {
            status: true,
            message: INVALID_CREDENTIALS,
          },
          loading: false,
        });
      });
    }
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (this.state.signedIn) {
      return (
        <Redirect to={from} />
      );
    }

    return (
      <div className={s.layout}>
        <form id="loginForm" className={s.authContainer} onSubmit={this.onFormSubmit}>
          <div className={s.imgContainer}>
            <img
              src={logoImg}
              alt="Logo"
            />
          </div>
          {
            this.state.error.status ?
              <Alerts
                alerts={[this.state.error]}
                onClose={() => this.setState({ error: { status: false } })}
              /> : null
          }
          {this.state.loading && <Loading inline />}
          <fieldset className="form-group">
            <TextInput
              autoCapitalize="off"
              autoCorrect="off"
              autoFocus={!this.state.username}
              id="username"
              invalid={!this.state.username && this.state.error && this.state.error.status}
              name="username"
              placeholder="Username"
              maxLength={30}
              nativeClear
              size="large"
              value={this.state.username}
              onChange={this.onInputChange}
            />
          </fieldset>
          <fieldset className="form-group">
            <TextInput
              autoCapitalize="off"
              autoCorrect="off"
              autoFocus={this.state.username}
              type="password"
              id="password"
              invalid={!this.state.password && this.state.error && this.state.error.status}
              name="password"
              placeholder="Password"
              maxLength={30}
              nativeClear
              size="large"
              value={this.state.password}
              onChange={this.onInputChange}
            />
          </fieldset>
          <button type="submit" className="btn btn--primary pull-xs-right">Log In</button>
        </form>
      </div>
    );
  }
}

export default LoginPage;
