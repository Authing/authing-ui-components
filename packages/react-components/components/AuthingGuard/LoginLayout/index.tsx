import { message } from 'antd'
import { User } from 'authing-js-sdk'
import { FormInstance } from 'antd/lib/form'
import React, { useCallback, useMemo, useRef } from 'react'

import { useGuardContext } from '../../context/global/context'
import {
  ADLoginForm,
  LdapLoginForm,
  QrCodeLoginForm,
  SocialAndIdpLogin,
  PasswordLoginForm,
  PhoneCodeLoginForm,
} from '../../../components/AuthingGuard/Forms'
import {
  OTP_MFA_CODE,
  APP_MFA_CODE,
  LOGIN_METHODS_MAP,
} from '../../../components/AuthingGuard/constants'
import { AuthingTabs } from '../../AuthingTabs'
import {
  BaseFormProps,
  GuardScenes,
  LoginMethods,
} from '../../../components/AuthingGuard/types'

import './style.less'
import { useTranslation } from 'react-i18next'

const useFormActions = () => {
  const { t } = useTranslation()

  const {
    setValue,
    state: { guardEvents, authClient },
  } = useGuardContext()

  const onSuccess = useCallback(
    (user: User) => {
      message.success(t('common.LoginSuccess'))
      guardEvents.onLogin?.(user, authClient)
    },
    [authClient, guardEvents, t]
  )

  const onFail = useCallback(
    (error: any) => {
      if (OTP_MFA_CODE === error?.code) {
        setValue('mfaData', error.data)
        setValue('guardScenes', GuardScenes.MfaVerify)
      }
      if (APP_MFA_CODE === error?.code) {
        setValue('mfaData', error.data)
        setValue('guardScenes', GuardScenes.AppMfaVerify)
      }
      guardEvents.onLoginError?.(error, authClient)
    },
    [authClient, guardEvents, setValue]
  )

  return {
    onFail,
    onSuccess,
  }
}

const useNormalLoginTabs = ({ onSuccess, onFail }: BaseFormProps) => {
  const formRef = useRef<Record<LoginMethods, FormInstance>>(
    {} as Record<LoginMethods, FormInstance>
  )

  const formProps = {
    onFail,
    onSuccess,
  }

  const LOGIN_FORM_MAP = {
    [LoginMethods.Password]: (props: any) => (
      <PasswordLoginForm
        {...props}
        ref={(v) => (formRef.current[LoginMethods.Password] = v!)}
      />
    ),
    [LoginMethods.PhoneCode]: (props: any) => (
      <PhoneCodeLoginForm
        {...props}
        ref={(v) => (formRef.current[LoginMethods.PhoneCode] = v!)}
      />
    ),
    [LoginMethods.AppQr]: (props: any) => (
      <QrCodeLoginForm type={LoginMethods.AppQr} {...props} />
    ),
    [LoginMethods.WxMinQr]: (props: any) => (
      <QrCodeLoginForm type={LoginMethods.WxMinQr} {...props} />
    ),
    [LoginMethods.LDAP]: (props: any) => (
      <LdapLoginForm
        {...props}
        ref={(v) => (formRef.current[LoginMethods.LDAP] = v!)}
      />
    ),
    [LoginMethods.WechatMpQrcode]: (props: any) => (
      <QrCodeLoginForm type={LoginMethods.WechatMpQrcode} {...props} />
    ),
    [LoginMethods.AD]: (props: any) => (
      <ADLoginForm
        {...props}
        ref={(v) => (formRef.current[LoginMethods.AD] = v!)}
      />
    ),
  }

  const {
    state: { config },
  } = useGuardContext()
  const {
    loginMethods = [],
    loginMethodTitleMapping,
    qrcodeTabsSettings,
  } = config

  let tabs: any[] = []

  // 兼容 密码登陆 donglyc
  let filterLoginMethods = loginMethods.filter(
    (d) => d.indexOf('password') === -1
  )
  const hasPassword = loginMethods.some((d) => d.indexOf('password') !== -1)
  if (hasPassword) filterLoginMethods.push(LoginMethods.Password)

  filterLoginMethods.forEach((method: LoginMethods) => {
    if (
      [LoginMethods.WechatMpQrcode, LoginMethods.WxMinQr].includes(method) &&
      qrcodeTabsSettings[method]
    ) {
      tabs.push(
        ...qrcodeTabsSettings[method].map((idp) => {
          return {
            key: idp.id,
            label: idp.title || loginMethodTitleMapping[method],
            component: LOGIN_FORM_MAP[method]({
              ...formProps,
              idp,
            }),
          }
        })
      )
    } else {
      tabs.push({
        key: method,
        label: LOGIN_METHODS_MAP()[method],
        component: LOGIN_FORM_MAP[method](formProps),
      })
    }
  })
  return {
    tabs,
  }
}

const SHOW_SOCIAL_LOGIN_TAB = [
  LoginMethods.LDAP,
  LoginMethods.Password,
  LoginMethods.PhoneCode,
]
export const LoginLayout = () => {
  const {
    state: { activeTabs, config },
    setValue,
  } = useGuardContext()
  const { qrcodeTabsSettings } = config

  const { onFail, onSuccess } = useFormActions()
  const { tabs } = useNormalLoginTabs({ onSuccess, onFail })

  const activeKey = useMemo(() => {
    const activeTab = activeTabs[GuardScenes.Login]
    if (
      [LoginMethods.WechatMpQrcode, LoginMethods.WxMinQr].includes(activeTab) &&
      qrcodeTabsSettings[activeTab]
    ) {
      return qrcodeTabsSettings[activeTab].find((item) => item.isDefault)?.id
    }
    return activeTab
  }, [activeTabs, qrcodeTabsSettings])

  return (
    <>
      <AuthingTabs
        tabs={tabs}
        onTabClick={(t) =>
          setValue('activeTabs', {
            ...activeTabs,
            [GuardScenes.Login]: t,
          })
        }
        activeKey={activeKey}
      />

      {SHOW_SOCIAL_LOGIN_TAB.includes(activeTabs[GuardScenes.Login]) && (
        <SocialAndIdpLogin onFail={onFail} onSuccess={onSuccess} />
      )}
    </>
  )
}
