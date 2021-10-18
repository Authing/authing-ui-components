import { AuthenticationClient } from 'authing-js-sdk'
import { GuardConfig } from 'src/utils/config'

import packageConfig from '../../../package.json'

let authClient: AuthenticationClient

export const initAuthClient = (config: GuardConfig = {}, appId: string) => {
  const host = config.host
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
