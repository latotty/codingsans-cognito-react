import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as userActions from '../../reducers/userActions';
import { App } from '../app/app';

function mapStateToProps(state: any) {
  return {
    user: state.user,
  }
}

function mapDispatchToProps(dispatch: any) {
  return bindActionCreators(userActions as any, dispatch);
}

export const Container = connect(mapStateToProps, mapDispatchToProps)(App);
