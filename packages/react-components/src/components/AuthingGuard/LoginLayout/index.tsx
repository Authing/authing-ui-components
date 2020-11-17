import { message } from 'antd'
import { User } from 'authing-js-sdk'
import { FormInstance } from 'antd/lib/form'
import React, { useRef } from 'react'

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
  LOGIN_METHODS_MAP,
  NEED_MFA_CODE,
} from '../../../components/AuthingGuard/constants'
import { AuthingTabs } from '../../../common/AuthingTabs'
import {
  BaseFormProps,
  GuardScenes,
  LoginMethods,
} from '../../../components/AuthingGuard/types'

import './style.less'

const useFormActions = () => {
  const {
    setValue,
    state: { guardEvents, authClient },
  } = useGuardContext()

  const onSuccess = (user: User) => {
    message.success('登录成功')
    guardEvents.onLogin?.(user, authClient)
  }

  const onFail = (error: any) => {
    if (error?.code === NEED_MFA_CODE) {
      setValue('mfaToken', error.data.mfaToken)
      setValue('guardScenes', GuardScenes.MfaVerify)
    }
    guardEvents.onLoginError?.(error, authClient)
  }

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
    [LoginMethods.Password]: (
      <PasswordLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.Password] = v!)}
      />
    ),
    [LoginMethods.PhoneCode]: (
      <PhoneCodeLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.PhoneCode] = v!)}
      />
    ),
    [LoginMethods.AppQr]: (
      <QrCodeLoginForm type={LoginMethods.AppQr} {...formProps} />
    ),
    [LoginMethods.WxMinQr]: (
      <QrCodeLoginForm type={LoginMethods.WxMinQr} {...formProps} />
    ),
    [LoginMethods.LDAP]: (
      <LdapLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.LDAP] = v!)}
      />
    ),
    [LoginMethods.AD]: (
      <ADLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.AD] = v!)}
      />
    ),
  }

  const {
    state: { config },
  } = useGuardContext()
  const { loginMethods = [] } = config

  const tabs = loginMethods.map((item) => ({
    key: item,
    label: LOGIN_METHODS_MAP[item],
    component: LOGIN_FORM_MAP[item],
  }))

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
        tabs={tabs}
        onTabClick={(t) =>
          setValue('activeTabs', {
            ...activeTabs,
            [GuardScenes.Login]: t,
          })
        }
        activeKey={activeTabs[GuardScenes.Login]}
      ></AuthingTabs>

      {SHOW_SOCIAL_LOGIN_TAB.includes(activeTabs[GuardScenes.Login]) && (
        <SocialAndIdpLogin onFail={onFail} onSuccess={onSuccess} />
      )}
    </>
  )
}
