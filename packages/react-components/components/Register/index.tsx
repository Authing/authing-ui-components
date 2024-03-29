import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from 'antd'
import { ChangeLanguage } from '../ChangeLanguage'
import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithCode } from './core/WithCode'
import { getLoginTypePipe, tabSort } from '../_utils'
import { fallbackLng, i18n } from '../_utils/locales'
import {
  useGuardEvents,
  useGuardFinallyConfig,
  useGuardModule,
  useGuardPublicConfig,
} from '../_utils/context'
import { GuardLoginInitData } from '../Login/interface'
import { RegisterMethods } from '../Type/application'

export const GuardRegisterView: React.FC = () => {
  const events = useGuardEvents()

  const config = useGuardFinallyConfig()

  const { changeModule } = useGuardModule()

  const { t } = useTranslation()
  const agreementEnabled = config?.agreementEnabled
  const { langRange } = config
  const authClient = useGuardAuthClient()

  const publicConfig = useGuardPublicConfig()

  const verifyRegisterMethods = useMemo<string[]>(() => {
    const verifyLoginMethods = []
    const { registerMethods } = config
    if (registerMethods?.includes(RegisterMethods.EmailCode)) {
      verifyLoginMethods.push('email-code')
    }
    if (registerMethods?.includes(RegisterMethods.Phone)) {
      verifyLoginMethods.push('phone-code')
    }

    return verifyLoginMethods
  }, [config])

  const registerContextProps = useMemo(
    () => ({
      onRegisterSuccess: (
        data: any = {},
        registerInfo: {
          registerFrom: RegisterMethods
          account: string
        }, //以何种方式注册成功
        message?: string
      ) => {
        const initData = getLoginTypePipe(
          publicConfig,
          registerInfo.registerFrom
        )
        const loginInitData: GuardLoginInitData = {}
        if (initData) {
          loginInitData.specifyDefaultLoginMethod =
            initData.specifyDefaultLoginMethod

          initData?.lockMethod &&
            (loginInitData._lockMethod = initData.lockMethod)

          loginInitData._firstItemInitialValue = registerInfo.account
        }
        events?.onRegister?.(data, authClient)
        changeModule?.(GuardModuleType.LOGIN, loginInitData)
      },
      onRegisterFailed: (code: number, data: any = {}, message?: string) => {
        // if (message) Message.error(message)

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
            (agree) =>
              fallbackLng(i18n.language).find((lng) =>
                lng.includes(agree.lang)
              ) && agree?.availableAt !== 1
          ) ?? []
        : [],
      publicConfig: publicConfig,
      methods: verifyRegisterMethods,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      agreementEnabled,
      config?.agreements,
      events?.onBeforeRegister,
      i18n.language,
      verifyRegisterMethods,
    ]
  )

  const tabMapping: Record<
    string,
    { component: React.ReactNode; name: string }
  > = useMemo(() => {
    let verifyCodeLogin: string = ''
    if (verifyRegisterMethods.length > 1) {
      verifyCodeLogin = t('common.verifyCodeRegister')
    } else {
      if (verifyRegisterMethods.includes('phone-code')) {
        verifyCodeLogin = t('common.phoneVerifyCode')
      } else if (verifyRegisterMethods.includes('email-code')) {
        verifyCodeLogin = t('common.emailVerifyCode')
      } else {
        verifyCodeLogin = t('common.verifyCodeRegister')
      }
    }
    return {
      [RegisterMethods.Email]: {
        component: <RegisterWithEmail {...registerContextProps} />,
        name: t('common.PasswordRegister'),
      },
      [RegisterMethods.Phone]: {
        component: <RegisterWithCode {...registerContextProps} />,
        name: verifyCodeLogin,
      },
    }
  }, [registerContextProps, t, verifyRegisterMethods])

  const renderTab = useMemo(() => {
    const { registerMethods, defaultRegisterMethod } = config

    //  TODO 过滤支持的方式
    const supportRegisterMethods = registerMethods?.filter((method) =>
      [
        RegisterMethods.Email,
        RegisterMethods.EmailCode,
        RegisterMethods.Phone,
      ].includes(method)
    )
    const showRegisterMethods = [
      ...new Set(
        supportRegisterMethods?.map((method) => {
          switch (method) {
            case RegisterMethods.EmailCode:
            case RegisterMethods.Phone:
              return RegisterMethods.Phone
            case RegisterMethods.Email:
              return RegisterMethods.Email
            default:
              return method
          }
        })
      ),
    ]

    return tabSort(defaultRegisterMethod!, showRegisterMethods!)?.map(
      (method) => (
        <Tabs.TabPane tab={tabMapping[method].name} key={method}>
          {tabMapping[method].component}
        </Tabs.TabPane>
      )
    )
  }, [config, tabMapping])

  return (
    <div className="g2-view-container g2-view-register">
      <div className="g2-view-container-inner">
        <div className="g2-view-header">
          <img src={config?.logo} alt="" className="icon" />

          <div className="title">{config?.title}</div>
        </div>
        <div className="g2-view-tabs">
          <Tabs
            destroyInactiveTabPane={true}
            defaultActiveKey={config?.defaultRegisterMethod}
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
