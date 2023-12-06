import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { Loading, Input, Button, Card } from '@wedgekit/core';
import Form, { Field } from '@wedgekit/form';
import Layout from '@wedgekit/layout';
import { Title } from '@wedgekit/primitives';

import Api from '../../utils/api';
import Header from '../../components/header/header';

import s from './user.module.scss';

// Apologies for the obscenities
const swearPreventionRegex = /fuc?k|fag|cunt|n[i1]g|a[s5][s5]|[s5]h[i1]t|b[i1]a?t?ch|c[l1][i1]t|j[i1]zz|[s5]ex|[s5]meg|d[i1]c?k?|pen[i1][s5]|pube|p[i1][s5][s5]|g[o0]d|crap|b[o0]ne|basta|ar[s5]|ana[l1]|anu[s5]|ba[l1][l1]|b[l1][o0]w|b[o0][o0]b|[l1]mf?a[o0]/;

const generatePassword = () => {
  const length = 5;
  const charset = 'qwertyuiopasdfghjkzxcvbnmWERTYUPADFGHJKLZXCVBNM2346789';
  let retVal;
  do {
    retVal = '';
    for (let i = 0; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  } while (swearPreventionRegex.test(retVal));
  return retVal;
};

class UserPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: props.match.params.id !== undefined,
      notFound: false,
      complete: false,
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      tickets: '',
    };

    this.imageInputRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      Api.get(`/users/${id}`, true).then(([err, data]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error getting user', err);
          this.setState({ notFound: true, loading: false });
          return;
        }

        if (data && data.data && data.data.attributes) {
          const a = data.data.attributes;
          this.setState({
            loading: false,
            firstName: a.firstName,
            lastName: a.lastName,
            username: a.username,
            password: a.password,
            tickets: `${a.tickets}`,
            ticketsInvalid: false,
          });
        } else {
          this.setState({ notFound: true, loading: false });
        }
      });
    }
  }

  onFormSubmit = async ({ firstName, lastName, username, password, tickets }) => {
    this.setState({
      loading: true,
      ticketsInvalid: false,
      usernameInvalid: false,
    });

    const { id } = this.props.match.params;

    if (Number.isNaN(Number(this.state.tickets))) {
      this.setState({
        loading: false,
        ticketsInvalid: true,
      });
      return;
    }

    if (!id) {
      const [err, res] = await Api.get('/users', true);
      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error getting users', err);
        this.setState({ loading: false });
        return;
      }
      if (res && res.data) {
        const found = res.data.find(
          ({ attributes }) => attributes.username === username.toLowerCase(),
        );
        if (found) {
          this.setState({
            usernameInvalid: true,
            loading: false,
          });
          return;
        }
      }
    }

    const data = {
      attributes: {
        firstName,
        lastName,
        username: username.toLowerCase(),
        password,
        tickets: Number(tickets),
      },
    };

    let err;

    if (id) {
      // update existing record
      [err] = await Api.put(`/users/${id}`, JSON.stringify({ data }), true);
    } else {
      // new record
      [err] = await Api.post('/users', JSON.stringify({ data }), true);
    }

    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error creating/updating user', err);
      this.setState({ loading: false });
      return;
    }

    this.setState({ complete: true });
  };

  onDeleteUser = async () => {
    const { id } = this.props.match.params;

    if (id) {
      const [err] = await Api.delete(`/users/${id}`, true);

      if (err) {
        // eslint-disable-next-line no-console
        console.log('Error deleting user', err);
        return;
      }
      this.setState({ complete: true });
    }
  };

  onGenerateUsername = async () => {
    if (this.state.firstName.length === 0 && this.state.lastName.length === 0) {
      return '';
    }

    const username = `${this.state.firstName.charAt(0)}${this.state.lastName}`.toLowerCase();

    const [err, res] = await Api.get('/users', true);
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error getting users', err);
      this.setState({ loading: false });
      return '';
    }
    if (res && res.data) {
      const { id } = this.props.match.params;
      const found = res.data.filter(
        ({ attributes }) =>
          attributes.id !== id && attributes.username.startsWith(username.toLowerCase()),
      );
      return `${username}${found.length + 1}`;
    }

    return '';
  };

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        {this.state.notFound || this.state.complete ? (
          <Redirect to="/users" />
        ) : (
          <Card className={s.contentContainer}>
            <Form onSubmit={this.onFormSubmit}>
              {({ formProps }) => (
                <form {...formProps}>
                  <Layout.Grid columns={[1]} areas={[]} multiplier={4}>
                    <Title level={1} elementLevel={1}>
                      User
                    </Title>
                    <Layout.Grid columns={[1]} areas={[]} multiplier={3}>
                      <Field
                        name="firstName"
                        label="First Name"
                        defaultValue={this.state.firstName}
                      >
                        {({ fieldProps }) => (
                          <Input
                            {...fieldProps}
                            fullWidth
                            placeholder="First Name"
                            onChange={(v) => {
                              fieldProps.onChange(v);
                              this.setState({ firstName: v });
                            }}
                            maxLength={100}
                          />
                        )}
                      </Field>
                      <Field name="lastName" label="Last Name" defaultValue={this.state.lastName}>
                        {({ fieldProps }) => (
                          <Input
                            {...fieldProps}
                            fullWidth
                            placeholder="Last Name"
                            onChange={(v) => {
                              fieldProps.onChange(v);
                              this.setState({ lastName: v });
                            }}
                            maxLength={100}
                          />
                        )}
                      </Field>
                      <Field label="Username" name="username" defaultValue={this.state.username}>
                        {({ fieldProps }) => (
                          <Layout.Grid
                            columns={[1, 'minmax(0, max-content)']}
                            multiplier={2}
                            areas={[]}
                            align="end"
                          >
                            <Input
                              {...fieldProps}
                              placeholder="Username"
                              maxLength={50}
                              fullWidth
                              error={this.state.usernameInvalid ? 'Username already taken' : ''}
                            />
                            <Button
                              onClick={() =>
                                this.onGenerateUsername().then((res) => fieldProps.onChange(res))
                              }
                            >
                              Generate Username
                            </Button>
                          </Layout.Grid>
                        )}
                      </Field>
                      <Field name="password" label="Password" defaultValue={this.state.password}>
                        {({ fieldProps }) => (
                          <Layout.Grid
                            columns={[1, 'minmax(0, max-content)']}
                            multiplier={2}
                            areas={[]}
                            align="end"
                          >
                            <Input
                              {...fieldProps}
                              placeholder="Password"
                              maxLength={50}
                              fullWidth
                            />
                            <Button
                              onClick={() => fieldProps.onChange(generatePassword())}
                              domain="primary"
                            >
                              Generate Password
                            </Button>
                          </Layout.Grid>
                        )}
                      </Field>
                      <Field
                        label="Tickets"
                        name="tickets"
                        defaultValue={this.state.tickets}
                        fullWidth
                      >
                        {({ fieldProps }) => (
                          <Input
                            {...fieldProps}
                            elementType="number"
                            error={this.state.ticketsInvalid ? 'Tickets must be a number' : ''}
                            fullWidth
                            maxLength={10}
                            placeholder="Ticket Count"
                          />
                        )}
                      </Field>
                    </Layout.Grid>
                    <Layout.Grid
                      columns={['repeat(2, minmax(0, max-content))']}
                      justify="space-between"
                      areas={[]}
                    >
                      {this.props.match.params.id && (
                        <Button domain="danger" onClick={this.onDeleteUser}>
                          Delete User
                        </Button>
                      )}
                      <Button domain="primary" type="submit">
                        Save
                      </Button>
                    </Layout.Grid>
                  </Layout.Grid>
                </form>
              )}
            </Form>
          </Card>
        )}
      </div>
    );
  }
}

UserPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

export default UserPage;
