import React, { useState } from 'react'
import { Button, Form, Input, Radio } from 'antd'
import { GuardLoginProps } from './props'
import './styles.less'
import { useGuardHttp } from 'src/utils/guradHttp'
import { useAuthClient } from '../Guard/authClient'

interface LoginWithPasswordProps {
  publicKey: string
}
const LoginWithPassword = (props: LoginWithPasswordProps) => {
  let client = useGuardHttp()
  let ac = useAuthClient()
  const encrypt = ac.options.encryptFunction
  const onFinish = async (values: any) => {
    // console.log('Success:', values)

    let url = '/api/v2/login/account'
    let body = {
      account: values.account,
      password: await encrypt!(values.password, props.publicKey),

      // captchaCode,
      // customData: getUserRegisterParams(),
      // autoRegister: autoRegister,
    }
    const { code, message, data } = await client.post(url, body)
    console.log('检查登录结果', code, message, data)
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className="authing-g2-login-password">
      <Form
        name="passworLogin"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        // initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="账号"
          name="account"
          rules={[{ required: true, message: '请填写邮箱或手机号！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请填写密码！' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 3, span: 16 }}>
          <Button type="primary" size="large" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>

      {/* <Form.Item>
        <Input className="authing-g2-input" placeholder={'请输入账号'} />
      </Form.Item>

      <Form.Item>
        <Input className="authing-g2-input" placeholder={'请输入密码'} />
      </Form.Item>

      <div style={{ marginTop: 20 }}>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            onLoginClick()
          }}
        >
          登录
        </Button>
      </div> */}
    </div>
  )
}

const LoginWithPhoneCode = (props: any) => {
  return (
    <div className="authing-g2-login-phonecode">
      <Form
        name="phoneCode"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        // initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="手机号"
          name="phone"
          rules={[{ required: true, message: '请填写手机号！' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="验证码"
          name="code"
          rules={[{ required: true, message: '请填写验证码！' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 3, span: 16 }}>
          <Button type="primary" size="large" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export const GuardLogin: React.FC<GuardLoginProps> = (props) => {
  const [loginWay, setLoginWay] = useState('password')
  // props: appId, initData, config
  // login 组件是最小单位
  let publicKey = props.config?.publicKey!
  // 6种不同的登录方式
  // PhoneCode = 'phone-code',
  // Password = 'password',
  // LDAP = 'ldap',
  // AppQr = 'app-qrcode',
  // WxMinQr = 'wechat-miniprogram-qrcode', // 对应社会化登录的 wechat:miniprogram:qrconnect(小程序扫码登录)
  // AD = 'ad', // 对应企业身份源的 Windows AD 登录
  // WechatMpQrcode = 'wechatmp-qrcode', // 微信扫码关注登录

  // const login = () => {
  // 接口得到 code
  // if (code === 1) {
  //   props.onLogin('登录成功')
  // }
  // }
  return (
    <div className="g2-login-container">
      <Radio.Group
        className="authing-g2-button-group"
        value={loginWay}
        onChange={(e) => setLoginWay(e.target.value)}
      >
        <Radio.Button value="password">密码</Radio.Button>
        <Radio.Button value="phone-code">手机号</Radio.Button>
        <Radio.Button value="ldap">LDAP</Radio.Button>
      </Radio.Group>

      {loginWay === 'password' && <LoginWithPassword publicKey={publicKey} />}
      {loginWay === 'phone-code' && <LoginWithPhoneCode />}
    </div>
  )
}
