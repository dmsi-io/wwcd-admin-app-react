import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Alerts, TextInput, Loading } from '@dmsi/wedgekit';

import logoImg from '../../resources/logo.png';

import api from '../../utils/api';
import storage from '../../utils/storage';

import s from './login.module.scss';

class LoginPage extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    setUserInfo: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      errors: [],
      loading: false,
      signedIn: false,
    };
  }

  onInputChange = (value, name) => {
    this.setState({
      [name]: value,
    });
  };

  onFormSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const data = {
      attributes: {
        username: this.state.username.toLowerCase(),
        password: this.state.password,
      },
    };

    const [err, tokenData] = await api.post('/authenticateadmin', JSON.stringify({ data }), false);

    if (err) {
      this.setState({
        errors: err.errors,
        loading: false,
      });
    } else {
      storage.set('token', tokenData.data.attributes.token);
      storage.set('userID', tokenData.data.id);

      this.props.setUserInfo({
        id: tokenData.data.id,
        username: this.state.username.toLowerCase(),
      });

      this.setState({
        loading: false,
        signedIn: true,
      });
    }
  };

  onApiErrorClose = () => {
    this.setState({ errors: [] });
  };

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (this.state.signedIn) {
      return <Redirect to={from} />;
    }

    return (
      <div className={s.layout}>
        <form id="loginForm" className={s.authContainer} onSubmit={this.onFormSubmit}>
          <div className={s.imgContainer}>
            <img src={logoImg} alt="Logo" />
          </div>
          {this.state.errors.length > 0 ? (
            <Alerts
              alerts={this.state.errors.map((error) => error.detail)}
              onClose={this.onApiErrorClose}
            />
          ) : null}
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
          <button type="submit" className="btn btn--primary pull-xs-right">
            Log In
          </button>
        </form>
      </div>
    );
  }
}

export default LoginPage;
