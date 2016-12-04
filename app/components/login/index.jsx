import React from 'react';
import { Form, Icon, Input, Button } from 'antd';
import './login.scss';

const FormItem = Form.Item;

class Login extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        window.location.href = '/';
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="login-wrap">
        <Form onSubmit={this.handleSubmit} className="login-form">
          <h2 className="login-title-wrap">
            <span className="login-title">登录</span>
          </h2>
          <FormItem>
            {getFieldDecorator("userName", {
              rules: [{ required: true, message: '请输入用户名' }],
            })(
              <Input addonBefore={<Icon type="user" />} placeholder="请输入用户名" />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input addonBefore={<Icon type="lock" />} type="password" placeholder="请输入密码" />
            )}
          </FormItem>
          <FormItem>
              <Button type="primary" htmlType="submit" className="login-btn">登&emsp;录</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

export default Form.create()(Login);