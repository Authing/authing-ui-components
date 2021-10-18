import React from 'react'
import { Button, Form, Input } from 'antd'

import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from '../../Guard/authClient'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { getUserRegisterParams } from 'src/utils'

// core 代码只完成核心功能，东西尽可能少
interface LoginWithPasswordProps {
  publicKey: string
  autoRegister?: boolean
  onLogin: any
}

export const LoginWithPassword = (props: LoginWithPasswordProps) => {
  let { post } = useGuardHttp()
  let client = useAuthClient()
  console.log('client', client)
  const captchaUrl = `xxx`
  // const captchaUrl = `${realHost}/api/v2/security/captcha`
  // const getCaptchaUrl = () => `${captchaUrl}?r=${+new Date()}`

  const encrypt = client.options.encryptFunction
  const onFinish = async (values: any) => {
    let url = '/api/v2/login/account'
    let body = {
      account: values.account,
      password: await encrypt!(values.password, props.publicKey),
      // captchaCode,
      customData: getUserRegisterParams(),
      autoRegister: props.autoRegister,
    }
    const { code, message, data } = await post(url, body)
    // console.log('data', message)
    props.onLogin(code, data, message)
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

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
            className="authing-g2-input"
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
            className="authing-g2-input"
            size="large"
            placeholder={'输入登录密码'}
            prefix={<LockOutlined style={{ color: '#ddd' }} />}
          />
        </Form.Item>
        <img src={captchaUrl} alt="" />
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
