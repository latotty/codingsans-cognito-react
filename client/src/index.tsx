import * as React from 'react';
import { render } from 'react-dom';

import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import { Provider } from 'react-redux';

import { Container } from './components/container/container';
import { Dashboard } from './components/dashboard/dashboard';

import { NotFound } from './components/notFound/notFound';

import { store, history } from './store';

const router = (
  <Provider store={store}>
  <Router history={history}>
    <Route path="/" component={ Container }>
      <IndexRoute component={ Dashboard }></IndexRoute>
      <Route path="*" component={ NotFound }></Route>
    </Route>
  </Router>
  </Provider>
);

render(router, document.getElementById('cognito-react-app'));
