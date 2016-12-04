import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Login from './components/login';
import Home from './components/home';

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import todoApp from './reducers';

let store = createStore(todoApp);

ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
    </Router>
  </Provider>
), document.getElementById('app'));