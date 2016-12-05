import Rx from 'rxjs/Rx';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
// import ReactDOM from 'react-dom';
import './home.scss';

import { addTodo, completeTodo, toggleTodo, setVisibilityFilter, VisibilityFilters } from '../../actions';
import AddTodo from '../todo/AddTodo'
import TodoList from '../todo/TodoList'
import Footer from '../todo/Footer'

class App extends Component {

  componentDidMount() {
    // const searchKey = document.getElementById('searchKey');
    // const searchBtn = document.getElementById('searchBtn');
    let map = new AMap.Map('map',{
      zoom: 10
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
    // Injected by connect() call:
    const { dispatch, visibleTodos, visibilityFilter } = this.props
    return (
      <div className="wrap">
        <div id="map" className="map"></div>
      </div>
    )
  }
}

// App.propTypes = {
//   visibleTodos: PropTypes.arrayOf(PropTypes.shape({
//     text: PropTypes.string.isRequired,
//     completed: PropTypes.bool.isRequired
//   }).isRequired).isRequired,
//   visibilityFilter: PropTypes.oneOf([
//     'SHOW_ALL',
//     'SHOW_COMPLETED',
//     'SHOW_ACTIVE'
//   ]).isRequired
// }

function selectTodos(todos, filter) {
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return todos
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter(todo => todo.completed)
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter(todo => !todo.completed)
  }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    visibleTodos: selectTodos(state.todos, state.visibilityFilter),
    visibilityFilter: state.visibilityFilter
  }
}

// 包装 component ，注入 dispatch 和 state 到其默认的 connect(select)(App) 中；
export default connect(select)(App)