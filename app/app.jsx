import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import { Router, Route, browserHistory } from 'react-router';
import Rx from 'rxjs/Rx';
import SearchBar from './components/search-bar';
import './style/home.scss';

class App extends Component {

  componentDidMount() {
    let map = new AMap.Map('map',{
      zoom: 11
    });

  }

  render() {
    return (
      <div className="wrap">
        <div id="map" className="map"></div>
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