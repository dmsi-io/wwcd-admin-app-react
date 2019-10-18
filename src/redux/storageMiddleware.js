import { USER_LOGOUT } from './modules/userLogout';

export default (storage) => ({ getState }) => (next) => (action) => {
  const result = next(action);
  const localStateTree = Object.assign({}, getState());

  storage.set('stateTree', JSON.stringify(localStateTree));

  if (action.type === USER_LOGOUT) {
    storage.remove('stateTree');
    storage.remove('userID');
    storage.remove('token');
    storage.remove('lastChecked');
  }

  return result;
};
