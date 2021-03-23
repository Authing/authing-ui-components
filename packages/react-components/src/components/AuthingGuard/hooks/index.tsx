import {
  AuthenticationClient,
  AuthenticationClientOptions,
} from 'authing-js-sdk'
import JSEncrypt from 'jsencrypt'
import { defaultGuardConfig } from '../constants'

let authClient: AuthenticationClient | null = null

export interface AuthClientConfig extends AuthenticationClientOptions {
  /**
   * @deprecated 使用 appHost
   */
  appDomain?: string
  /**
   * @deprecated 无需传入
   */
  isSSO?: boolean
  /**
   * @deprecated 使用 appHost
   */
  host?: string
}

export const initAuthClient = (config: AuthClientConfig) => {
  if (authClient) {
    return authClient
  }

  const { appHost, appDomain, host } = config

  /**
   * 兼容之前的参数
   */
  let realHost
  if (appHost) {
    realHost = appHost
  } else if (appDomain) {
    const parsedUrl = new URL(host || defaultGuardConfig.appHost!)
    realHost = `${parsedUrl.protocol}//${appDomain}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`
  } else if (host) {
    realHost = host
  } else {
    realHost = defaultGuardConfig.appHost
  }
  config.appHost = realHost!

  config.encryptFunction = (text, publicKey) => {
    const encrypt = new JSEncrypt() // 实例化加密对象
    encrypt.setPublicKey(publicKey) // 设置公钥
    return Promise.resolve(encrypt.encrypt(text)) // 加密明文
  }
  authClient = new AuthenticationClient(config)

  return authClient
}

export const useAuthing = (config?: AuthClientConfig) => {
  return { authClient: getAuthClient(config) }
}

export const getAuthClient = (config?: AuthClientConfig) => {
  if (!authClient && !config) {
    throw new Error(
      'Please `initAuthClient` first or pass `AuthClientConfig` to useAuthing.'
    )
  }

  if (config) {
    initAuthClient(config)
  }

  return authClient
}
