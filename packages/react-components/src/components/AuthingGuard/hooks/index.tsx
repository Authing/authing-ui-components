import {
  AuthenticationClient,
  AuthenticationClientOptions,
} from 'authing-js-sdk'
import JSEncrypt from 'jsencrypt'
import { defaultGuardConfig } from '../constants'

let authClient: AuthenticationClient | null = null

export interface AuthClientConfig extends AuthenticationClientOptions {
  appDomain?: string
  isSSO?: boolean
}

export const initAuthClient = (config: AuthClientConfig) => {
  if (authClient) {
    return authClient
  }

  if (!config.host) {
    config.host = defaultGuardConfig.apiHost
  }

  if (config.appDomain && config.isSSO) {
    const parsedUrl = new URL(config.host!)
    config.host = `${parsedUrl.protocol}//${config.appDomain}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`
  }

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
