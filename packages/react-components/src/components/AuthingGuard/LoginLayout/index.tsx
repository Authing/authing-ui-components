import { Tabs } from 'antd'
import { User } from 'authing-js-sdk'
import { FormInstance } from 'antd/lib/form'
import React, { useRef, useState } from 'react'

import { useGuardContext } from '@/context/global/context'
import {
  LdapLoginForm,
  QrCodeLoginForm,
  PasswordLoginForm,
  PhoneCodeLoginForm,
} from '@/components/AuthingGuard/Forms'
import { LOGIN_METHODS_MAP } from '@/components/AuthingGuard/constants'
import { AuthingTabs } from '@/components/AuthingGuard/AuthingTabs'

import './style.less'
import { LoginMethods } from '../types/GuardConfig'

const useFormActions = () => {
  const onSuccess = (user: User) => {
    console.log('登录成功', user)
  }

  const onFail = (error: any) => {
    console.log('登录失败')
  }

  return {
    onFail,
    onSuccess,
  }
}

const useNormalLoginTabs = () => {
  const { onFail, onSuccess } = useFormActions()

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

export const LoginLayout = () => {
  const {
    state: {
      config: { defaultLoginMethod },
    },
  } = useGuardContext()

  const [activeTab, setActiveTab] = useState(defaultLoginMethod!)
  const { tabs } = useNormalLoginTabs()

  return (
    <AuthingTabs
      size="large"
      onTabClick={(t) => setActiveTab(t as LoginMethods)}
      activeKey={activeTab}
      centered
      className="authing-guard-tabs"
    >
      {tabs.map((item) => {
        return (
          <Tabs.TabPane key={item.key} tab={item.label}>
            {item.component}
          </Tabs.TabPane>
        )
      })}
    </AuthingTabs>
  )
}
