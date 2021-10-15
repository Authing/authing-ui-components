import React from 'react'
import { Button, Form, Input } from 'antd'

import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

// code 代码只完成核心功能，东西尽可能少
interface LoginWithPasswordProps {
  publicKey: string
  onLogin: any
}

export const LoginWithPassword = (props: LoginWithPasswordProps) => {
  let { post } = useGuardHttp()
  let client = useAuthClient()
  const encrypt = client.options.encryptFunction
  const onFinish = async (values: any) => {
    let url = '/api/v2/login/account'
    let body = {
      account: values.account,
      password: await encrypt!(values.password, props.publicKey),
      // captchaCode,
      // customData: getUserRegisterParams(),
      // autoRegister: autoRegister,
    }
    const { code, message, data } = await post(url, body)
    // const callback = props.__codePaser?.(code)
    // callback(data)
    props.onLogin(code, message, data)
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  // return <div className="authing-g2-login-password"></div>

  return (
    <div className="authing-g2-login-password">
      <Form
        name="passworLogin"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="account"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input
            autoComplete="email,username,tel"
            size="large"
            placeholder={'请输入用户名 / 手机号 / 邮箱'}
            prefix={<UserOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '密码不能为空' }]}
        >
          <Input.Password
            size="large"
            placeholder={'输入登录密码'}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="authing-g2-login-button password"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
