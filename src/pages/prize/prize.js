import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import { Loading, Input, Button, Select, Option, Alert, Card } from '@wedgekit/core';
import Form, { Field } from '@wedgekit/form';
import Layout from '@wedgekit/layout';
import { Label, Title } from '@wedgekit/primitives';

import Api from '../../utils/api';
import Header from '../../components/header/header';

import s from './prize.module.scss';

const ImageContainer = styled.div`
  width: 100%;
  
  img {
    width: 100%;
  }
`;

class PrizePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      complete: false,
      description: '',
      image: '',
      loading: props.match.params.id !== undefined,
      notFound: false,
      origImage: '',
      selectedCategory: '',
      title: '',
      errors: [],
    };

    this.imageInputRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    const promises = [];

    if (id) {
      promises.push(
        Api.get(`/prizes/${id}`).then(([err, data]) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.log('Error getting prize', err);
            this.setState({ notFound: true });
            return;
          }

          if (data && data.data && data.data.attributes) {
            const a = data.data.attributes;
            this.setState({
              title: a.title,
              description: a.description,
              image: a.image,
              origImage: a.image,
              selectedCategory: a.categoryId,
            });
          } else {
            this.setState({ notFound: true });
          }
        }),
      );
    }

    promises.push(
      Api.get('/categories').then(([err, data]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error getting categories', err);
          this.setState({ notFound: true });
          return;
        }

        if (data && data.data) {
          const categories = data.data.map((category) => ({
            display: category.attributes.name,
            id: category.attributes.id,
          }));
          this.setState({ categories: [{ id: '', display: 'Select a Category' }, ...categories] });
        }
      }),
    );

    Promise.all(promises).then(
      () => this.setState({ loading: false }),
      () => this.setState({ loading: false }),
    );
  }

  onInputChange = (value, name) => {
    this.setState({
      [name]: value,
    });
  };

  onFileChange = (e) => {
    e.preventDefault();

    const file = this.imageInputRef.current.files[0];
    this.imageFile = file;
    if (file) {
      const reader = new global.FileReader();
      reader.onload = (ev) => this.setState({ image: ev.target.result });
      reader.readAsDataURL(file);
    } else {
      this.setState({ image: '' });
    }
  };

  onFormSubmit = async ({ title, description, category }) => {

    this.setState({ loading: true });

    if (!category && category !== 0) {
      this.setState({ errors: ['A category must be selected'], loading: false });
      return;
    }

    if (!title) {
      this.setState({ errors: ['The prize must have a title'], loading: false });
      return;
    }

    const { id } = this.props.match.params;

    const formData = new FormData();

    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', category);

    if (this.state.image !== this.state.origImage) {
      if (this.state.image) {
        formData.append('image', this.imageFile);
      } else if (this.state.origImage) {
        formData.append('removeImage', true);
      }
    }

    let err;

    if (id) {
      // update existing record
      [err] = await Api.putFormData(`/prizes/${id}`, formData, true);
    } else {
      // new record
      [err] = await Api.postFormData(`/prizes`, formData, true);
    }

    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error creating/updating prize', err);
      return;
    }

    this.setState({ complete: true });
  };

  onDeletePrize = async () => {
    const { id } = this.props.match.params;

    if (id) {
      Api.delete(`/prizes/${id}`, true).then(([err]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error deleting prize', err);
          return;
        }

        this.setState({ complete: true });
      });
    }
  };

  onClearUsed = async () => {
    const { id } = this.props.match.params;
    if (id) {
      Api.post(
        '/tickets/clearused',
        JSON.stringify({ data: { attributes: { prizeId: id } } }),
        true,
      ).then(([err]) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error clearing used on tickets of prize', err);
          return;
        }

        this.setState({ errors: ['Tickets cleared of being used.'] });
      });
    }
  };

  onApiErrorClose = () => {
    this.setState({ errors: [] });
  };

  render() {
    return (
      <div>
        <Header />
        {this.state.loading && <Loading />}
        {this.state.notFound || this.state.complete ? (
          <Redirect to="/prizes" />
        ) : (
          <Card className={s.contentContainer}>
            <Form onSubmit={this.onFormSubmit}>
              {({ formProps }) => (
                <form {...formProps}>
                  <Title level={1} elementLevel={1}>Prize</Title>
                  {
                    this.state.errors.map((error) => (
                      <Alert key={error.detail} detail={error.detail} onClose={this.onApiErrorClose}>
                        {error.title}
                      </Alert>
                    ))
                  }
                  <Layout.Grid columns={[1]} areas={[]} multiplier={3}>
                    <Field
                      label="Title"
                      name="title"
                      defaultValue={this.state.title}
                    >
                      {({ fieldProps }) => (
                        <Input
                          {...fieldProps}
                          fullWidth
                          placeholder="Title"
                          maxLength={100}
                        />
                      )}
                    </Field>
                    <Field
                      label="Category"
                      name="category"
                      defaultValue={this.state.selectedCategory}
                    >
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          placeholder="Select a Category"
                        >
                          {this.state.categories.map((category) => (
                            <Option key={category.id} value={category.id}>
                              {category.display}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Field>
                    <Field
                      label="Description"
                      name="description"
                      defaultValue={this.state.description}
                    >
                      {({ fieldProps }) => (
                        <Input
                          {...fieldProps}
                          fullWidth
                          rows={5}
                          placeholder="Description"
                          maxLength={1000}
                          elementType="textarea"
                        />
                      )}
                    </Field>
                    <Layout.Grid columns={[1]} areas={[]} multiplier={2}>
                      <Label htmlFor="image">Image</Label>
                      {this.state.image != null && this.state.image !== '' && (
                        <ImageContainer>
                          <img alt="Prize" src={this.state.image} />
                        </ImageContainer>
                      )}
                      <input
                        ref={this.imageInputRef}
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={this.onFileChange}
                      />
                    </Layout.Grid>
                    <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} multiplier={2} justify="space-between">
                      <Button domain="primary" type="submit">
                        Save
                      </Button>
                      <Layout.Grid columns={['repeat(2, minmax(0, max-content))']} areas={[]} multiplier={2} justify="space-between">
                        {this.props.match.params.id && (
                          <Button domain="danger" onClick={this.onDeletePrize}>
                            Delete Prize
                          </Button>
                        )}
                        {this.props.match.params.id && (
                          <Button domain="warning" onClick={this.onClearUsed}>
                            Clear Used For Prize Tickets
                          </Button>
                        )}
                      </Layout.Grid>
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

PrizePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};

export default PrizePage;
