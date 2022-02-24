import { message, Tabs } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GuardModuleType } from '..'
import { PasswordLoginMethods } from '../AuthingGuard/api'
import { useGuardAuthClient } from '../Guard/authClient'
import { IconFont } from '../IconFont'
import { codeMap } from '../Login/codemap'
import { LoginWithPassword } from '../Login/core/withPassword'
import { LoginWithVerifyCode } from '../Login/core/withVerifyCode'
import { useGuardHttp } from '../_utils/guradHttp'
import { i18n } from '../_utils/locales'
import { GuardIdentityBindingViewProps } from './interface'
import './styles.less'

export const GuardIdentityBindingView: React.FC<GuardIdentityBindingViewProps> = (
  props
) => {
  const { config, initData, __changeModule } = props

  const { t } = useTranslation()
  const { publicKey, autoRegister, agreementEnabled } = config

  const { post } = useGuardHttp()
  const authClient = useGuardAuthClient()

  const onBack = () => {
    if (initData.source === GuardModuleType.IDENTITY_BINDING_ASK)
      window.history.back()
    else __changeModule?.(GuardModuleType.LOGIN)
  }

  const bindMethodsMap = {
    'phone-code': async (data: any) => {
      const { identity, code } = data
      return await post('/interaction/federation/binding/byPhoneCode', {
        phone: identity,
        code,
      })
    },
    'email-code': async (data: any) => {
      const { identity, code } = data

      return await post('/interaction/federation/binding/byEmailCode', {
        email: identity,
        code,
      })
    },
    password: async (data: any) => {
      const { identity, password } = data
      const encrypt = authClient.options.encryptFunction

      const encryptPassword = await encrypt!(password, props.config?.publicKey!)

      return await post('/interaction/federation/binding/byAccount', {
        account: identity,
        password: encryptPassword,
      })
    },
  }

  const __codePaser = (code: number) => {
    const action = codeMap[code]
    if (code === 200) {
      return (data: any) => {
        console.log('binding success', data)
        props.onBinding?.(data.user, authClient!) // 登录成功
        props.onLogin?.(data.user, authClient!) // 登录成功
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
        message.error(initData?._message)
      }
    }
    if (action?.action === 'accountLock') {
      return () => {}
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
      props.onBindingError?.({
        code,
        data,
        message,
      })
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

  const onBind = async (loginInfo: any) => {
    const { type, data } = loginInfo

    const res = await bindMethodsMap[
      type as 'phone-code' | 'email-code' | 'password'
    ]?.(data)

    return res
    // onLogin(res.code, res.data, res.message)
  }

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

  const passwordLoginMethods = useMemo<PasswordLoginMethods[]>(() => {
    const loginMethodsBase = [
      'username-password',
      'email-password',
      'phone-password',
    ]

    // @ts-ignore
    return initData.methods.filter((method) =>
      loginMethodsBase.includes(method)
    ) as PasswordLoginMethods[]
  }, [initData.methods])

  const codeLoginMethods = useMemo(() => {
    const loginMethodsBase = ['email-code', 'phone-code']

    return initData.methods.filter((method) =>
      loginMethodsBase.includes(method)
    )
  }, [initData.methods])

  const methods = [
    {
      key: 'code',
      title: t('common.verifyCodeLogin'),
      component: (
        <LoginWithVerifyCode
          verifyCodeLength={props.config.__publicConfig__?.verifyCodeLength}
          autoRegister={false}
          onLoginRequest={onBind}
          onLogin={() => {}}
          agreements={agreements}
          methods={codeLoginMethods}
          submitButText={t('common.bind')}
        />
      ),
    },
    {
      key: 'password',
      title: t('login.pwdLogin'),
      component: (
        <LoginWithPassword
          publicKey={publicKey!}
          autoRegister={false}
          host={config.__appHost__}
          onLoginRequest={onBind}
          passwordLoginMethods={passwordLoginMethods}
          onLogin={() => {}}
          agreements={agreements}
          submitButText={t('common.bind')}
        />
        //   <LoginWithPassword
        //   loginWay={loginWay}
        //   publicKey={publicKey}
        //   autoRegister={autoRegister}
        //   host={props.config.__appHost__}
        //   onLogin={onLogin}
        //   onBeforeLogin={onBeforeLogin}
        //   passwordLoginMethods={props.config.passwordLoginMethods}
        //   agreements={agreements}
        // />
      ),
    },
  ]

  return (
    <div className="g2-view-container g2-view-identity-binding">
      <div className="g2-view-back" style={{ display: 'inherit' }}>
        <span onClick={onBack} className="g2-view-mfa-back-hover">
          <IconFont type="authing-arrow-left-s-line" style={{ fontSize: 24 }} />
          <span>{t('common.back')}</span>
        </span>
      </div>

      <div className="g2-view-identity-binding-content">
        <div className="g2-view-identity-binding-content-logo">
          <img src={props.config?.logo} alt="" className="logo" />
        </div>
        <div className="g2-view-identity-binding-content-title">
          <span>{t('common.identityBindingTitle')}</span>
        </div>
        <div className="g2-view-identity-binding-content-desc">
          <span>{t('common.identityBindingDesc')}</span>
        </div>
        <div className="g2-view-identity-binding-content-login">
          <Tabs>
            {methods
              .filter((method) => {
                if (method.key === 'password')
                  return passwordLoginMethods.length !== 0

                if (method.key === 'code') return codeLoginMethods.length !== 0

                return true
              })
              .map((method) => (
                <Tabs.TabPane key={method.key} tab={method.title}>
                  {method.component}
                </Tabs.TabPane>
              ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
