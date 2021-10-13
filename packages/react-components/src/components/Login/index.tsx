import React from 'react'
import { Button, Form, Input, Radio } from 'antd'
import { IG2FCProps } from 'src/classes/IGuardV2FCProps'
import { GuardLoginProps } from './props'

import './styles.less'
interface LoginConfig {
  autoRegister: boolean
}

interface LoginEvents {
  onLogin: () => void
}

interface GuardLoginProps extends IG2FCProps, LoginEvents {
  config?: LoginConfig
}

const LoginWithPassword = () => {
  return (
    <div className="authing-g2-login-password">
      <Form.Item>
        <Input className="authing-g2-input" placeholder={'请输入账号'} />
      </Form.Item>

      <Form.Item>
        <Input className="authing-g2-input" placeholder={'请输入密码'} />
      </Form.Item>

      <div style={{ marginTop: 20 }}>
        <Button type="primary" size="large">
          登录
        </Button>
      </div>
    </div>
  )
}

export const GuardLogin: React.FC<GuardLoginProps> = (props) => {
  // props: appId, initData, config
  console.log('login 组件开始加载', props)
  // login 组件是最小单位

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
        defaultValue={'password'}
      >
        <Radio.Button value="password">密码</Radio.Button>
        <Radio.Button value="phone-code">手机</Radio.Button>
        <Radio.Button value="ldap">LDAP</Radio.Button>
      </Radio.Group>
      <LoginWithPassword />
    </div>
  )
}
