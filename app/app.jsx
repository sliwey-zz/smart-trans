import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import { Router, Route, browserHistory } from 'react-router';
import Rx from 'rxjs/Rx';
import Map from './components/map';
import SearchBar from './components/search-bar';
import './style/home.scss';

class App extends Component {
  constructor() {
    super();

  }

  render() {
    return (
      <div className="wrap">
        <Map />
        <div className="left-panel">
          <SearchBar />
        </div>
      </div>
    )
  }
}

ReactDOM.render((
  <App />
), document.getElementById('app'));