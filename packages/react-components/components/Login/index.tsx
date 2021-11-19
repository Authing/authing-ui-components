import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { message, Tabs } from 'antd'
import { intersection } from 'lodash'

import { LoginWithPassword } from './core/withPassword/index'
import { LoginWithPhoneCode } from './core/withPhonecode'
import { LoginWithLDAP } from './core/withLDAP'
import { LoginWithAD } from './core/withAD'
import { LoginWithAppQrcode } from './core/withAppQrcode'
import { LoginWithWechatMiniQrcode } from './core/withWechatMiniQrcode'
import { LoginWithWechatmpQrcode } from './core/withWechatmpQrcode'
import { codeMap } from './codemap'
import { SocialLogin } from './socialLogin'
import { GuardLoginViewProps } from './props'

import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { LoginMethods } from '../AuthingGuard/types'
import { IconFont } from '../IconFont'
import { ChangeLanguage } from '../ChangeLanguage'
import { i18n } from '../_utils/locales'

import './styles.less'

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

const useDisables = (data: any) => {
  let { disableResetPwd, disableRegister } = data.config
  let { loginWay, autoRegister } = data

  if (loginWay === LoginMethods.PhoneCode) {
    disableResetPwd = true
  }
  if (loginWay === LoginMethods.LDAP) {
    disableResetPwd = true
    disableRegister = true
  }
  if (autoRegister === true) {
    disableRegister = true
  }
  return { disableResetPwd, disableRegister }
}

const useSwitchStates = (loginWay: LoginMethods) => {
  let switchText = i18n.t('login.scanLogin')
  if (qrcodeWays.includes(loginWay)) {
    switchText = i18n.t('login.moreWays')
  }
  let inputNone = !inputWays.includes(loginWay) ? 'none' : ''
  let qrcodeNone = !qrcodeWays.includes(loginWay) ? 'none' : ''

  return { switchText, inputNone, qrcodeNone }
}
export const GuardLoginView = (props: GuardLoginViewProps) => {
  let [defaultMethod, renderInputWay, renderQrcodeWay] = useMethods(
    props.config
  )
  const { t } = useTranslation()
  const [loginWay, setLoginWay] = useState(defaultMethod)
  const [canLoop, setCanLoop] = useState(false) // 允许轮询
  const client = useAuthClient()

  let publicKey = props.config?.publicKey!
  // let autoRegister = props.config?.autoRegister
  let ms = props.config?.loginMethods
  let { autoRegister, langRange } = props.config

  const firstInputWay = inputWays.filter((way) => ms.includes(way))[0]
  const firstQRcodeWay = qrcodeWays.filter((way) => ms.includes(way))[0]

  let { disableResetPwd, disableRegister } = useDisables({
    config: props.config,
    loginWay,
    autoRegister,
  })

  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        props.onLogin?.(data, client!) // 登录成功
      }
    }

    if (!action) {
      return (initData?: any) => {
        initData?._messag && message.error(initData?._messag)
        console.error('未捕获 code', code)
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      let init = action.initData ? action.initData : {}
      return (initData?: any) =>
        props.__changeModule?.(m, { ...initData, ...init })
    }
    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?._message)
      }
    }

    // 最终结果
    return (initData?: any) => {
      // props.onLoginError?.(data, client!) // 未捕获 code
      console.error('last action at loginview')
      message.error(initData?._message)
    }
  }

  const onLogin = (code: any, data: any, message?: string) => {
    const callback = __codePaser?.(code)
    if (code !== 200) {
      props.onLoginError?.({
        code,
        data,
        message,
      })
    }
    if (!data) {
      data = {}
    }
    data._message = message
    callback?.(data)
  }

  const onBeforeLogin = (loginInfo: any) => {
    if (props.onBeforeLogin) {
      return props.onBeforeLogin?.(loginInfo, client)
    }
    return () => console.log('Guard not onBeforeLogin hooks')
  }

  useEffect(() => {
    if (qrcodeWays.includes(loginWay)) {
      setCanLoop(true)
    }
    // 可以设定 = fasle 的时候关闭 qrcode 的几个定时器
    // 不关的话，第二次进入会更快，也没什么代价（只有轮询）
  }, [loginWay])

  let { switchText, inputNone, qrcodeNone } = useSwitchStates(loginWay)
  // if (loading) {
  //   return (
  //     <div className="g2-view-container">
  //       <LoadShielding />
  //     </div>
  //   )
  // }
  return (
    <div className="g2-view-container">
      {/* 两种方式都需要渲染的时候，才出现切换按钮 */}
      {renderInputWay && renderQrcodeWay && (
        <div className="g2-qrcode-switch">
          <div className="switch-text">{switchText}</div>
          <div
            className="switch-img"
            onClick={() => {
              if (inputWays.includes(loginWay)) {
                setLoginWay(firstQRcodeWay)
              } else if (qrcodeWays.includes(loginWay)) {
                setLoginWay(firstInputWay)
              }
            }}
          >
            <div className="imgae-mask" />
            <IconFont
              type="authing-a-erweima22"
              className={`qrcode-switch-image ${inputNone}`}
            />
            <IconFont
              type="authing-diannao"
              style={{ marginTop: '-6px' }}
              className={`qrcode-switch-image ${qrcodeNone}`}
            />
          </div>
        </div>
      )}

      <div className="g2-view-header">
        <img src={props.config?.logo} alt="" className="icon" />
        <div className="title">
          {t('common.login')} {props.config?.title}
        </div>
      </div>

      {renderInputWay && (
        <div className={inputNone}>
          <div className={`g2-view-tabs`}>
            <Tabs
              onChange={(k: any) => {
                setLoginWay(k)
                props.onLoginTabChange?.(k)
              }}
              activeKey={loginWay}
            >
              {ms?.includes(LoginMethods.Password) && (
                <Tabs.TabPane
                  key={LoginMethods.Password}
                  tab={t('login.pwdLogin')}
                >
                  <LoginWithPassword
                    publicKey={publicKey}
                    autoRegister={autoRegister}
                    host={props.config.host}
                    onLogin={onLogin}
                    onBeforeLogin={onBeforeLogin}
                    passwordLoginMethods={props.config.passwordLoginMethods}
                  />
                </Tabs.TabPane>
              )}
              {ms?.includes(LoginMethods.PhoneCode) && (
                <Tabs.TabPane
                  key={LoginMethods.PhoneCode}
                  tab={t('login.verifyCodeLogin')}
                >
                  <LoginWithPhoneCode
                    verifyCodeLength={
                      props.config.__publicConfig__?.verifyCodeLength
                    }
                    autoRegister={autoRegister}
                    onBeforeLogin={onBeforeLogin}
                    onLogin={onLogin}
                  />
                </Tabs.TabPane>
              )}
              {ms?.includes(LoginMethods.LDAP) && (
                <Tabs.TabPane
                  key={LoginMethods.LDAP}
                  tab={t('login.ldapLogin')}
                >
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
                <Tabs.TabPane key={LoginMethods.AD} tab={t('login.adLogin')}>
                  <LoginWithAD onLogin={onLogin} />
                </Tabs.TabPane>
              )}
            </Tabs>
          </div>
          <div className={`g2-tips-line`}>
            {!disableResetPwd && (
              <div>
                <span
                  className="link-like"
                  onClick={() =>
                    props.__changeModule?.(GuardModuleType.FORGET_PWD, {})
                  }
                >
                  {t('login.forgetPwd')}
                </span>
                <span style={{ margin: '0 4px' }} className="gray">
                  丨
                </span>
              </div>
            )}

            <div
              className="touch-tip"
              onClick={() =>
                props.__changeModule?.(GuardModuleType.ANY_QUESTIONS, {})
              }
            >
              <IconFont
                type={'authing-a-question-line1'}
                // style={{ fontSize: 20, marginRight: 8 }}
              />
            </div>

            {!disableRegister && (
              <span className="go-to-register">
                <span className="gray">{t('common.noAccYet')}</span>
                <span
                  className="link-like"
                  onClick={() =>
                    props.__changeModule?.(GuardModuleType.REGISTER, {})
                  }
                >
                  {t('common.registerImmediate')}
                </span>
              </span>
            )}
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
              <Tabs.TabPane
                key={LoginMethods.WxMinQr}
                tab={t('login.scanLogin')}
              >
                <LoginWithWechatMiniQrcode
                  onLogin={onLogin}
                  canLoop={canLoop}
                  qrCodeScanOptions={props.config.qrCodeScanOptions}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.AppQr) && (
              <Tabs.TabPane
                key={LoginMethods.AppQr}
                tab={t('login.appScanLogin')}
              >
                <LoginWithAppQrcode
                  onLogin={onLogin}
                  canLoop={canLoop}
                  qrCodeScanOptions={props.config.qrCodeScanOptions}
                />
              </Tabs.TabPane>
            )}
            {ms?.includes(LoginMethods.WechatMpQrcode) && (
              <Tabs.TabPane
                key={LoginMethods.WechatMpQrcode}
                tab={t('login.wechatmpQrcode')}
              >
                <LoginWithWechatmpQrcode
                  onLogin={onLogin}
                  canLoop={canLoop}
                  qrCodeScanOptions={props.config.qrCodeScanOptions}
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </div>
      )}
      <div className="g2-social-login">
        <SocialLogin
          appId={props.appId}
          config={props.config}
          onLogin={onLogin}
        />
      </div>
      <ChangeLanguage langRange={langRange} onLangChange={props.onLangChange} />
    </div>
  )
}
