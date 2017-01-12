import * as React from 'react';
import { store } from '../../store';
import { authenticate } from '../../reducers/userActions';

export class Dashboard extends React.Component<any, undefined> {
  logout() {
    window['FB'].logout();
    store.dispatch(authenticate({}));
  }

  render() {
    return (
      <div>
        <button type="button" onClick={ this.logout.bind(this) }>Logout</button>
        <pre style={ {whiteSpace: 'pre-wrap'} }>{JSON.stringify(this.props.user, null, 2)}</pre>
      </div>
    );
  }
}
