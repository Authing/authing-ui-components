import { Tabs } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import React, { useMemo } from 'react'
import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithPhone } from './core/WithPhone'
import { GuardRegisterProps } from './props'
import './styles.less'

export const GuardRegister: React.FC<GuardRegisterProps> = ({
  config,
  __changeModule,
  ...registerEvents
}) => {
  const agreementEnabled = config?.agreementEnabled

  const authClient = useAuthClient()

  const registerContextProps = useMemo(
    () => ({
      onRegister: (user: User) => {
        registerEvents.onRegister?.(user, authClient)
      },
      onRegisterError: (error: any) => {
        registerEvents.onRegisterError?.(error)
      },
      agreements: agreementEnabled ? config?.agreements ?? [] : [],
      onBeforeRegister: registerEvents.onBeforeRegister,
    }),
    [agreementEnabled, authClient, config?.agreements, registerEvents]
  )

  const tabMapping: Record<
    RegisterMethods,
    { component: React.ReactNode; name: string }
  > = useMemo(
    () => ({
      [RegisterMethods.Email]: {
        component: <RegisterWithEmail {...registerContextProps} />,
        name: '邮箱',
      },
      [RegisterMethods.Phone]: {
        component: <RegisterWithPhone {...registerContextProps} />,
        name: '手机',
      },
    }),
    [registerContextProps]
  )

  const renderTab = useMemo(
    () =>
      config?.registerMethods?.map((method) => (
        <Tabs.TabPane tab={tabMapping[method].name} key={method}>
          {tabMapping[method].component}
        </Tabs.TabPane>
      )),
    [config?.registerMethods, tabMapping]
  )

  return (
    <div className="g2-register-container">
      <div className="g2-register-header">
        <img src={config?.logo} alt="" className="icon" />

        <div className="title">欢迎加入 {config?.title}</div>
      </div>
      <div className="g2-register-tabs">
        <Tabs
          defaultActiveKey={config?.defaultRegisterMethod}
          onChange={(activeKey) => {
            registerEvents.onRegisterTabChange?.(activeKey as RegisterMethods)
          }}
        >
          {renderTab}
        </Tabs>
      </div>
      <div className="tipsLine">
        <div
          className="linklike"
          onClick={() => __changeModule?.(GuardModuleType.FORGETPASSWORD, {})}
        >
          忘记密码
        </div>
        <span
          className="login-tip"
          onClick={() => __changeModule?.(GuardModuleType.LOGIN, {})}
        >
          <span className="gray">已有账号，</span>
          <span className="linklike">返回登录</span>
        </span>
      </div>
    </div>
  )
}
