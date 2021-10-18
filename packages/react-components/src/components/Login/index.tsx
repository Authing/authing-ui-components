import React, { useState } from 'react'
import { message, Radio, Tabs } from 'antd'
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
import { LoginMethods } from 'authing-js-sdk'
import { GuardModuleType } from '../Guard/module'

export const GuardLoginView = (props: GuardLoginViewProps) => {
  console.log('props.config', props)
  // const [loginWay, setLoginWay] = useState('password')
  // const [ways, setWays] = useState(props.config)
  const client = useAuthClient()

  let publicKey = props.config?.publicKey!
  let autoRegister = props.config?.autoRegister

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
      let m = action.module ? action.module : GuardModuleType.ERROR
      return (initData?: any) => props.__changeModule?.(m, initData)
    }
    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?.__message)
      }
    }

    // 最终结果
    return () => {
      console.error('last action at loginview')
    }
  }

  const onLogin = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code)
    if (!data) {
      data = {}
      data.__message = message
    }
    callback?.(data)
  }
  return (
    <div className="g2-login-container">
      <div className="g2-login-header">
        <img src={props.config?.logo} alt="" className="icon" />

        <div className="title">登录 {props.config?.title}</div>
      </div>
      <div className="g2-login-tabs">
        <Tabs>
          {props.config?.loginMethods?.includes(LoginMethods.Password) && (
            <Tabs.TabPane key="password" tab="密码登录">
              <LoginWithPassword
                publicKey={publicKey}
                autoRegister={autoRegister}
                onLogin={onLogin}
              />
            </Tabs.TabPane>
          )}
          {props.config?.loginMethods?.includes(LoginMethods.PhoneCode) && (
            <Tabs.TabPane key="phone-code" tab="验证码登录">
              <LoginWithPhoneCode
                autoRegister={autoRegister}
                onLogin={onLogin}
              />
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
      {/* <Radio.Group
        className="authing-g2-button-group"
        value={loginWay}
        onChange={(e) => setLoginWay(e.target.value)}
      >
        {props.config?.loginMethods?.includes(LoginMethods.Password) && (
          <Radio.Button value="password">密码</Radio.Button>
        )}
        {props.config?.loginMethods?.includes(LoginMethods.PhoneCode) && (
          <Radio.Button value="phone-code">手机号</Radio.Button>
        )}
        {props.config?.loginMethods?.includes(LoginMethods.LDAP) && (
          <Radio.Button value="ldap">LDAP</Radio.Button>
        )}
        {props.config?.loginMethods?.includes(LoginMethods.AD) && (
          <Radio.Button value="ad">企业身份源</Radio.Button>
        )}
        {props.config?.loginMethods?.includes(LoginMethods.AppQr) && (
          <Radio.Button value="app-qrcode">app-qrcode</Radio.Button>
        )}
        {props.config?.loginMethods?.includes(LoginMethods.WxMinQr) && (
          <Radio.Button value="wechat-miniprogram-qrcode">
            小程序扫码
          </Radio.Button>
        )}
        todo wechatmp-qrcode 并未出现在枚举中
        <Radio.Button value="wechatmp-qrcode">公众号扫码登录</Radio.Button>
      </Radio.Group> */}
      {/* 
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
      )} */}

      <div className="tipsLine">
        <div
          className="linklike"
          onClick={() =>
            props.__changeModule?.(GuardModuleType.FORGETPASSWORD, {})
          }
        >
          忘记密码
        </div>
        <span className="registerTip" onClick={() => {}}>
          <span className="gray">还没有账号，</span>
          <span className="linklike">立即注册</span>
        </span>
      </div>
    </div>
  )
}
