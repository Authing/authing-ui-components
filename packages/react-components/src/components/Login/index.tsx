import React, { useState } from 'react'
import { Radio } from 'antd'
import { GuardLoginViewProps } from './props'
import { LoginWithPassword } from './core/withPassword'
import { useAuthClient } from '../Guard/authClient'
import { codeMap } from './codemap'

import { LoginWithPhoneCode } from './core/withPhonecode'
import './styles.less'

export const GuardLoginView = (props: GuardLoginViewProps) => {
  const [loginWay, setLoginWay] = useState('password')
  let client = useAuthClient()
  // props: appId, initData, config
  let publicKey = props.config?.publicKey!
  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        props.onLogin?.(data, client!) // 登录成功
      }
    }

    if (!action) {
      return () => {
        console.error('未捕获 code', code)
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      return (initData?: any) => props.__changeModule?.(action.module, initData)
    }

    // 最终结果
    return () => {
      console.error('last action at loginview')
    }
  }

  // 6种不同的登录方式
  // PhoneCode = 'phone-code',
  // Password = 'password',
  // LDAP = 'ldap',
  // AppQr = 'app-qrcode',
  // WxMinQr = 'wechat-miniprogram-qrcode', // 对应社会化登录的 wechat:miniprogram:qrconnect(小程序扫码登录)
  // AD = 'ad', // 对应企业身份源的 Windows AD 登录
  // WechatMpQrcode = 'wechatmp-qrcode', // 微信扫码关注登录
  return (
    <div className="g2-login-container">
      <Radio.Group
        className="authing-g2-button-group"
        value={loginWay}
        onChange={(e) => setLoginWay(e.target.value)}
      >
        <Radio.Button value="password">密码</Radio.Button>
        <Radio.Button value="phone-code">手机号</Radio.Button>
        {/* <Radio.Button value="ldap">LDAP</Radio.Button> */}
      </Radio.Group>

      {loginWay === 'password' && (
        <LoginWithPassword
          publicKey={publicKey}
          onLogin={(code: any, message: any, data: any) => {
            const callback = __codePaser?.(code)
            callback?.(data)
          }}
        />
      )}
      {loginWay === 'phone-code' && (
        <LoginWithPhoneCode
          onLogin={() => {
            console.log('todo 待实现')
          }}
        />
      )}
    </div>
  )
}
