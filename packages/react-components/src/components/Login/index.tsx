import React, { useEffect, useState } from 'react'
import { message, Tabs } from 'antd'
import { GuardLoginViewProps, LoginConfig } from './props'
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

import { GuardModuleType } from '../Guard/module'
import { LoginMethods } from '../AuthingGuard/types'
import { IconFont } from '../IconFont'
import { intersection } from 'lodash'

const inputWays = [
  LoginMethods.Password,
  LoginMethods.PhoneCode,
  LoginMethods.AD,
  LoginMethods.LDAP,
]
const qrcodeWays = [
  LoginMethods.AppQr,
  LoginMethods.WxMinQr,
  LoginMethods.WechatMpQrcode,
]

const useMethods = (config: any) => {
  let dlm = config?.defaultLoginMethod
  let propsMethods = config?.loginMethods

  if (!propsMethods?.includes(dlm)) {
    dlm = propsMethods?.[0]
  }
  let renderInputWay = intersection(propsMethods, inputWays).length > 0
  let renderQrcodeWay = intersection(propsMethods, qrcodeWays).length > 0
  return [dlm, renderInputWay, renderQrcodeWay]
}

export const GuardLoginView = (props: GuardLoginViewProps) => {
  let [defaultMethod, renderInputWay, renderQrcodeWay] = useMethods(
    props.config
  )

  const [loginWay, setLoginWay] = useState(defaultMethod)
  const [canLoop, setCanLoop] = useState(false) // 允许轮询
  const client = useAuthClient()

  let publicKey = props.config?.publicKey!
  let autoRegister = props.config?.autoRegister
  let ms = props.config?.loginMethods

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
        // props.onLoginError?.(data, client) // 未捕获 code
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      return (initData?: any) => props.__changeModule?.(m, initData)
    }
    if (action?.action === 'message') {
      return (initData?: any) => {
        // props.onLoginError?.(data, client!) // 未捕获 code
        message.error(initData?.__message)
      }
    }

    // 最终结果
    return () => {
      // props.onLoginError?.(data, client!) // 未捕获 code
      console.error('last action at loginview')
    }
  }

  const onLogin = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code)
    if (!data) {
      data = {}
    }
    data.__message = message
    callback?.(data)
  }

  const onBeforeLogin = (loginInfo: any) => {
    if (props.onBeforeLogin) {
      return props.onBeforeLogin?.(loginInfo, client)
    }
    return () => console.log('Guard 未传入 onBeforeLogin hooks')
  }

  useEffect(() => {
    if (qrcodeWays.includes(loginWay)) {
      setCanLoop(true)
    }
    // 可以设定 = fasle 的时候关闭 qrcode 的几个定时器
    // 不关的话，第二次进入会更快，也没什么代价（只有轮询）
  }, [loginWay])

  let inputNone = !inputWays.includes(loginWay) ? 'none' : ''
  let qrcodeNone = !qrcodeWays.includes(loginWay) ? 'none' : ''

  return (
    <div className="g2-view-container">
      {/* 两种方式都需要渲染的时候，才出现切换按钮 */}
      {renderInputWay && renderQrcodeWay && (
        <div
          className="g2-qrcode-switch"
          onClick={() => {
            if (inputWays.includes(loginWay)) {
              setLoginWay(LoginMethods.WxMinQr)
            } else if (qrcodeWays.includes(loginWay)) {
              setLoginWay(LoginMethods.Password)
            }
          }}
        >
          <div className="switch-text">扫码登录方式</div>
          <div className="imgae-mask" />
          <IconFont
            type="authing-a-erweima22"
            className={`qrcode-switch-image ${inputNone}`}
          />
          <IconFont
            type="authing-diannao"
            className={`qrcode-switch-image ${qrcodeNone}`}
          />
        </div>
      )}

      <div className="g2-view-header">
        <img src={props.config?.logo} alt="" className="icon" />
        <div className="title">登录 {props.config?.title}</div>
      </div>

      {renderInputWay && (
        <div className={`g2-view-tabs ${inputNone}`}>
          <Tabs
            onChange={(k: any) => {
              setLoginWay(k)
              // props.onLoginTabChange?.(k)
            }}
            activeKey={loginWay}
          >
            {ms?.includes(LoginMethods.Password) && (
              <Tabs.TabPane key={LoginMethods.Password} tab="密码登录">
                <LoginWithPassword
                  publicKey={publicKey}
                  autoRegister={autoRegister}
                  host={props.config.host}
                  onLogin={onLogin}
                  onBeforeLogin={onBeforeLogin}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.PhoneCode) && (
              <Tabs.TabPane key={LoginMethods.PhoneCode} tab="验证码登录">
                <LoginWithPhoneCode
                  autoRegister={autoRegister}
                  onBeforeLogin={onBeforeLogin}
                  onLogin={onLogin}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.LDAP) && (
              <Tabs.TabPane key={LoginMethods.LDAP} tab="LDAP">
                <LoginWithLDAP
                  publicKey={publicKey}
                  autoRegister={autoRegister}
                  host={props.config.host}
                  onLogin={onLogin}
                  onBeforeLogin={onBeforeLogin}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.AD) && (
              <Tabs.TabPane key={LoginMethods.AD} tab="LDAP">
                <LoginWithAD onLogin={onLogin} />
              </Tabs.TabPane>
            )}
          </Tabs>

          <div className="g2-tips-line">
            <div
              className="link-like"
              onClick={() =>
                props.__changeModule?.(GuardModuleType.FORGETPASSWORD, {})
              }
            >
              忘记密码
            </div>
            <span className="go-to-register">
              <span className="gray">还没有账号，</span>
              <span
                className="link-like"
                onClick={() =>
                  props.__changeModule?.(GuardModuleType.REGISTER, {})
                }
              >
                立即注册
              </span>
            </span>
          </div>
        </div>
      )}
      {renderQrcodeWay && (
        <div className={`g2-view-tabs ${qrcodeNone}`}>
          <Tabs
            onChange={(k: any) => {
              props.onLoginTabChange?.(k)
            }}
          >
            {ms?.includes(LoginMethods.WxMinQr) && (
              <Tabs.TabPane key={LoginMethods.WxMinQr} tab="小程序扫码">
                <LoginWithWechatMiniQrcode
                  onLogin={onLogin}
                  canLoop={canLoop}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.AppQr) && (
              <Tabs.TabPane key={LoginMethods.AppQr} tab="APP 扫码">
                <LoginWithAppQrcode onLogin={onLogin} canLoop={canLoop} />
              </Tabs.TabPane>
            )}

            {ms?.includes(LoginMethods.WechatMpQrcode) && (
              <Tabs.TabPane key={LoginMethods.WechatMpQrcode} tab="公众号扫码">
                <LoginWithWechatmpQrcode onLogin={onLogin} canLoop={canLoop} />
              </Tabs.TabPane>
            )}
          </Tabs>
        </div>
      )}
    </div>
  )
}
