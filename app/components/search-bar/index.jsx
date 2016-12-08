import Rx from 'rxjs/Rx';
import React, { Component } from 'react';
import './search-bar.scss';

export default class SerachBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: '',
      autoCompleteList: []
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    let index = e.target.getAttribute('data-index');
    let item = this.state.autoCompleteList[index];

    console.log(this.state)
    this.search(item.type, item.value);

  }

  search(type, value) {
    //http://restapi.amap.com/v3/bus/linename?s=rsv3&extensions=all&key=fbd79c02b1207d950a9d040483ef40e5&pageIndex=1&city=%E5%AE%81%E6%B3%A2&offset=1&keywords=14&callback=jsonp_209191_

  }

  componentDidMount() {
    const map = document.getElementById('map');
    const searchKey = document.getElementById('searchKey');
    const searchBtn = document.getElementById('searchBtn');

    // let searchKey$ = Rx.Observable.fromEvent(searchKey, 'keyup')
    //                               .debounceTime(250)
    //                               .pluck('target', 'value');

    // let searchBtn$ = Rx.Observable.fromEvent(searchBtn, 'click');
    console.log("1",this.props)
    this.setState({map: this.props.map});
    Rx.Observable
      .fromEvent(searchKey, 'keyup')
      .debounceTime(250)
      .pluck('target', 'value')
      // .switchMap(value => fetch(`http://restapi.amap.com/v3/place/text?key=fbd79c02b1207d950a9d040483ef40e5&city=宁波&offset=10&s=rsv3&keywords=${value}`))
      .subscribe(res => {
        // if (res.ok) {
        //   res.json().then(data => {
        //     console.log(data)
        //   })
        // }

        if (!!res) {
          this.setState({
            autoCompleteList: [
              {
                type: 'bus',
                value: '12路',
                subValue: '浙江省宁波市'
              },
              {
                type: 'poi',
                value: '创新128',
                subValue: '浙江省宁波市'
              }
            ]
          });
        } else {
          this.setState({
            autoCompleteList: []
          })
        }
console.log(this.state);
      });

    Rx.Observable
      .fromEvent(searchBtn, 'click')
      .subscribe(value => {
        // let count = this.state.count;

        // count++;
        // this.setState({count: count});
      });

    Rx.Observable
      .fromEvent(map, 'click')
      .subscribe(value => {
        this.setState({
          autoCompleteList: []
        })
      });
  }

  render() {


    return (
      <div className="serach">
        <div className="search-box">
          <input id="searchKey" className="search-input" type="text" placeholder="搜索地点、公交、路线" />
          <button id="searchBtn" className="search-btn"><i className="fa fa-search"></i></button>
        </div>
        <div className="search-result">
          <ListItem list={this.state.autoCompleteList} handleClick={this.handleClick} />
        </div>
      </div>
    )
  }
}

function ListItem(props) {

  const listItems = props.list.map((item, index) =>
    <li className="sr-item" key={index} onClick={props.handleClick} data-index={index}>
      <span className="sr-icon"><i className={"fa fa-" + getIconName(item.type)}></i></span>
      <span className="sr-title">{item.value}</span>
      <span className="sr-sub-title">{item.subValue}</span>
    </li>
  );

  return <ul className="sr-list">{listItems}</ul>
}

function getIconName(type) {
  let name = '';

  switch (type) {
    case 'bus':
      name = 'bus';
      break;
    case 'poi':
      name = 'map-marker';
      break;
    default:
      name = 'bus';
  }

  return name;
}












