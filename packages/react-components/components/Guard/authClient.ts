import { AuthenticationClient } from 'authing-js-sdk'

import packageConfig from '../../package.json'
import { GuardLocalConfig } from './config'

let authClient: AuthenticationClient

export const initAuthClient = (config: GuardLocalConfig, appId: string) => {
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
          // if ([].includes(code)) message.error(msg)

          console.error(code, msg)
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
