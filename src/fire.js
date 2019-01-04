import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyDDe8P0yyyOsI-pa4AKPoS8SZMpqKbtOEw',
  authDomain: 'wwcd-f0480.firebaseapp.com',
  databaseURL: 'https://wwcd-f0480.firebaseio.com',
  projectId: 'wwcd-f0480',
  storageBucket: 'wwcd-f0480.appspot.com',
  messagingSenderId: '430206835988',
};
const fire = firebase.initializeApp(config);
const firestore = firebase.firestore();
const settings = { timestampsInSnapshots: true };
firestore.settings(settings);
export default fire;
