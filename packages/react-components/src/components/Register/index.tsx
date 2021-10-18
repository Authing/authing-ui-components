import { Radio } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import React, { useMemo, useState } from 'react'
import { useAuthClient } from '../Guard/authClient'
import { WithEmail } from './core/WithEmail'
import { WithPhone } from './core/WithPhone'
import { GuardRegisterProps } from './props'
import './styles.less'

export const GuardRegister: React.FC<GuardRegisterProps> = ({
  config,
  onRegister,
}) => {
  const [currentTab, setCurrentTab] = useState<RegisterMethods>(
    config?.defaultRegisterMethod!
  )

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
        <Radio.Button value={method} key={method}>
          {tabMapping[method].name}
        </Radio.Button>
      )),
    [config?.registerMethods, tabMapping]
  )

  const renderTabContent = useMemo(() => tabMapping[currentTab].component, [
    currentTab,
    tabMapping,
  ])

  return (
    <div className="g2-register-container">
      <Radio.Group
        className="authing-g2-button-group"
        value={currentTab}
        onChange={(e) => setCurrentTab(e.target.value)}
      >
        {renderTab}
      </Radio.Group>
      {renderTabContent}
    </div>
  )
}
