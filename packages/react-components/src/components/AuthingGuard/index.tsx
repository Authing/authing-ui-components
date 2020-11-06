import { message } from 'antd'
import React, { FC } from 'react'
import { AuthenticationClient } from 'authing-js-sdk'

import { GuardContext } from '@/context/global/context'
import { GuardScenes } from '@/components/AuthingGuard/types'
import { requestClient } from '@/components/AuthingGuard/api/http'
import { NEED_MFA_CODE } from '@/components/AuthingGuard/constants'
import { GuardLayout } from '@/components/AuthingGuard/GuardLayout'
import { GuardConfig } from '@/components/AuthingGuard/types/GuardConfig'

import './style.less'
import './assets/iconfont.css'

interface AuthingGuardProps {
  userPoolId: string
  config?: GuardConfig
}

export const AuthingGuard: FC<AuthingGuardProps> = ({
  userPoolId,
  config = {},
}) => {
  const {
    apiHost = 'https://core.auting.cn',
    appId,
    defaultLoginMethod,
    defaultScenes,
    defaultRegisterMethod,
  } = config

  requestClient.setBaseUrl(apiHost)

  const authClient = new AuthenticationClient({
    userPoolId,
    host: apiHost,
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
        config: {...config},
        userConfig: config,
        guardScenes: defaultScenes,
        activeTabs,
        guardTitle: config.title,
        mfaToken: '',
        userPoolId,
      }}
    >
      <GuardLayout />
    </GuardContext>
  )
}
