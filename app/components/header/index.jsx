import React from 'react';
import './header.scss';


export default class Header extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <header className="header">
        <h1 className="header-title">Official Account Admin</h1>
      </header>
    )
  }
}