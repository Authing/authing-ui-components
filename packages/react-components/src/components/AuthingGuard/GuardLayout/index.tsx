import { Button, Tabs } from 'antd'
import { User } from 'authing-js-sdk'
import { FormInstance } from 'antd/lib/form'
import React, { useRef, useState } from 'react'

import { useGlobalContext } from '@/context/global/context'
import {
  LdapLoginForm,
  PasswordLoginForm,
  PhoneCodeLoginForm,
} from '@/components/AuthingGuard/Forms'
import { GuardHeader } from '@/components/AuthingGuard/Header'
import { LOGIN_METHODS_MAP } from '@/components/AuthingGuard/constants'

import './style.less'
import { LoginMethods } from '../types/GuardConfig'

const useFormActions = (activeTab: LoginMethods) => {
  const formRef = useRef<Record<LoginMethods, FormInstance>>(
    {} as Record<LoginMethods, FormInstance>
  )
  const [loading, setLoading] = useState(false)

  const onSuccess = (user: User) => {
    console.log('登录成功', user)
    setLoading(false)
  }

  const onFail = (error: any) => {
    setLoading(false)
  }

  const onValidateFail = () => setLoading(false)

  const handleLogin = () => {
    setLoading(true)
    formRef.current[activeTab]!.submit()
  }

  return {
    formRef,
    loading,
    onFail,
    onSuccess,
    handleLogin,
    onValidateFail,
  }
}

const useNormalLoginTabs = (activeTab: LoginMethods) => {
  const {
    formRef,
    loading,
    onFail,
    onSuccess,
    onValidateFail,
    handleLogin,
  } = useFormActions(activeTab)

  const formProps = {
    onValidateFail,
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
      <PasswordLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.AppQr] = v!)}
      />
    ),
    [LoginMethods.WxMinQr]: (
      <PasswordLoginForm
        {...formProps}
        ref={(v) => (formRef.current[LoginMethods.WxMinQr] = v!)}
      />
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
  } = useGlobalContext()
  const { loginMethods = [] } = config

  const tabs = loginMethods.map((item) => ({
    key: item,
    label: LOGIN_METHODS_MAP[item],
    component: LOGIN_FORM_MAP[item],
  }))

  return {
    tabs,
    loading,
    handleLogin,
  }
}

export const GuardLayout = () => {
  const {
    state: {
      config: { defaultLoginMethod },
    },
  } = useGlobalContext()

  const [activeTab, setActiveTab] = useState(defaultLoginMethod!)
  const { tabs, loading, handleLogin } = useNormalLoginTabs(activeTab)

  return (
    <div className="authing-guard-layout">
      <div className="authing-guard-container">
        <GuardHeader />

        <Tabs
          onTabClick={(t) => setActiveTab(t as LoginMethods)}
          activeKey={activeTab}
          centered
        >
          {tabs.map((item) => {
            return (
              <Tabs.TabPane key={item.key} tab={item.label}>
                {item.component}
              </Tabs.TabPane>
            )
          })}
        </Tabs>

        <Button
          size="large"
          type="primary"
          loading={loading}
          onClick={handleLogin}
          block
        >
          登录
        </Button>
      </div>
    </div>
  )
}
