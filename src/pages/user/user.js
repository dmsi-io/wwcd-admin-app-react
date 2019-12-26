import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { Loading, TextInput, Button } from '@dmsi/wedgekit';

import Api from '../../utils/api';
import Header from '../../components/header/header';

import s from './user.module.scss';

const generatePassword = () => {
  const length = 5;
  const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
  let retVal = '';
  for (let i = 0; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * charset.length));
  }
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

  onInputChange = (value, name) => {
    this.setState({
      [name]: value,
    });
  };

  onFormSubmit = async (e) => {
    e.preventDefault();

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
          ({ attributes }) => attributes.username === this.state.username.toLowerCase(),
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
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        username: this.state.username.toLowerCase(),
        password: this.state.password,
        tickets: Number(this.state.tickets),
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

  onGenerateUsername = () => {
    if (this.state.firstName.length > 0 && this.state.lastName.length > 0) {
      this.setState({
        username: `${this.state.firstName.slice(0, 1)}${this.state.lastName}`.toLowerCase(),
      });
    }
  };

  render() {
    return (
      <div className={s.userContainer}>
        <Header />
        {this.state.loading && <Loading />}
        {this.state.notFound || this.state.complete ? (
          <Redirect to="/users" />
        ) : (
          <form id="userForm" className={s.contentContainer} onSubmit={this.onFormSubmit}>
            <h1>User</h1>
            <fieldset>
              <label htmlFor="firstName">First Name</label>
              <TextInput
                id="firstName"
                name="firstName"
                placeholder="First Name"
                maxLength={100}
                nativeClear
                size="large"
                value={this.state.firstName}
                onChange={this.onInputChange}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="lastName">Last Name</label>
              <TextInput
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                maxLength={100}
                nativeClear
                size="large"
                value={this.state.lastName}
                onChange={this.onInputChange}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="username">Username</label>
              <TextInput
                id="username"
                name="username"
                placeholder="Username"
                maxLength={50}
                nativeClear
                size="large"
                value={this.state.username}
                onChange={this.onInputChange}
                error={this.state.usernameInvalid ? 'Username already taken' : ''}
              />
              <Button onClick={this.onGenerateUsername} style={{ marginTop: '15px' }}>
                Generate Username
              </Button>
            </fieldset>
            <fieldset>
              <label htmlFor="password">Password</label>
              <TextInput
                id="password"
                name="password"
                placeholder="Password"
                maxLength={50}
                nativeClear
                size="large"
                value={this.state.password}
                onChange={this.onInputChange}
              />
              <Button
                onClick={() => this.setState({ password: generatePassword() })}
                style={{ marginTop: '15px' }}
              >
                Generate Password
              </Button>
            </fieldset>
            <fieldset>
              <label htmlFor="tickets">Tickets</label>
              <TextInput
                id="tickets"
                name="tickets"
                placeholder="Tickets"
                maxLength={10}
                nativeClear
                size="large"
                value={this.state.tickets}
                onChange={this.onInputChange}
                error={this.state.ticketsInvalid ? 'Tickets must be a nubber' : ''}
              />
            </fieldset>
            <div className={s.buttonHolder}>
              <button type="submit" className={s.saveButton}>
                Save
              </button>
              {this.props.match.params.id && (
                <Button onClick={this.onDeleteUser} className={s.deleteButton}>
                  Delete User
                </Button>
              )}
            </div>
          </form>
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
