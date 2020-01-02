import { combineReducers } from 'redux';

import userInfo from './userInfo';
import { USER_LOGOUT } from './userLogout';

const rootReducer = combineReducers({
  userInfo,
});

export default (state, action) => {
  if (action.type === USER_LOGOUT) {
    return rootReducer(undefined, action);
  }
  return rootReducer(state, action);
};
