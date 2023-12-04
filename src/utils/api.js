import storage from './storage';
import { USER_LOGOUT } from '../redux/modules/userLogout';
import store from '../redux/store';
import history from './history';

const getToken = () => {
  const token = storage.get('token');
  return `Bearer ${token}`;
};

const BASE_URL = 'https://wwcdapi-lre7slnnqq-uc.a.run.app';

const makeRequest = (method, route, authNeeded, headers = {}, body = undefined) => {
  const newHeaders = {
    authorization: authNeeded ? getToken() : undefined,
    ...headers,
  };
  return fetch(`${BASE_URL}/v1${route}`, {
    headers: newHeaders,
    method,
    body,
  })
    .then((data) => data.json())
    .then((data) => {
      if (data.errors) {
        if (data.errors[0].code === 'UserExpiredError') {
          store.dispatch({ type: USER_LOGOUT });
          history.push('/');
        }

        return [data];
      }

      return [undefined, data];
    });
};

export default {
  get: (route, authNeeded) => {
    return makeRequest('GET', route, authNeeded);
  },
  post: (route, body, authNeeded) => {
    return makeRequest('POST', route, authNeeded, { 'content-type': 'application/json' }, body);
  },
  put: (route, body, authNeeded) => {
    return makeRequest('PUT', route, authNeeded, { 'content-type': 'application/json' }, body);
  },
  postFormData: (route, formData, authNeeded) => {
    return makeRequest('POST', route, authNeeded, {}, formData);
  },
  putFormData: (route, formData, authNeeded) => {
    return makeRequest('PUT', route, authNeeded, {}, formData);
  },
  delete: (route, authNeeded) => {
    return makeRequest('DELETE', route, authNeeded);
  },
};
