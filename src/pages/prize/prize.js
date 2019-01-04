import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import uuid from 'uuid/v1';

import { Loading, TextInput, Button, NewSelect, Option } from '@dmsi/wedgekit';

import Firebase from '../../fire';
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
    };

    this.imageInputRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    const promises = [];

    const db = Firebase.firestore();

    if (id) {
      const prizesRef = db.collection('prizes');
      promises.push(prizesRef.doc(id).get().then((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data();
          this.setState({
            title: data.title,
            description: data.description,
            image: data.image,
            origImage: data.image,
            selectedCategory: data.category,
          });
        } else {
          this.setState({ notFound: true });
        }
      }, (err) => {
        // eslint-disable-next-line no-console
        console.log('Error getting prize', err);
        this.setState({ notFound: true });
      }));
    }

    const categoriesRef = db.collection('categories');
    promises.push(categoriesRef.get().then((snapshot) => {
      const categories = snapshot.docs.map((category) => ({
        display: category.data().name,
        id: category.data().name,
      }));
      this.setState({ categories: [{ id: '', display: 'Select a Category' }, ...categories] });
    }, (err) => {
      // eslint-disable-next-line no-console
      console.log('Error getting categories', err);
      this.setState({ notFound: true });
    }));

    Promise.all(promises).then(
      () => this.setState({ loading: false }),
      () => this.setState({ loading: false }),
    );
  }

  onInputChange = (value, name) => {
    this.setState({
      [name]: value,
    });
  }

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
  }

  onFormSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    let category = '';
    if (this.state.selectedCategory !== '') {
      const categoryObj = this.state.categories.find((cat) => cat.id === this.state.selectedCategory);

      if (categoryObj) {
        category = categoryObj.id;
      }
    }

    const { id } = this.props.match.params;

    const db = Firebase.firestore();
    const prizesRef = db.collection('prizes');

    const storage = Firebase.storage();

    if (this.state.origImage !== '' && this.state.image !== this.state.origImage) {
      const imageRef = storage.refFromURL(this.state.origImage);

      try {
        await imageRef.delete();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error deleting old photo', err);
      }
    }

    let { image } = this.state;

    if (this.imageFile) {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`photos/${uuid()}`);

      try {
        await fileRef.put(this.imageFile);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error uploading new photo', err);
      }

      try {
        image = await fileRef.getDownloadURL();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error getting new download URL', err);
      }
    }

    const data = {
      title: this.state.title,
      description: this.state.description,
      image,
      category,
    };

    if (id) { // update existing record
      await prizesRef.doc(id).set(data);
    } else { // new record
      await prizesRef.add(data);
    }

    this.setState({ complete: true });
  }

  onDeletePrize = async () => {
    const { id } = this.props.match.params;

    if (id) {
      const db = Firebase.firestore();
      const prizesRef = db.collection('prizes');
      const prizeDocRef = prizesRef.doc(id);
      try {
        const ticketsRef = db.collection('tickets');
        const ticketsSnapshot = await ticketsRef.where('prize', '==', id).get();

        if (!ticketsSnapshot.empty) {
          const batch = db.batch();
          ticketsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          try {
            await batch.commit();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log('Error deleting tickets', err);
          }
        }

        await prizeDocRef.delete();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('Error deleting prize', err);
      }
      this.setState({ complete: true });
    }
  }

  render() {
    return (
      <div className={s.prizeContainer}>
        <Header />
        {this.state.loading && <Loading />}
        {this.state.notFound || this.state.complete ?
          <Redirect to="/prizes" />
          :
          <form id="prizeForm" className={s.contentContainer} onSubmit={this.onFormSubmit}>
            <h1>Prize</h1>
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
              {this.state.image !== undefined && this.state.image !== '' &&
                <img
                  alt="Prize"
                  src={this.state.image}
                />
              }
              <br />
              <input ref={this.imageInputRef} name="image" type="file" accept="image/*" onChange={this.onFileChange} />
            </fieldset>
            <div className={s.buttonHolder}>
              <button type="submit" className={s.saveButton}>Save</button>
              {this.props.match.params.id &&
                <Button onClick={this.onDeletePrize} className={s.deleteButton}>
                  Delete Prize
                </Button>
              }
            </div>
          </form>
        }
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
