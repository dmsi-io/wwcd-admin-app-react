import { connect } from 'react-redux';

import login from './login';
import { setUserInfo } from '../../redux/modules/userInfo';

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (userInfo) => dispatch(setUserInfo(userInfo)),
});

export default connect(undefined, mapDispatchToProps)(login);
