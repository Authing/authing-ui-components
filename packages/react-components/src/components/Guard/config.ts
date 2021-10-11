import {
  LoginMethods,
  RegisterMethods,
  SocialConnectionProvider,
} from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'
import { Lang } from 'authing-js-sdk/build/main/types'
import merge from 'lodash/merge'
import { FrameType } from 'src/FrameType'
import { initI18n } from 'src/locales'
import { getGuardHttp, initGuardHttp } from 'src/utils/guradHttp'
import { AuthingResponse } from 'src/utils/http'
import { ApplicationConfig } from '../AuthingGuard/api'
import { DefaultConfig, defaultConfig } from './defaultConfig'

export enum GuardMode {
  Modal = 'modal',
  Normal = 'normal',
}

export enum GuardScenes {
  Login = 'login',
  Register = 'register',
}

export interface LocalesConfig {
  defaultLang?: Lang
  isShowChange?: boolean
  onChange?: (lang: Lang) => void
}

export interface Headers {
  'userpool-id': string
  'app-id': string
  'sdk-version': string
  'request-from': string
  lang: string
}

export interface BaseConfig {
  title?: string
  logo?: string
  contentCss?: string
  mode?: GuardMode
  target?: HTMLElement
  clickCloseable?: boolean
  escCloseable?: boolean
  defaultScenes?: GuardScenes
  isSSO?: boolean
  lang?: Lang
  localesConfig?: LocalesConfig
  host?: string
  headers?: Headers
}

export interface LoginConfig {
  loginMethods?: LoginMethods[]
  defaultLoginMethod?: LoginMethods
  socialConnections?: SocialConnectionProvider[]
  enterpriseConnections?: string[]
  autoRegister?: boolean
  disableResetPwd?: boolean
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
}

export interface RegisterConfig {
  registerMethods?: RegisterMethods[]
  defaultRegisterMethod?: RegisterMethods
  disableRegister?: boolean
}

export interface GuardConfig {
  base?: BaseConfig
  login?: LoginConfig
  registe?: RegisterConfig
}

export const initConfig = async (
  config: GuardConfig = {},
  appId: string,
  frame?: FrameType
) => {
  // 优先合并下默认值
  const defaultConfig = mergeDefaultConfig(config)

  const {
    base: { localesConfig = {}, lang, host },
  } = defaultConfig

  // init i18n
  initI18n(localesConfig, lang)

  // initHttp
  const httpClient = initGuardHttp(host)
  httpClient.setAppId(appId)
  // 默认给一个 Reacat
  httpClient.setFrame(frame ?? FrameType.React)

  // 拿一下 PublicConfig
  const publicConfig = await getPublicConfig(appId)

  // userpoolId 拿到之后赶紧放到 请求里面
  httpClient.setUserpoolId(publicConfig.userPoolId)

  const finalConfig = mergePublicConfig(defaultConfig, publicConfig)

  return finalConfig
}

const mergeDefaultConfig: (config: GuardConfig) => DefaultConfig = (config) => {
  return merge(defaultConfig, config)
}

const mergePublicConfig = (
  mergedConfig: DefaultConfig,
  publicConfig: ApplicationConfig
): GuardConfig => {
  return mergedConfig
}

const getPublicConfig: (appId: string) => Promise<ApplicationConfig> = async (
  appId
) => {
  let res: AuthingResponse<ApplicationConfig>

  try {
    res = await getGuardHttp().get<ApplicationConfig>(
      `/api/v2/applications/${appId}/public-config`
    )
  } catch (error) {
    console.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data)
    throw new Error(res?.message ?? 'Please check your config')

  return res.data
}
