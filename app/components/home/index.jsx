import Rx from 'rxjs/Rx';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './home.scss';

export default class Home extends Component {

  componentDidMount() {
    // const searchKey = document.getElementById('searchKey');
    // const searchBtn = document.getElementById('searchBtn');
    let map = new AMap.Map('map',{
      zoom: 11
    });

    // let searchKey$ = Rx.Observable.fromEvent(searchKey, 'keyup')
    //                               .debounceTime(250)
    //                               .pluck('target', 'value');

    // let searchBtn$ = Rx.Observable.fromEvent(searchBtn, 'click');

    // Rx.Observable
    //   .fromEvent(searchKey, 'keyup')
    //   .debounceTime(250)
    //   .pluck('target', 'value')
    //   .switchMap(value => fetch(`http://restapi.amap.com/v3/place/text?key=539e96e62a32d7818e821d724052cd81&city=宁波&offset=5&s=rsv3&keywords=${value}`))
    //   .subscribe(res => {
    //     if (res.ok) {
    //       res.json().then(data => {
    //         console.log(data)
    //       })
    //     }
    //   });

    // Rx.Observable
    //   .fromEvent(searchBtn, 'click')
    //   .subscribe(value => {
    //     let count = this.state.count;

    //     count++;
    //     this.setState({count: count});
    //   });

    // Rx.Observable.merge(searchKey$, searchBtn$).subscribe(x => console.log(x));

  }

  render() {

    return (
      <div className="wrap">
        <div id="map" className="map"></div>
        <div className="left-panel">

        </div>
      </div>
    )
  }
}
