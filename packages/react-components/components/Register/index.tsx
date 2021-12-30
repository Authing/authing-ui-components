import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { message, Tabs } from 'antd'
import { RegisterMethods, User } from 'authing-js-sdk'
import { ChangeLanguage } from '../ChangeLanguage'
import { useGuardAuthClient } from '../Guard/authClient'
import { GuardModuleType } from '../Guard/module'
import { RegisterWithEmail } from './core/WithEmail'
import { RegisterWithPhone } from './core/WithPhone'
import { GuardRegisterViewProps } from './interface'
import { codeMap } from './codemap'
import { shoudGoToComplete, tabSort } from '../_utils'
import { i18n } from '../_utils/locales'

export const GuardRegisterView: React.FC<GuardRegisterViewProps> = ({
  config,
  onLangChange,
  __changeModule,
  ...registerEvents
}) => {
  const { t } = useTranslation()
  const agreementEnabled = config?.agreementEnabled
  const { langRange } = config
  const authClient = useGuardAuthClient()

  const __codePaser = (code: number) => {
    const action = codeMap[code]

    if (code === 200) {
      return (user: User) => {
        // TODO 用户信息补全 等待后端接口修改
        if (shoudGoToComplete(user, 'register', config.__publicConfig__)) {
          __changeModule?.(GuardModuleType.COMPLETE_INFO, {
            context: 'register',
            user: user,
          })
        } else {
          registerEvents.onRegister?.(user, authClient)
          __changeModule?.(GuardModuleType.LOGIN, {})
        }
      }
    }

    if (!action) {
      return (initData?: any) => {
        message.error(
          initData?._message === 'Network Error'
            ? t('common.error4network')
            : initData?._message
        )
        console.error('未捕获 code', code)
      }
    }

    if (action?.action === 'message') {
      return (initData?: any) => {
        message.error(initData?._message)
      }
    }
    // 错误拦截
    if (action?.action === 'errorIntercept') {
      return (initData?: any) => {
        message.error(t('common.unknownError'))
      }
    }
    // 最终结果
    return () => {
      console.error('last action at register')
    }
  }

  const registerContextProps = useMemo(
    () => ({
      onRegister: (code: number, data: any = {}, message?: string) => {
        console.log('注册 onRegister')
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
      //availableAt 0或者null-注册时，1-登录时，2-注册和登录时
      agreements: agreementEnabled
        ? config?.agreements?.filter(
            (agree) => agree.lang === i18n.language && agree?.availableAt !== 1
          ) ?? []
        : [],
      publicConfig: config.__publicConfig__,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      agreementEnabled,
      config?.agreements,
      registerEvents.onBeforeRegister,
      i18n.language,
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
    }),
    [registerContextProps, t]
  )

  const renderTab = useMemo(() => {
    const { registerMethods, defaultRegisterMethod } = config
    return tabSort(defaultRegisterMethod, registerMethods)?.map((method) => (
      <Tabs.TabPane tab={tabMapping[method].name} key={method}>
        {tabMapping[method].component}
      </Tabs.TabPane>
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.defaultRegisterMethod, tabMapping])

  return (
    <div className="g2-view-container">
      <div className="g2-view-header">
        <img src={config?.logo} alt="" className="icon" />

        <div className="title">
          {t('common.welcomeJoin', { name: config?.title })}
        </div>
      </div>
      <div className="g2-view-tabs">
        {console.log(config, 'config?.defaultRegisterMethod}')}
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
          {/* <span className="gray">{t('common.alreadyHasAcc')}</span> */}
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
