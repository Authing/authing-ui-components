import { ConfigProvider, message } from 'antd'
import React, { FC } from 'react'
import jsencrypt from 'jsencrypt'
import { AuthenticationClient } from 'authing-js-sdk'

import { GuardContext } from '../../context/global/context'
import { GuardScenes } from '../../components/AuthingGuard/types'
import { requestClient } from '../../components/AuthingGuard/api/http'
import {
  defaultGuardConfig,
  OTP_MFA_CODE,
  APP_MFA_CODE,
} from '../../components/AuthingGuard/constants'
import { GuardLayout } from '../../components/AuthingGuard/GuardLayout'
import {
  UserConfig,
  GuardEventsHandler,
} from '../../components/AuthingGuard/types/GuardConfig'

import './style.less'

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
    apiHost = defaultGuardConfig.apiHost!,
    appDomain,
    isSSO,
    defaultLoginMethod = defaultGuardConfig.defaultLoginMethod,
    defaultScenes = defaultGuardConfig.defaultScenes,
    defaultRegisterMethod = defaultGuardConfig.defaultRegisterMethod,
  } = config

  let host = apiHost
  if (appDomain && isSSO) {
    const parsedUrl = new URL(apiHost)
    host = `${parsedUrl.protocol}//${appDomain}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`
  }

  requestClient.setBaseUrl(host)

  const authClient = new AuthenticationClient({
    host,
    appId,
    requestFrom: 'ui-components',
    encryptFunction: (text, publicKey) => {
      const encrypt = new jsencrypt() // 实例化加密对象
      encrypt.setPublicKey(publicKey) // 设置公钥
      return Promise.resolve(encrypt.encrypt(text)) // 加密明文
    },
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
        }}
      >
        <GuardLayout id={id} className={className} visible={visible} />
      </GuardContext>
    </ConfigProvider>
  )
}
