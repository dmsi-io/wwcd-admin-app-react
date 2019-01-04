import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import uuid from 'uuid/v1';

import { Loading, TextInput, Button } from '@dmsi/wedgekit';

import Firebase from '../../fire';
import Header from '../../components/header/header';

import s from './prize.module.scss';

class PrizePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: props.match.params.id !== undefined,
      notFound: false,
      title: '',
      description: '',
      image: '',
      origImage: '',
      complete: false,
    };

    this.imageInputRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const db = Firebase.firestore();
      const prizesRef = db.collection('prizes');
      prizesRef.doc(id).get().then((snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data();
          this.setState({
            loading: false,
            title: data.title,
            description: data.description,
            image: data.image,
            origImage: data.image,
          });
        } else {
          this.setState({ notFound: true, loading: false });
        }
      }, (err) => {
        // eslint-disable-next-line no-console
        console.log('Error getting prize', err);
        this.setState({ notFound: true, loading: false });
      });
    }
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

    if (id) { // update existing record
      await prizesRef.doc(id).set({
        title: this.state.title,
        description: this.state.description,
        image,
      });
    } else { // new record
      await prizesRef.add({
        title: this.state.title,
        description: this.state.description,
        image,
      });
    }

    this.setState({ complete: true });
  }

  onDeletePrize = async () => {
    const { id } = this.props.match.params;

    if (id) {
      const db = Firebase.firestore();
      const prizesRef = db.collection('prizes');
      try {
        await prizesRef.doc(id).delete();
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
