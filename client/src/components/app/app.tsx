import * as React from 'react';
import FacebookLogin from 'react-facebook-login';
import { hashHistory } from 'react-router';
import 'isomorphic-fetch';

import { store } from '../../store';
import { authenticate } from '../../reducers/userActions';

import { Dashboard } from '../dashboard/dashboard';
import { Chat } from '../chat/chat';

export class App extends React.Component<any, any> {
  responseFacebook(response) {
    if (response.accessToken) {
      store.dispatch(authenticate(response));

      const path = this.props.router.getCurrentLocation();
      if (path) {
        return hashHistory.push(path.pathname);
      }
      return hashHistory.push('/');
    }
  }

  render() {
    if (this.props.user.accessToken) {
      return (
        <div>
          <Dashboard user={this.props.user}></Dashboard>
          <Chat />
        </div>
      );
    } else {
      return (
        <div>
          <FacebookLogin
          appId="1648218652139190"
          autoLoad={true}
          fields="name,email,picture"
          callback={this.responseFacebook.bind(this)} />
          <Chat />
        </div>
      );
    }
  }
}
