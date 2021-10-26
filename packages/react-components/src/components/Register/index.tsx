import { message, Tabs } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import React, { useMemo } from 'react'
import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { codeMap } from './codemap'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithPhone } from './core/WithPhone'
import { GuardRegisterViewProps } from './props'

export const GuardRegisterView: React.FC<GuardRegisterViewProps> = ({
  config,
  __changeModule,
  ...registerEvents
}) => {
  const agreementEnabled = config?.agreementEnabled

  const authClient = useAuthClient()

  const __codePaser = (code: number) => {
    if (code === 200) {
      return (user: User) => {
        registerEvents.onRegister?.(user, authClient)
        __changeModule?.(GuardModuleType.LOGIN, {})
      }
    }

    const action = codeMap[code]

    if (!action) {
      return () => {
        console.error('GuardRegister 未捕获 code', code)
      }
    }

    if (action?.action === 'changeModule') {
      let m = action.module ? action.module : GuardModuleType.ERROR
      return (initData?: any) => __changeModule?.(m, initData)
    }

    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?.__message)
      }
    }

    // 最终结果
    return () => {
      console.error('last action at loginview')
    }
  }

  const registerContextProps = useMemo(
    () => ({
      onRegister: (code: number, data: any = {}, message?: string) => {
        const callback = __codePaser(code)

        callback({
          ...data,
          _message: message,
        })
      },
      onBeforeRegister: registerEvents.onBeforeRegister,
      agreements: agreementEnabled ? config?.agreements ?? [] : [],
      customPasswordStrength: config.__publicConfig__?.customPasswordStrength,
      passwordStrength: config.__publicConfig__?.passwordStrength,
      publicConfig: config.__publicConfig__,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agreementEnabled, config?.agreements, registerEvents.onBeforeRegister]
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
    <div className="g2-view-container">
      <div className="g2-view-header">
        <img src={config?.logo} alt="" className="icon" />

        <div className="title">欢迎加入 {config?.title}</div>
      </div>
      <div className="g2-view-tabs">
        <Tabs
          defaultActiveKey={config?.defaultRegisterMethod}
          onChange={(activeKey) => {
            registerEvents.onRegisterTabChange?.(activeKey as RegisterMethods)
          }}
        >
          {renderTab}
        </Tabs>
      </div>
      <div className="g2-tips-line">
        <div
          className="link-like"
          onClick={() => __changeModule?.(GuardModuleType.FORGETPASSWORD, {})}
        >
          忘记密码
        </div>
        <span
          className="back-to-login"
          onClick={() => __changeModule?.(GuardModuleType.LOGIN, {})}
        >
          <span className="gray">已有账号，</span>
          <span className="link-like">返回登录</span>
        </span>
      </div>
    </div>
  )
}
