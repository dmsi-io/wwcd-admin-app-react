import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Alert, Input, Loading, Button, Card } from '@wedgekit/core';
import Form, { Field } from '@wedgekit/form';
import WedgeKitLayout from '@wedgekit/layout';

import logoImg from '../../resources/logo.png';

import api from '../../utils/api';
import storage from '../../utils/storage';

import Layout from './styled/Layout';

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
      errors: [],
      loading: false,
      signedIn: false,
    };
  }

  onFormSubmit = async ({ username, password }) => {

    this.setState({ loading: true });

    const data = {
      attributes: {
        username: username.toLowerCase(),
        password,
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
      <Layout>
        <Card>
          <Form id="loginForm" onSubmit={this.onFormSubmit}>
            {({
              formProps,
              valid,
              dirty,
              submitFailed,
              submitting,
              submitError,
            }) => (
              <form {...formProps}>
                <WedgeKitLayout.Grid areas={[]} columns={[1]} multiplier={2}>
                  <div className={s.imgContainer}>
                    <img src={logoImg} alt="Logo" />
                  </div>
                  {
                    this.state.errors.map((error) => (
                      <Alert
                        key={error.detail}
                        detail={error.detail}
                        onClose={this.onApiErrorClose}
                      >
                        {error.title}
                      </Alert>
                    ))
                  }
                  {this.state.loading && <Loading inline />}
                  <Field
                    label="User Name"
                    name="username"
                    defaultValue=""
                    invalid={submitFailed && submitError}
                  >
                    {({ fieldProps }) => (
                      <Input
                        {...fieldProps}
                        labelHidden
                        id="username"
                        placeholder="Username"
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoFocus={!this.state.username}
                        maxLength={30}
                        fullWidth
                      />
                    )}
                  </Field>
                  <Field
                    label="Password"
                    name="password"
                    defaultValue=""
                    invalid={submitFailed && submitError}
                  >
                    {({ fieldProps }) => (
                      <Input
                        {...fieldProps}
                        labelHidden
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoFocus={this.state.username}
                        type="password"
                        id="password"
                        placeholder="Password"
                        maxLength={30}
                        fullWidth
                      />
                    )}
                  </Field>
                  <WedgeKitLayout.Grid areas={[]} columns={['minmax(0, max-content)']} justify="end">
                    <Button
                      domain="primary"
                      type="submit"
                      disabled={
                        !dirty ||
                        submitting ||
                        !valid
                      }
                    >
                      Log In
                    </Button>
                  </WedgeKitLayout.Grid>
                </WedgeKitLayout.Grid>
              </form>
            )}
          </Form>
        </Card>
      </Layout>
    );
  }
}

export default LoginPage;
