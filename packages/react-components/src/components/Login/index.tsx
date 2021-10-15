import React, { useState } from 'react'
import { Radio } from 'antd'
import { GuardLoginViewProps } from './props'
import { useAuthClient } from '../Guard/authClient'
import { codeMap } from './codemap'

import { LoginWithPassword } from './core/withPassword'
import { LoginWithPhoneCode } from './core/withPhonecode'
import { LoginWithLDAP } from './core/withLDAP'
import { LoginWithAD } from './core/withAD'
import { LoginWithAppQrcode } from './core/withAppQrcode'
import { LoginWithWechatMiniQrcode } from './core/withWechatMiniQrcode'
import { LoginWithWechatmpQrcode } from './core/withWechatmpQrcode'

import './styles.less'

export const GuardLoginView = (props: GuardLoginViewProps) => {
  const [loginWay, setLoginWay] = useState('app-qrcode')
  const [ways, setWays] = useState([])
  const client = useAuthClient()

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

  const onLogin = (code: any, data: any) => {
    const callback = __codePaser?.(code)
    callback?.(data)
  }
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
        <Radio.Button value="ad">企业身份源</Radio.Button>
        <Radio.Button value="app-qrcode">app-qrcode</Radio.Button>
        <Radio.Button value="wechat-miniprogram-qrcode">
          小程序扫码
        </Radio.Button>
        <Radio.Button value="wechatmp-qrcode">公众号扫码登录</Radio.Button>
      </Radio.Group>

      {loginWay === 'password' && (
        <LoginWithPassword publicKey={publicKey} onLogin={onLogin} />
      )}
      {loginWay === 'phone-code' && <LoginWithPhoneCode onLogin={onLogin} />}
      {loginWay === 'ldap' && <LoginWithLDAP onLogin={onLogin} />}
      {loginWay === 'ad' && <LoginWithAD onLogin={onLogin} />}
      {loginWay === 'app-qrcode' && <LoginWithAppQrcode onLogin={onLogin} />}
      {loginWay === 'wechat-miniprogram-qrcode' && (
        <LoginWithWechatMiniQrcode onLogin={onLogin} />
      )}
      {loginWay === 'wechatmp-qrcode' && (
        <LoginWithWechatmpQrcode onLogin={onLogin} />
      )}
    </div>
  )
}
