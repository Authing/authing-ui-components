import { AuthenticationClient } from 'authing-js-sdk'
import version from '../version'
import { GuardLocalConfig } from './config'

let authClient: AuthenticationClient

export const initAuthClient = (
  config: GuardLocalConfig,
  appId: string,
  tenantId?: string
) => {
  const host = config.__appHost__ ?? config.host
  const lang = config.lang

  if (!authClient) {
    try {
      authClient = new AuthenticationClient({
        appHost: host,
        tenantId: tenantId,
        appId,
        lang,
        requestFrom: `Guard@${version}`,
        onError: (code, msg: any) => {
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
