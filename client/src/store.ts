import thunkMiddleware from 'redux-thunk';
import * as createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { hashHistory } from 'react-router';

import { rootReducer } from './reducers';

const initialState = {
  user: {},
};

const loggerMiddleware = createLogger();

export const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(thunkMiddleware, loggerMiddleware),
)

export const history = syncHistoryWithStore(hashHistory, store);
