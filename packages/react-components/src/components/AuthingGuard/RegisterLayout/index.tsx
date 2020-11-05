import { Tabs } from 'antd'
import { User } from 'authing-js-sdk'
import React, { FC, useState } from 'react'

import { useGuardContext } from '@/context/global/context'
import { RegisterMethods } from '@/components/AuthingGuard/types'
import { AuthingTabs } from '@/components/AuthingGuard/AuthingTabs'
import { REGISTER_METHODS_MAP } from '@/components/AuthingGuard/constants'
import {
  EmailRegisterForm,
  PhoneRegisterForm,
} from '@/components/AuthingGuard/Forms'

export const RegisterLayout: FC = () => {
  const {
    state: {
      config: { registerMethods, defaultRegisterMethod },
    },
  } = useGuardContext()

  const [activeTab, setActiveTab] = useState(defaultRegisterMethod!)

  const onSuccess = (user: User) => {
    console.log('注册成功', user)
  }

  const onFail = (error: any) => {
    console.log(error)
  }

  const formProps = {
    onSuccess,
    onFail,
  }

  const REGISTER_FORM_MAP = {
    [RegisterMethods.Email]: <EmailRegisterForm {...formProps} />,
    [RegisterMethods.Phone]: <PhoneRegisterForm {...formProps} />,
  }

  const tabs = registerMethods!.map((item) => ({
    key: item,
    label: REGISTER_METHODS_MAP[item],
    component: REGISTER_FORM_MAP[item],
  }))

  return (
    <AuthingTabs
      size="large"
      onTabClick={(t) => setActiveTab(t as RegisterMethods)}
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
