import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from 'antd'
import { RegisterMethods } from 'authing-js-sdk'
import { ChangeLanguage } from '../ChangeLanguage'
import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithPhone } from './core/WithPhone'
import { RegisterWithEmailCode } from './core/WithEmailCode'
import { tabSort } from '../_utils'
import { i18n } from '../_utils/locales'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
import { VerifyLoginMethods } from '../AuthingGuard/api'

export const GuardRegisterView: React.FC = () => {
  const events = useGuardEvents()

  const config = useGuardFinallyConfig()

  const { changeModule } = useGuardModule()

  const { t } = useTranslation()
  const agreementEnabled = config?.agreementEnabled
  const { langRange } = config
  const authClient = useGuardAuthClient()

  const publicConfig = useGuardPublicConfig()

  const verifyLoginMethods = useMemo<VerifyLoginMethods[]>(
    () =>
      publicConfig?.verifyCodeTabConfig?.enabledLoginMethods ?? ['phone-code'],
    [publicConfig?.verifyCodeTabConfig?.enabledLoginMethods]
  )

  const registerContextProps = useMemo(
    () => ({
      onRegisterSuccess: (data: any = {}, message?: string) => {
        events?.onRegister?.(data, authClient)
        changeModule?.(GuardModuleType.LOGIN, {})
      },
      onRegisterFailed: (code: number, data: any = {}, message?: string) => {
        events?.onRegisterError?.({
          code,
          data,
          message,
        })
      },
      registeContext: config.registerContext,
      onBeforeRegister: events?.onBeforeRegister,
      //availableAt 0或者null-注册时，1-登录时，2-注册和登录时
      agreements: agreementEnabled
        ? config?.agreements?.filter(
            (agree) => agree.lang === i18n.language && agree?.availableAt !== 1
          ) ?? []
        : [],
      publicConfig: publicConfig,
      verifyLoginMethods: verifyLoginMethods,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      agreementEnabled,
      config?.agreements,
      events?.onBeforeRegister,
      i18n.language,
      verifyLoginMethods,
    ]
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
      emailCode: {
        component: <RegisterWithEmailCode {...registerContextProps} />,
        name: t('common.emailLabel'),
      },
    }),
    [registerContextProps, t]
  )

  const renderTab = useMemo(() => {
    const { registerMethods, defaultRegisterMethod } = config
    // todo tabs emailCode 默认值问题
    return tabSort(defaultRegisterMethod!, registerMethods!)?.map((method) => (
      <Tabs.TabPane tab={tabMapping[method].name} key={method}>
        {tabMapping[method].component}
      </Tabs.TabPane>
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.defaultRegisterMethod, tabMapping])

  return (
    <div className="g2-view-container g2-view-register">
      <div className="g2-view-container-inner">
        <div className="g2-view-header">
          <img src={config?.logo} alt="" className="icon" />

          <div className="title">{config?.title}</div>
        </div>
        <div className="g2-view-tabs">
          <Tabs
            // email 对应的 tab 可能是 emailCode 或者 email 因为两者模式在控制台互斥 所以在默认tab的判断中需要find一下
            defaultActiveKey={config?.registerMethods?.find((item: string) =>
              item.includes(config?.defaultRegisterMethod || '')
            )}
            onChange={(activeKey) => {
              events?.onRegisterTabChange?.(activeKey as RegisterMethods)
            }}
          >
            {renderTab}
          </Tabs>
        </div>
        <div className="g2-tips-line">
          <span className="back-to-login">
            {/* <span className="gray">{t('common.alreadyHasAcc')}</span> */}
            <span
              className="link-like"
              onClick={() => changeModule?.(GuardModuleType.LOGIN, {})}
            >
              {t('common.backLoginPage')}
            </span>
          </span>
        </div>
      </div>
      <ChangeLanguage
        langRange={langRange}
        onLangChange={events?.onLangChange}
      />
    </div>
  )
}
