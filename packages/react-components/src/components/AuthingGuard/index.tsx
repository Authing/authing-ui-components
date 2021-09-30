import { ConfigProvider, message } from 'antd'
import React, { FC } from 'react'
import { AuthenticationClient } from 'authing-js-sdk'

import { GuardContext } from '../../context/global/context'
import { GuardScenes } from '../../components/AuthingGuard/types'
import { requestClient } from '../../components/AuthingGuard/api/http'
import {
  defaultGuardConfig,
  OTP_MFA_CODE,
  APP_MFA_CODE,
  defaultLocalesConfig,
  defaultHeaders,
} from '../../components/AuthingGuard/constants'
import { GuardLayout } from '../../components/AuthingGuard/GuardLayout'
import {
  UserConfig,
  GuardEventsHandler,
} from '../../components/AuthingGuard/types/GuardConfig'

import './style.less'
import { initI18n } from './locales'
const PREFIX_CLS = 'authing-ant'

message.config({
  prefixCls: `${PREFIX_CLS}-message`,
})

interface AuthingGuardProps extends GuardEventsHandler {
  appId: string
  config?: UserConfig
  visible?: boolean
  className?: string
  id?: string
}

export const AuthingGuard: FC<AuthingGuardProps> = ({
  appId,
  config = {},
  visible,
  className,
  id,
  ...guardEvents
}) => {
  const {
    apiHost,
    appDomain,
    appHost,
    defaultLoginMethod = defaultGuardConfig.defaultLoginMethod,
    defaultScenes = defaultGuardConfig.defaultScenes,
    defaultRegisterMethod = defaultGuardConfig.defaultRegisterMethod,
    lang,
    localesConfig = defaultLocalesConfig,
    headers = defaultHeaders,
  } = config

  initI18n(localesConfig, lang)

  let realHost: string | undefined
  if (appHost) {
    realHost = appHost
  } else if (appDomain) {
    const parsedUrl = new URL(defaultGuardConfig.appHost!)
    realHost = `${parsedUrl.protocol}//${appDomain}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`
  } else {
    realHost = apiHost || defaultGuardConfig.appHost!
  }

  requestClient.setBaseUrl(realHost)
  requestClient.setLangHeader(headers?.lang)

  const authClient = new AuthenticationClient({
    appHost: realHost!,
    appId,
    requestFrom: 'ui-components',
    lang: localesConfig.defaultLang ?? lang,
    headers,
    onError: (code, msg: any) => {
      if (code === 2020) {
        return
      }
      if ([OTP_MFA_CODE, APP_MFA_CODE].includes(code)) {
        message.info(msg)
        return
      }
      message.error(msg)
    },
  })

  const activeTabs = {
    [GuardScenes.Login]: defaultLoginMethod,
    [GuardScenes.Register]: defaultRegisterMethod,
  }

  return (
    <ConfigProvider prefixCls={PREFIX_CLS}>
      <GuardContext
        value={{
          authClient,
          config: { ...config },
          userConfig: config,
          appId,
          guardScenes: defaultScenes,
          activeTabs,
          guardTitle: config.title,
          mfaData: {
            mfaToken: '',
          },
          guardEvents,
          localesConfig: config.localesConfig,
          realHost: realHost,
          guardSize: 'middle',
          showHeader: true,
          showBottom: true,
        }}
      >
        <GuardLayout
          id={id}
          className={className}
          visible={visible}
          lang={lang}
          userConfig={config}
        />
      </GuardContext>
    </ConfigProvider>
  )
}
