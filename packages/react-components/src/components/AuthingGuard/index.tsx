import React, { FC } from 'react'
import { message } from 'antd'
import { AuthenticationClient } from 'authing-js-sdk'

import { GlobalContext } from '@/context/global/context'
import { GuardConfig } from '@/components/AuthingGuard/types/GuardConfig'
import { NEED_MFA_CODE } from '@/components/AuthingGuard/constants'
import { GuardLayout } from '@/components/AuthingGuard/GuardLayout'

interface AuthingGuardProps {
  userPoolId: string
  config?: GuardConfig
}

export const AuthingGuard: FC<AuthingGuardProps> = ({
  userPoolId,
  config = {},
}) => {
  const { apiHost, appId } = config

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

  return (
    <GlobalContext value={{ authClient, config }}>
      <GuardLayout />
    </GlobalContext>
  )
}
