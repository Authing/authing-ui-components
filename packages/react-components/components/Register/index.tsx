import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { message, Tabs } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import { ChangeLanguage } from '../ChangeLanguage'
import { useAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithPhone } from './core/WithPhone'
import { GuardRegisterViewProps } from './props'
import { codeMap } from './codemap'

export const GuardRegisterView: React.FC<GuardRegisterViewProps> = ({
  config,
  onLangChange,
  __changeModule,
  ...registerEvents
}) => {
  const { t } = useTranslation()
  const agreementEnabled = config?.agreementEnabled
  const { langRange } = config
  const authClient = useAuthClient()

  const __codePaser = (code: number) => {
    const action = codeMap[code]

    if (code === 200) {
      return (user: User) => {
        // TODO 用户信息补全 等待后端接口修改
        if (config.__publicConfig__!.extendsFieldsEnabled) {
          __changeModule?.(GuardModuleType.COMPLETE_INFO, {})
        } else {
          registerEvents.onRegister?.(user, authClient)
          __changeModule?.(GuardModuleType.LOGIN, {})
        }
      }
    }

    if (!action) {
      return (initData?: any) => {
        message.error(initData?._message)
        console.error('未捕获 code', code)
      }
    }

    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?._message)
      }
    }
  }

  const registerContextProps = useMemo(
    () => ({
      onRegister: (code: number, data: any = {}, message?: string) => {
        const callback = __codePaser(code)

        if (code !== 200) {
          registerEvents.onRegisterError?.({
            code,
            data,
            message,
          })
        }

        callback?.({
          ...data,
          _message: message,
        })
      },
      onBeforeRegister: registerEvents.onBeforeRegister,
      agreements: agreementEnabled ? config?.agreements ?? [] : [],
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
        name: t('common.emailLabel'),
      },
      [RegisterMethods.Phone]: {
        component: <RegisterWithPhone {...registerContextProps} />,
        name: t('common.phoneLabel'),
      },
    }),
    [registerContextProps, t]
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

        <div className="title">
          {t('common.welcomeJoin', { name: config?.title })}
        </div>
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
        <span className="back-to-login">
          <span className="gray">{t('common.alreadyHasAcc')}</span>
          <span
            className="link-like"
            onClick={() => __changeModule?.(GuardModuleType.LOGIN, {})}
          >
            {t('common.backLoginPage')}
          </span>
        </span>
      </div>
      <ChangeLanguage langRange={langRange} onLangChange={onLangChange} />
    </div>
  )
}
