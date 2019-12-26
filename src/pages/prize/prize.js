import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { Loading, TextInput, Button, NewSelect, Option, Alerts } from '@dmsi/wedgekit';

import Api from '../../utils/api';
import Header from '../../components/header/header';

import s from './prize.module.scss';

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

  onFormSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const category = this.state.selectedCategory;

    if (!category && category !== 0) {
      this.setState({ errors: ['A category must be selected'], loading: false });
      return;
    }

    const { title } = this.state;

    if (!title) {
      this.setState({ errors: ['The prize must have a title'], loading: false });
      return;
    }

    const { id } = this.props.match.params;

    const formData = new FormData();

    formData.append('title', this.state.title);
    formData.append('description', this.state.description);
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

  onApiErrorClose = () => {
    this.setState({ errors: [] });
  };

  render() {
    return (
      <div className={s.prizeContainer}>
        <Header />
        {this.state.loading && <Loading />}
        {this.state.notFound || this.state.complete ? (
          <Redirect to="/prizes" />
        ) : (
          <form id="prizeForm" className={s.contentContainer} onSubmit={this.onFormSubmit}>
            <h1>Prize</h1>
            {this.state.errors.length > 0 ? (
              <Alerts alerts={this.state.errors} onClose={this.onApiErrorClose} />
            ) : null}
            <fieldset>
              <label htmlFor="title">Title</label>
              <TextInput
                id="title"
                name="title"
                placeholder="Title"
                maxLength={100}
                nativeClear
                size="large"
                value={this.state.title}
                onChange={this.onInputChange}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="title">Category</label>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div className={s.selectedCategory}>
                  <NewSelect
                    context="default"
                    label="Category"
                    labelHidden
                    onChange={(selectedCategory) => this.setState({ selectedCategory })}
                    value={this.state.selectedCategory}
                    placeholder="Select a Category"
                  >
                    {this.state.categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.display}
                      </Option>
                    ))}
                  </NewSelect>
                </div>
                <div style={{ flex: 1 }} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="description">Description</label>
              <TextInput
                id="description"
                name="description"
                placeholder="Description"
                maxLength={1000}
                nativeClear
                size="large"
                value={this.state.description}
                onChange={this.onInputChange}
                elementType="textarea"
              />
            </fieldset>
            <fieldset>
              <label htmlFor="image">Image</label>
              <br />
              {this.state.image != null && this.state.image !== '' && (
                <img alt="Prize" src={this.state.image} />
              )}
              <br />
              <input
                ref={this.imageInputRef}
                name="image"
                type="file"
                accept="image/*"
                onChange={this.onFileChange}
              />
            </fieldset>
            <div className={s.buttonHolder}>
              <button type="submit" className={s.saveButton}>
                Save
              </button>
              {this.props.match.params.id && (
                <Button onClick={this.onDeletePrize} className={s.deleteButton}>
                  Delete Prize
                </Button>
              )}
            </div>
          </form>
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
