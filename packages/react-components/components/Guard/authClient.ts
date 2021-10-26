import { message } from 'antd'
import { AuthenticationClient } from 'authing-js-sdk'
import { ErrorCode } from '../_utils/GuardErrorCode'

import packageConfig from '../../package.json'
import { GuardConfig } from './config'

let authClient: AuthenticationClient

export const initAuthClient = (config: GuardConfig, appId: string) => {
  const host = config.__appHost__ ?? config.host
  const lang = config.lang

  if (!authClient) {
    try {
      authClient = new AuthenticationClient({
        appHost: host,
        appId,
        lang,
        requestFrom: `Guard-${packageConfig.framework}@${packageConfig.version}`,
        onError: (code, msg: any) => {
          if (code === 2020) {
            return
          }

          if ([ErrorCode.USER_EXISTENCE].includes(code)) {
            message.error(msg)
          } else {
            message.error(msg)
          }

          // if ([ErrorCode.OTP_MFA_CODE, ErrorCode.APP_MFA_CODE].includes(code)) {
          //   message.info(msg)
          //   return
          // }
          // message.error(msg)
        },
      })
    } catch (error) {
      throw error
    }
  }

  return authClient
}

export const getAuthClient = () => {
  if (!authClient) {
    throw new Error('Please initialize AuthClient')
  }

  return authClient
}

export const useAuthClient = () => getAuthClient()
