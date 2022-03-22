import React, { useEffect, useMemo, useState } from 'react'
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
import { GuardLoginViewProps } from './interface'

import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { LoginMethods } from '../AuthingGuard/types'
import { IconFont } from '../IconFont'
import { ChangeLanguage } from '../ChangeLanguage'
import { i18n } from '../_utils/locales'

import './styles.less'
import { usePublicConfig } from '../_utils/context'
import { isWechatBrowser, shoudGoToComplete } from '../_utils'
import { LoginWithVerifyCode } from './core/withVerifyCode'
import { VerifyLoginMethods } from '../AuthingGuard/api'

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
export const GuardLoginView = (props: GuardLoginViewProps) => {
  const { config } = props
  const qrcodeTabsSettings = config.__publicConfig__?.qrcodeTabsSettings

  let [defaultMethod, renderInputWay, renderQrcodeWay] = useMethods(config)
  const agreementEnabled = config?.agreementEnabled

  const { t } = useTranslation()

  const [loginWay, setLoginWay] = useState(defaultMethod)
  const [canLoop, setCanLoop] = useState(false) // 允许轮询
  const client = useGuardAuthClient()
  const publicConfig = usePublicConfig()
  const [errorNumber, setErrorNumber] = useState(0)
  const [accountLock, setAccountLock] = useState(false)
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
    const scanLogins = ms.filter((method) => qrcodeWays.includes(method)) //取到扫码登录类型
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

  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        if (shoudGoToComplete(data, 'login', publicConfig, autoRegister)) {
          props.__changeModule?.(GuardModuleType.COMPLETE_INFO, {
            context: 'login',
            user: data,
          })
        } else {
          props.onLogin?.(data, client!) // 登录成功
        }
      }
    }

    if (!action) {
      return (initData?: any) => {
        // initData?._message && message.error(initData?._message)
        console.error('未捕获 code', code)
      }
    }

    // 解析成功
    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      let init = action.initData ? action.initData : {}
      return (initData?: any) => {
        props.__changeModule?.(m, { ...initData, ...init })
      }
    }
    if (action?.action === 'message') {
      return (initData?: any) => {
        setErrorNumber(errorNumber + 1)
        message.error(initData?._message)
      }
    }
    if (action?.action === 'accountLock') {
      return (initData?: any) => {
        message.error(initData?._message)
        setAccountLock(true)
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
              (autoRegister || !!agree?.availableAt)
          ) ?? []
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreementEnabled, autoRegister, config?.agreements, i18n.language]
  )

  const verifyLoginMethods = useMemo<VerifyLoginMethods[]>(
    () =>
      config.__publicConfig__?.verifyCodeTabConfig?.enabledLoginMethods ?? [
        'phone-code',
      ],
    [config.__publicConfig__?.verifyCodeTabConfig?.enabledLoginMethods]
  )

  return (
    <div className="g2-view-container g2-view-login">
      <div className="g2-view-container-inner">
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
          <img src={props.config?.logo} alt="" className="icon" />
          <div className="title">{props.config?.title}</div>
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
                      loginWay={loginWay}
                      publicKey={publicKey}
                      autoRegister={autoRegister}
                      host={props.config.__appHost__}
                      onLogin={onLogin}
                      onBeforeLogin={onBeforeLogin}
                      passwordLoginMethods={props.config.passwordLoginMethods}
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
                      verifyCodeLength={
                        props.config.__publicConfig__?.verifyCodeLength
                      }
                      autoRegister={autoRegister}
                      onBeforeLogin={onBeforeLogin}
                      onLogin={onLogin}
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
                      autoRegister={autoRegister}
                      host={props.config.__appHost__}
                      onLogin={onLogin}
                      onBeforeLogin={onBeforeLogin}
                      agreements={agreements}
                    />
                  </Tabs.TabPane>
                )}
                {ms?.includes(LoginMethods.AD) && (
                  <Tabs.TabPane key={LoginMethods.AD} tab={t('login.adLogin')}>
                    <LoginWithAD
                      publicKey={publicKey}
                      autoRegister={autoRegister}
                      // host={props.config.__appHost__}
                      onLogin={onLogin}
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
                      props.__changeModule?.(GuardModuleType.FORGET_PWD, {})
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
                      props.__changeModule?.(GuardModuleType.ANY_QUESTIONS, {})
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
          <div
            className={`g2-view-tabs ${qrcodeNone} ${hiddenTab && 'hidden'}`}
          >
            <Tabs
              destroyInactiveTabPane={true}
              onChange={(k: any) => {
                message.destroy()
                props.onLoginTabChange?.(k)
              }}
              defaultActiveKey={defaultQrCodeWay}
            >
              {ms?.includes(LoginMethods.WxMinQr) &&
                qrcodeTabsSettings?.[LoginMethods.WxMinQr].map((item) => (
                  <Tabs.TabPane
                    key={LoginMethods.WxMinQr + item.id}
                    tab={item.title ?? t('login.scanLogin')}
                  >
                    <LoginWithWechatMiniQrcode
                      onLogin={onLogin}
                      canLoop={canLoop}
                      qrCodeScanOptions={{
                        ...props.config.qrCodeScanOptions,
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
                ))}
              {ms?.includes(LoginMethods.AppQr) && (
                <Tabs.TabPane
                  key={LoginMethods.AppQr}
                  tab={t('login.appScanLogin')}
                >
                  <LoginWithAppQrcode
                    onLogin={onLogin}
                    canLoop={canLoop}
                    qrCodeScanOptions={{
                      ...props.config.qrCodeScanOptions,
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
              {/* {ms?.includes(LoginMethods.WechatMpQrcode) && (
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
              )} */}
              {ms?.includes(LoginMethods.WechatMpQrcode) &&
                qrcodeTabsSettings?.[LoginMethods.WechatMpQrcode].map(
                  (item) => (
                    <Tabs.TabPane
                      key={LoginMethods.WechatMpQrcode + item.id}
                      tab={item.title ?? t('login.wechatmpQrcode')}
                    >
                      <LoginWithWechatmpQrcode
                        onLogin={onLogin}
                        canLoop={canLoop}
                        qrCodeScanOptions={{
                          ...props.config.qrCodeScanOptions,
                          extIdpConnId: item.id,
                          tips: {
                            title:
                              i18n.language === 'zh-CN'
                                ? `${isWechatBrowser() ? '长按' : '扫码'}关注 ${
                                    item.title
                                  } 微信公众号登录`
                                : `${
                                    isWechatBrowser() ? 'Press' : 'Scan'
                                  } to follow ${item.title} and login`,
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
            appId={props.appId}
            config={props.config}
            onLogin={onLogin}
          />
        </div>
      </div>
      <ChangeLanguage langRange={langRange} onLangChange={props.onLangChange} />
    </div>
  )
}
