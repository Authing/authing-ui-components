import { message } from 'antd'
import { User } from 'authing-js-sdk'
import { FormInstance } from 'antd/lib/form'
import React, { useCallback, useRef } from 'react'

import { useGuardContext } from '../../../context/global/context'
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
import { AuthingTabs } from '../../../common/AuthingTabs'
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
  const { loginMethods = [], loginMethodTitleMapping } = config

  const tabs = loginMethods
    .map((tab) => {
      if (
        !loginMethods.every(
          (item) => !(item.split(':').length > 1 && item.split(':')[0] === tab)
        )
      )
        return undefined

      const idpId = tab.split(':').length > 1 ? tab.split(':')[1] : undefined

      if (idpId) {
        const type = tab.split(':')[0] as LoginMethods
        return {
          key: tab,
          label: loginMethodTitleMapping[tab]!,
          component: LOGIN_FORM_MAP[type]({
            ...formProps,
            idpId: idpId,
          }),
        }
      } else {
        return {
          key: tab,
          label: LOGIN_METHODS_MAP()?.[tab]!,
          component: LOGIN_FORM_MAP[tab](formProps),
        }
      }
    })
    .filter((i) => i !== undefined)

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
    state: { activeTabs },
    setValue,
  } = useGuardContext()

  const { onFail, onSuccess } = useFormActions()
  const { tabs } = useNormalLoginTabs({ onSuccess, onFail })

  return (
    <>
      <AuthingTabs
        tabs={
          tabs as {
            key: LoginMethods
            label: string
            component: JSX.Element
          }[]
        }
        onTabClick={(t) =>
          setValue('activeTabs', {
            ...activeTabs,
            [GuardScenes.Login]: t,
          })
        }
        activeKey={activeTabs[GuardScenes.Login]}
      />

      {SHOW_SOCIAL_LOGIN_TAB.includes(activeTabs[GuardScenes.Login]) && (
        <SocialAndIdpLogin onFail={onFail} onSuccess={onSuccess} />
      )}
    </>
  )
}
