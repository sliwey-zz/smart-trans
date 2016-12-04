import React from 'react';
import { Menu, Icon } from 'antd';
import './asider.scss';

const SubMenu = Menu.SubMenu;
const Item = Menu.Item;

export default class Asider extends React.Component {
  constructor() {
    super();
    this.state = {
      current: '1',
      openKeys: []
    };

    this.handleClick = this.handleClick.bind(this);
    this.onOpenChange = this.onOpenChange.bind(this);
    this.getAncestorKeys = this.getAncestorKeys.bind(this);
  }

  handleClick(e) {
    console.log('Clicked: ', e);
    this.setState({ current: e.key });
  }

  onOpenChange(openKeys) {
    const state = this.state;
    const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
    const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

    let nextOpenKeys = [];

    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }

    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }

    this.setState({ openKeys: nextOpenKeys });
  }

  getAncestorKeys(key) {
    const map = {
      sub3: ['sub2'],
    };

    return map[key] || [];
  }

  render() {
    return (
      <aside className="asider">
        <Menu
            mode="inline"
            openKeys={this.state.openKeys}
            selectedKeys={[this.state.current]}
            style={{width: 240, marginRight: '-1px'}}
            onOpenChange={this.onOpenChange}
            onClick={this.handleClick}
        >
          <SubMenu key="sub1" title={<span><Icon type="mail" /><span>Navigation One</span></span>}>
            <Item key="1">Option 1</Item>
            <Item key="2">Option 2</Item>
            <Item key="3">Option 3</Item>
            <Item key="4">Option 4</Item>
          </SubMenu>
          <SubMenu key="sub2" title={<span><Icon type="appstore" /><span>Navigation Two</span></span>}>
            <Item key="5">Option 5</Item>
            <Item key="6">Option 6</Item>
            <SubMenu key="sub3" title="Submenu">
              <Item key="7">Option 7</Item>
              <Item key="8">Option 8</Item>
            </SubMenu>
          </SubMenu>
          <SubMenu key="sub4" title={<span><Icon type="setting" /><span>Navigation Three</span></span>}>
            <Item key="9">Option 9</Item>
            <Item key="10">Option 10</Item>
            <Item key="11">Option 11</Item>
            <Item key="12">Option 12</Item>
          </SubMenu>
        </Menu>
      </aside>
    )
  }
}