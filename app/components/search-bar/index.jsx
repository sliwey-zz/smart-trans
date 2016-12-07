import React, { Component } from 'react';
import './search-bar.scss';

export default class SerachBar extends Component {

  render() {
    return (
      <div className="serach">
        <div className="search-box">
          <input className="search-input" type="text" placeholder="搜索地点、公交、路线" />
          <button className="search-btn"></button>
        </div>
        <div className="search-result">
          <ul className="sr-list">
            <li className="sr-item">
              <i className="fa fa-camera-retro"></i>
            </li>
          </ul>

        </div>
      </div>
    )
  }
}