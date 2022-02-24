import { AuthenticationClient } from 'authing-js-sdk'
import version from '../version'
import { GuardLocalConfig } from './config'

let authClient: AuthenticationClient

export const initGuardAuthClient = (
  config: GuardLocalConfig,
  appId: string,
  websocketHost: string,
  tenantId?: string
) => {
  const host = config.host
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
        websocketHost: websocketHost,
      })
    } catch (error: any) {
      throw error
    }
  }

  return authClient
}

export const getGuardAuthClient = () => {
  if (!authClient) {
    throw new Error('Please initialize GuardAuthClient')
  }

  return authClient
}

export const useGuardAuthClient = () => getGuardAuthClient()
