import message from 'antd/lib/message'
import { AuthenticationClient } from 'authing-js-sdk'
import { ErrorCode } from 'src/utils/GuardErrorCode'
import { defaultConfig, GuardConfig } from './config'
import packageConfig from '../../../package.json'

let authClient: AuthenticationClient

export const initAuthClient = (config: GuardConfig = {}, appId: string) => {
  const host = config.base?.host ?? defaultConfig.base.host
  const lang = config.base?.lang ?? defaultConfig.base.lang

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
          if ([ErrorCode.OTP_MFA_CODE, ErrorCode.APP_MFA_CODE].includes(code)) {
            message.info(msg)
            return
          }
          message.error(msg)
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
