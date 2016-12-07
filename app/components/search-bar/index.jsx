import Rx from 'rxjs/Rx';
import React, { Component } from 'react';
import './search-bar.scss';

export default class SerachBar extends Component {
  constructor() {
    super();
    this.state = {
      autoCompleteList: []
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    console.log(e)
  }

  componentDidMount() {
    const map = document.getElementById('map');
    const searchKey = document.getElementById('searchKey');
    const searchBtn = document.getElementById('searchBtn');

    // let searchKey$ = Rx.Observable.fromEvent(searchKey, 'keyup')
    //                               .debounceTime(250)
    //                               .pluck('target', 'value');

    // let searchBtn$ = Rx.Observable.fromEvent(searchBtn, 'click');

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
                id: 0,
                type: 'bus',
                value: '12路',
                subValue: '浙江省宁波市'
              },
              {
                id: 1,
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

  const listItems = props.list.map(item =>
    <li className="sr-item" key={item.id} onClick={props.handleClick}>
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












