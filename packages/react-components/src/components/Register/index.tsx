import { Tabs } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import React, { useMemo } from 'react'
import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { WithEmail } from './core/WithEmail'
import { WithPhone } from './core/WithPhone'
import { GuardRegisterProps } from './props'
import './styles.less'

export const GuardRegister: React.FC<GuardRegisterProps> = ({
  config,
  onRegister,
  __changeModule,
}) => {
  const agreementEnabled = config?.agreementEnabled

  const authClient = useAuthClient()

  const tabMapping: Record<
    RegisterMethods,
    { component: React.ReactNode; name: string }
  > = useMemo(
    () => ({
      [RegisterMethods.Email]: {
        component: (
          <WithEmail
            onRegister={(user: User) => {
              console.log('注册成功', user)
              onRegister?.(user, authClient)
            }}
            onRegisterError={(error: any) => {
              console.log(error)
            }}
            agreements={agreementEnabled ? config?.agreements ?? [] : []}
          />
        ),
        name: '邮箱',
      },
      [RegisterMethods.Phone]: {
        component: (
          <WithPhone
            onRegister={() => {}}
            onRegisterError={() => {}}
            agreements={agreementEnabled ? config?.agreements ?? [] : []}
          />
        ),
        name: '手机',
      },
    }),
    [agreementEnabled, authClient, config?.agreements, onRegister]
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
        <Tabs>{renderTab}</Tabs>
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
