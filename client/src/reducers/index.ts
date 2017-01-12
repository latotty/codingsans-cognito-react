import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { user } from './userReducer';

export const rootReducer = combineReducers({
  user,
  routing: routerReducer,
});
