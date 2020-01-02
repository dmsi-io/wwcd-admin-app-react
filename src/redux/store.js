import { createStore, applyMiddleware } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from './modules/reducer';
import storage from '../utils/storage';
import storageMiddleware from './storageMiddleware';

export function getPreloadedStorage() {
  return storage.get('stateTree') ? JSON.parse(storage.get('stateTree')) : {};
}

// Create redux store and refresh from window.localstorage if anything was previously set
export default createStore(
  enableBatching(rootReducer),
  getPreloadedStorage(),
  composeWithDevTools(applyMiddleware(storageMiddleware(storage))),
);
