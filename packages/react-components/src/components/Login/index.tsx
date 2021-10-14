import React from 'react'
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
  // console.log('检查 _publickConfig_', )

  const onLoginClick = async () => {
    let url = '/api/v2/login/account'
    let body = {
      account: 'yuri',
      password: await encrypt!('123456', props.publicKey),

      // captchaCode,
      // customData: getUserRegisterParams(),
      // autoRegister: autoRegister,
    }
    const { code, data, message } = await client.post(url, body)
    console.log('检查登录结果', code, data, message)
  }

  return (
    <div className="authing-g2-login-password">
      <Form.Item>
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
      </div>
    </div>
  )
}

export const GuardLogin: React.FC<GuardLoginProps> = (props) => {
  // props: appId, initData, config
  // login 组件是最小单位
  let pc = props.config?._publicConfig_
  console.log('login 组件开始加载', pc)
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
      <LoginWithPassword publicKey={pc.publicKey} />
    </div>
  )
}
