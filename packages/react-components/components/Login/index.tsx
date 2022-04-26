import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { message, Popover, Tabs, Tooltip } from 'antd'
import { intersection } from 'lodash'

import { LoginWithPassword } from './core/withPassword/index'
import { LoginWithLDAP } from './core/withLDAP'
import { LoginWithAD } from './core/withAD'
import { LoginWithAppQrcode } from './core/withAppQrcode'
import { LoginWithWechatMiniQrcode } from './core/withWechatMiniQrcode'
import { LoginWithWechatmpQrcode } from './core/withWechatmpQrcode'
import { codeMap } from './codemap'
import { SocialLogin } from './socialLogin'

import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { LoginMethods } from '../AuthingGuard/types'
import { IconFont } from '../IconFont'
import { ChangeLanguage } from '../ChangeLanguage'
import { i18n } from '../_utils/locales'

import './styles.less'
import {
  useGuardAppId,
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
import { isWeChatBrowser } from '../_utils'
import { LoginWithVerifyCode } from './core/withVerifyCode'
import { VerifyLoginMethods } from '../AuthingGuard/api'
import { useMediaSize, useMethod } from '../_utils/hooks'

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
  if (loginWay === LoginMethods.AD) {
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
export const GuardLoginView = () => {
  // const { config } = props

  const config = useGuardFinallyConfig()

  const appId = useGuardAppId()

  const { changeModule } = useGuardModule()

  const events = useGuardEvents()

  const publicConfig = useGuardPublicConfig()

  let [defaultMethod, renderInputWay, renderQrcodeWay] = useMethods(config)
  const agreementEnabled = config?.agreementEnabled

  const { t } = useTranslation()

  const [loginWay, setLoginWay] = useState(defaultMethod)

  const [canLoop, setCanLoop] = useState(false) // 允许轮询

  const client = useGuardAuthClient()

  const qrcodeTabsSettings = publicConfig?.qrcodeTabsSettings

  const [errorNumber, setErrorNumber] = useState(0)

  const [accountLock, setAccountLock] = useState(false)

  let publicKey = config?.publicKey!

  // let autoRegister = props.config?.autoRegister
  let ms = config?.loginMethods

  const firstInputWay = inputWays.filter((way) => ms?.includes(way))[0]

  const firstQRcodeWay = qrcodeWays.filter((way) => ms?.includes(way))[0]

  let { disableResetPwd, disableRegister } = useDisables({
    config: config,
    loginWay,
    autoRegister: config?.autoRegister,
  })

  const verifyCodeLogin = useMemo(() => {
    const methods = publicConfig?.verifyCodeTabConfig?.enabledLoginMethods ?? [
      'phone-code',
    ]

    if (methods.length === 1 && methods[0] === 'phone-code') {
      return t('common.phoneVerifyCode')
    } else if (methods.length === 1 && methods[0] === 'email-code') {
      return t('common.emailVerifyCode')
    }

    return t('common.verifyCodeLogin')
  }, [publicConfig, t])

  const hiddenTab = useMemo(() => {
    const scanLogins = ms ?? [].filter((method) => qrcodeWays.includes(method)) //取到扫码登录类型
    if (scanLogins.length > 1) {
      // 如果有两个以上的code 类型
      return false
    } else if (!scanLogins.includes(LoginMethods.AppQr)) {
      // 如果只有一个且那一个还不是 app 类型
      if (
        qrcodeTabsSettings &&
        (qrcodeTabsSettings?.[LoginMethods.WechatMpQrcode].length > 1 ||
          qrcodeTabsSettings?.[LoginMethods.WxMinQr].length > 1)
      ) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }, [ms, qrcodeTabsSettings])

  const defaultQrCodeWay = useMemo(() => {
    if (
      [LoginMethods.WechatMpQrcode, LoginMethods.WxMinQr].includes(
        defaultMethod
      )
    ) {
      const id = qrcodeTabsSettings?.[defaultMethod as LoginMethods]?.find(
        (i: { id: string; title: string; isDefault?: boolean | undefined }) =>
          i.isDefault
      )?.id
      return defaultMethod + id
    } else {
      return defaultMethod
    }
  }, [defaultMethod, qrcodeTabsSettings])

  const onLoginSuccess = (data: any, message?: string) => {
    // data._message = message
    events?.onLogin?.(data, client)
  }

  const onLoginFailed = (code: number, data: any, message?: string) => {
    // TODO 与拦截器中 render-message 同步
    const action = codeMap[code]
    if (action?.action === 'message') {
      setErrorNumber(errorNumber + 1)
    }

    if (action?.action === 'accountLock') {
      setAccountLock(true)
    }

    events?.onLoginError?.({
      code,
      data,
      message,
    })
  }

  const onBeforeLogin = (loginInfo: any) => {
    if (events?.onBeforeLogin) {
      return events?.onBeforeLogin?.(loginInfo, client)
    }
    return () => console.log('Guard not onBeforeLogin hooks')
  }

  useEffect(() => {
    if (qrcodeWays.includes(loginWay)) {
      setCanLoop(true)
    } else {
      setCanLoop(false)
    }
    // 可以设定 = fasle 的时候关闭 qrcode 的几个定时器
    // 不关的话，第二次进入会更快，也没什么代价（只有轮询）
  }, [loginWay])

  let { switchText, inputNone, qrcodeNone } = useSwitchStates(loginWay)
  //availableAt 0或者null-注册时，1-登录时，2-注册和登录时 注册登录合并时应该登录注册协议全部显示
  const agreements = useMemo(
    () =>
      agreementEnabled
        ? config?.agreements?.filter(
            (agree) =>
              agree.lang === i18n.language &&
              (config?.autoRegister || !!agree?.availableAt)
          ) ?? []
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreementEnabled, config?.autoRegister, config?.agreements, i18n.language]
  )

  const verifyLoginMethods = useMemo<VerifyLoginMethods[]>(
    () =>
      publicConfig?.verifyCodeTabConfig?.enabledLoginMethods ?? ['phone-code'],

    [publicConfig?.verifyCodeTabConfig?.enabledLoginMethods]
  )

  const [
    socialConnectionObjs,
    enterpriseConnectionObjs,
    isNoMethod,
  ] = useMethod({ config, publicConfig })

  const noLoginMethods = !config?.loginMethods?.length

  const { isPhoneMedia } = useMediaSize()

  // 渲染前执行
  useLayoutEffect(() => {
    if (noLoginMethods && !isPhoneMedia) {
      // pc 下
      const containerDOM = document.getElementsByClassName(
        'g2-view-container'
      )?.[0]

      if (containerDOM) {
        // @ts-ignore
        containerDOM.style['min-height'] = '456px'
        containerDOM.classList.add('no-login-methods-view')
        return () => {
          // @ts-ignore
          containerDOM.style['min-height'] = '610px'
          containerDOM.classList.remove('no-login-methods-view')
        }
      }
    }
  }, [isPhoneMedia, noLoginMethods])

  useEffect(() => {
    const containerDOM = document.getElementsByClassName('g2-view-header')?.[0]
    const innerContainer = document.querySelector(
      '.g2-view-login>.g2-view-container-inner'
    )
    if (isPhoneMedia && noLoginMethods) {
      if (containerDOM) {
        containerDOM.classList.add('g2-view-header-mobile')
      }
      if (innerContainer) {
        innerContainer.classList.add('g2-view-login-mobile-inner')
      }
    } else {
      containerDOM?.classList.remove('g2-view-header-mobile')
      innerContainer?.classList.remove('g2-view-login-mobile-inner')
    }
    return () => {
      containerDOM?.classList.remove('g2-view-header-mobile')
      innerContainer?.classList.remove('g2-view-login-mobile-inner')
    }
  }, [isPhoneMedia, noLoginMethods])

  return (
    <div className="g2-view-container g2-view-login">
      <div className="g2-view-container-inner">
        {isNoMethod ? (
          <>
            <div className="g2-view-header">
              <img src={config?.logo} alt="" className="icon" />
              <div className="title">{config?.title}</div>
              {!!publicConfig?.welcomeMessage && (
                <div className="title-description">
                  {publicConfig?.welcomeMessage[i18n.language]}
                </div>
              )}
            </div>
            <div className="no-login-methods-view">
              <IconFont
                type="authing-bianzu"
                style={{ width: 178, height: 120 }}
              />
              <span className="no-login-methods-desc">
                {t('login.noLoginMethodsDesc')}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* 两种方式都需要渲染的时候，才出现切换按钮 */}
            {renderInputWay && renderQrcodeWay && (
              <div className="g2-qrcode-switch">
                {/* <div className="switch-text">{switchText}</div> */}
                <Popover
                  placement="leftTop"
                  content={switchText}
                  overlayClassName="switch-text"
                  getPopupContainer={(node: any) => {
                    if (node) {
                      return node.parentElement
                    }
                    return document.body
                  }}
                >
                  <div
                    className="switch-img"
                    onClick={() => {
                      message.destroy()
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
                      className={`qrcode-switch-image ${qrcodeNone}`}
                    />
                  </div>
                </Popover>
              </div>
            )}

            <div className="g2-view-header">
              <img src={config?.logo} alt="" className="icon" />
              <div className="title">{config?.title}</div>
              {!!publicConfig?.welcomeMessage && (
                <div className="title-description">
                  {publicConfig?.welcomeMessage[i18n.language]}
                </div>
              )}
            </div>

            {renderInputWay && (
              <div className={inputNone}>
                <div className={`g2-view-tabs`}>
                  <Tabs
                    onChange={(k: any) => {
                      setLoginWay(k)
                      message.destroy()
                      events?.onLoginTabChange?.(k)
                    }}
                    activeKey={loginWay}
                  >
                    {ms?.includes(LoginMethods.Password) && (
                      <Tabs.TabPane
                        key={LoginMethods.Password}
                        tab={t('login.pwdLogin')}
                      >
                        <LoginWithPassword
                          loginWay={loginWay}
                          publicKey={publicKey}
                          autoRegister={config?.autoRegister}
                          host={config?.host}
                          // onLogin={onLogin}
                          onLoginSuccess={onLoginSuccess}
                          onLoginFailed={onLoginFailed}
                          onBeforeLogin={onBeforeLogin}
                          passwordLoginMethods={
                            config?.passwordLoginMethods ?? []
                          }
                          agreements={agreements}
                        />
                      </Tabs.TabPane>
                    )}
                    {ms?.includes(LoginMethods.PhoneCode) && (
                      <Tabs.TabPane
                        key={LoginMethods.PhoneCode}
                        tab={verifyCodeLogin}
                      >
                        <LoginWithVerifyCode
                          verifyCodeLength={publicConfig?.verifyCodeLength}
                          autoRegister={config?.autoRegister}
                          onBeforeLogin={onBeforeLogin}
                          // onLogin={onLogin}
                          onLoginSuccess={onLoginSuccess}
                          onLoginFailed={onLoginFailed}
                          agreements={agreements}
                          methods={verifyLoginMethods}
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
                          autoRegister={config?.autoRegister}
                          host={config?.host}
                          // onLogin={onLogin}
                          onLoginSuccess={onLoginSuccess}
                          onLoginFailed={onLoginFailed}
                          onBeforeLogin={onBeforeLogin}
                          agreements={agreements}
                        />
                      </Tabs.TabPane>
                    )}
                    {ms?.includes(LoginMethods.AD) && (
                      <Tabs.TabPane
                        key={LoginMethods.AD}
                        tab={t('login.adLogin')}
                      >
                        <LoginWithAD
                          publicKey={publicKey}
                          autoRegister={config?.autoRegister}
                          // onLogin={onLogin}
                          onLoginSuccess={onLoginSuccess}
                          onLoginFailed={onLoginFailed}
                          onBeforeLogin={onBeforeLogin}
                          agreements={agreements}
                        />
                      </Tabs.TabPane>
                    )}
                  </Tabs>
                </div>
                <div className={`g2-tips-line`}>
                  {!disableResetPwd && (
                    <div>
                      <span
                        className="link-like forget-password-link"
                        onClick={() =>
                          changeModule?.(GuardModuleType.FORGET_PWD, {})
                        }
                      >
                        {t('login.forgetPwd')}
                      </span>
                      {(errorNumber >= 2 || accountLock) && (
                        <span style={{ margin: '0 4px', color: '#EAEBEE' }}>
                          丨
                        </span>
                      )}
                    </div>
                  )}
                  {(errorNumber >= 2 || accountLock) && (
                    <Tooltip title={t('common.feedback')}>
                      <div
                        className="touch-tip question-feedback"
                        onClick={() =>
                          changeModule?.(GuardModuleType.ANY_QUESTIONS, {})
                        }
                      >
                        <IconFont
                          type={'authing-a-question-line1'}
                          style={{ fontSize: 16 }}
                        />
                      </div>
                    </Tooltip>
                  )}

                  {!disableRegister && (
                    <span className="go-to-register">
                      {/* <span className="gray">{t('common.noAccYet')}</span> */}
                      <span
                        className="link-like register-link"
                        onClick={() =>
                          changeModule?.(GuardModuleType.REGISTER, {})
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
              <div
                className={`g2-view-tabs ${qrcodeNone} ${
                  hiddenTab && 'hidden'
                }`}
              >
                <Tabs
                  destroyInactiveTabPane={true}
                  onChange={(k: any) => {
                    message.destroy()
                    events?.onLoginTabChange?.(k)
                  }}
                  defaultActiveKey={defaultQrCodeWay}
                >
                  {ms?.includes(LoginMethods.WxMinQr) &&
                    qrcodeTabsSettings?.[LoginMethods.WxMinQr].map(
                      (item: any) => (
                        <Tabs.TabPane
                          key={LoginMethods.WxMinQr + item.id}
                          tab={item.title ?? t('login.scanLogin')}
                        >
                          <LoginWithWechatMiniQrcode
                            // onLogin={onLogin}
                            onLoginSuccess={onLoginSuccess}
                            canLoop={canLoop}
                            qrCodeScanOptions={{
                              ...config?.qrCodeScanOptions,
                              extIdpConnId: item.id,
                              tips: {
                                title:
                                  i18n.language === 'zh-CN'
                                    ? '使用 微信 扫码登录'
                                    : `Use WeChat to scan and login`,
                                expired: t('login.qrcodeExpired'),
                              },
                            }}
                          />
                        </Tabs.TabPane>
                      )
                    )}
                  {ms?.includes(LoginMethods.AppQr) && (
                    <Tabs.TabPane
                      key={LoginMethods.AppQr}
                      tab={t('login.appScanLogin')}
                    >
                      <LoginWithAppQrcode
                        // onLogin={onLogin}
                        onLoginSuccess={onLoginSuccess}
                        canLoop={canLoop}
                        qrCodeScanOptions={{
                          ...config?.qrCodeScanOptions,
                          tips: {
                            title:
                              i18n.language === 'zh-CN'
                                ? '使用 APP 扫码登录'
                                : `Use APP to scan and login`,
                            expired: t('login.qrcodeExpired'),
                          },
                        }}
                      />
                    </Tabs.TabPane>
                  )}
                  {ms?.includes(LoginMethods.WechatMpQrcode) &&
                    qrcodeTabsSettings?.[LoginMethods.WechatMpQrcode].map(
                      (item) => (
                        <Tabs.TabPane
                          key={LoginMethods.WechatMpQrcode + item.id}
                          tab={item.title ?? t('login.wechatmpQrcode')}
                        >
                          <LoginWithWechatmpQrcode
                            // onLogin={onLogin}
                            onLoginSuccess={onLoginSuccess}
                            canLoop={canLoop}
                            qrCodeScanOptions={{
                              ...config?.qrCodeScanOptions,
                              extIdpConnId: item.id,
                              tips: {
                                title:
                                  i18n.language === 'zh-CN'
                                    ? `${
                                        isWeChatBrowser() ? '长按' : '扫码'
                                      }关注微信公众号登录`
                                    : `${
                                        isWeChatBrowser() ? 'Press' : 'Scan'
                                      } to follow and login`,
                                expired: t('login.qrcodeExpired'),
                              },
                            }}
                          />
                        </Tabs.TabPane>
                      )
                    )}
                </Tabs>
              </div>
            )}
            <div className="g2-social-login">
              <SocialLogin
                appId={appId}
                config={config!}
                // onLogin={onLogin}
                onLoginSuccess={onLoginSuccess}
                onLoginFailed={onLoginFailed}
                socialConnectionObjs={socialConnectionObjs}
                enterpriseConnectionObjs={enterpriseConnectionObjs}
              />
            </div>
          </>
        )}
      </div>
      <ChangeLanguage
        langRange={config?.langRange}
        onLangChange={events?.onLangChange}
      />
    </div>
  )
}
