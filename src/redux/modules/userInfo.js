// Actions
export const SET_USER_INFO = 'admin/SET_USER_INFO';

// Action Creators
export const setUserInfo = ({ id, username }) => ({
  type: SET_USER_INFO,
  id,
  username,
});

// State
const initialState = {
  id: 0,
  username: '',
};

// Reducer
const userInfo = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      console.log(action);
      return {
        ...state,
        id: action.id,
        username: action.username,
      };
    default:
      return state;
  }
};

export default userInfo;
