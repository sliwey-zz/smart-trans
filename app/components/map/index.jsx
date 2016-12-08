import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Rx from 'rxjs/Rx';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    // this.addMarkers = this.addMarkers.bind(this);
  }

  addMarkers(markerList) {
    markerList.map(marker => {
      new AMap.Marker({
        map: this.map,
        position: [marker.lng, marker.lat]
      })
    })
  }

  componentDidMount() {
    this.map = new AMap.Map('map',{
      zoom: 11
    });

    // this.setState({map: map});

    this.addMarkers([{lng: 121.628692, lat: 29.868562}, {lng: 121.628757, lat: 29.868766}]);
  }

  render() {
    return (
      <div id="map" className="map"></div>
    )
  }
}