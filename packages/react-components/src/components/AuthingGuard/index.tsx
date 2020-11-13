import { message } from 'antd'
import React, { FC } from 'react'
import { AuthenticationClient } from 'authing-js-sdk'

import { GuardContext } from '../../context/global/context'
import { GuardScenes } from '../../components/AuthingGuard/types'
import { requestClient } from '../../components/AuthingGuard/api/http'
import {
  defaultGuardConfig,
  NEED_MFA_CODE,
} from '../../components/AuthingGuard/constants'
import { GuardLayout } from '../../components/AuthingGuard/GuardLayout'
import {
  UserConfig,
  GuardEventsHandler,
} from '../../components/AuthingGuard/types/GuardConfig'

import './style.less'
import './assets/iconfont.css'

interface AuthingGuardProps extends GuardEventsHandler {
  userPoolId: string
  config?: UserConfig
  visible?: boolean
  className?: string
  id?: string
}

export const AuthingGuard: FC<AuthingGuardProps> = ({
  userPoolId,
  config = {},
  visible,
  className,
  id,
  ...guardEvents
}) => {
  const {
    apiHost = defaultGuardConfig.apiHost!,
    appId,
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
    userPoolId,
    host,
    appId,
    onError: (code, msg: any) => {
      if (code === 2020) {
        return
      }
      if (code === NEED_MFA_CODE) {
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
    <GuardContext
      value={{
        authClient,
        config: { ...config },
        userConfig: config,
        guardScenes: defaultScenes,
        activeTabs,
        guardTitle: config.title,
        mfaToken: '',
        userPoolId,
        guardEvents,
      }}
    >
      <GuardLayout id={id} className={className} visible={visible} />
    </GuardContext>
  )
}
