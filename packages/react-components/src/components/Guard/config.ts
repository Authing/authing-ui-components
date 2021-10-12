import {
  LoginMethods,
  RegisterMethods,
  SocialConnectionProvider,
} from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'
import { Lang } from 'authing-js-sdk/build/main/types'
import merge from 'lodash/merge'
import { useEffect, useState } from 'react'
import { FrameType } from 'src/FrameType'
import { initI18n } from 'src/locales'
import { getGuardHttp, initGuardHttp } from 'src/utils/guradHttp'
import { AuthingResponse } from 'src/utils/http'
import { ApplicationConfig, PasswordLoginMethods } from '../AuthingGuard/api'

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
  passwordLoginMethods?: PasswordLoginMethods[]
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

export interface DefaultBaseConfig extends BaseConfig {
  lang: Lang
  host: string
  logo: string
  title: string
  isSSO: boolean
  mode: GuardMode
  escCloseable: boolean
  clickCloseable: boolean
  defaultScenes: GuardScenes
  headers: Headers
}

const defaultBaseConfig: DefaultBaseConfig = {
  isSSO: false,
  lang: 'zh-CN',
  title: 'Authing',
  escCloseable: true,
  clickCloseable: true,
  mode: GuardMode.Normal,
  host: 'https://core.authing.cn',
  defaultScenes: GuardScenes.Login,
  logo:
    'https://files.authing.co/user-contents/photos/0a4c99ff-b8ce-4030-aaaf-584c807cb21c.png',
  headers: {
    'userpool-id': 'x-authing-userpool-id',
    'app-id': 'x-authing-app-id',
    'request-from': 'x-authing-request-from',
    'sdk-version': 'x-authing-sdk-version',
    lang: 'x-authing-lang',
  },
}

export interface DefaultLoginConfig extends LoginConfig {
  autoRegister: boolean
  disableResetPwd: boolean
  defaultLoginMethod: LoginMethods
  loginMethods: LoginMethods[]
  passwordLoginMethods: PasswordLoginMethods[]
}

const defaultLoginConfig: DefaultLoginConfig = {
  autoRegister: false,
  disableResetPwd: false,
  defaultLoginMethod: LoginMethods.Password,
  loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
  passwordLoginMethods: [
    'email-password',
    'username-password',
    'phone-password',
  ],
}

export interface DefaultRegisterConfig extends RegisterConfig {
  disableRegister: boolean
  defaultRegisterMethod: RegisterMethods
  registerMethods: RegisterMethods[]
}

const defaultRegisteConfig: DefaultRegisterConfig = {
  disableRegister: false,
  defaultRegisterMethod: RegisterMethods.Email,
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
}

export interface DefaultConfig extends GuardConfig {
  base: DefaultBaseConfig
  login: DefaultLoginConfig
  registe: DefaultRegisterConfig
}

export const defaultConfig: DefaultConfig = {
  base: defaultBaseConfig,
  login: defaultLoginConfig,
  registe: defaultRegisteConfig,
}

let mergedConfig: GuardConfig

export const initConfig = async (
  config: GuardConfig = {},
  appId: string,
  frame?: FrameType
) => {
  // 先取一下 host lang 默认值
  const host = config?.base?.host ?? defaultConfig.base.host
  const lang = config?.base?.lang ?? defaultConfig.base.lang
  const localesConfig = config?.base?.localesConfig ?? {}

  // init i18n
  initI18n(localesConfig, lang)

  // initHttp
  const httpClient = initGuardHttp(host)
  httpClient.setAppId(appId)

  // 默认给一个 Reacat
  httpClient.setFrame(frame ?? FrameType.React)

  // 拿一下 PublicConfig
  const publicConfig = await getPublicConfig(appId)

  // userpoolId 拿到之后放到 请求里面
  httpClient.setUserpoolId(publicConfig.userPoolId)

  const finalConfig = mergeConfig(config, publicConfig)

  mergedConfig = finalConfig

  console.log(mergedConfig)

  return mergedConfig
}

const mergeConfig = (config: GuardConfig, publicConfig: ApplicationConfig) =>
  mergeDefaultConfig(mergePublicConfig(config, publicConfig))

const mergeDefaultConfig: (config: GuardConfig) => DefaultConfig = (config) => {
  return merge(defaultConfig, config)
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

const mergePublicConfig = (
  config: GuardConfig,
  publicConfig: ApplicationConfig
): GuardConfig => {
  const { base = {}, login = {}, registe = {} } = config

  const mergedConfig: GuardConfig = {
    base: {
      ...base,
      title: base?.title ?? publicConfig.name,
      logo: base?.logo ?? publicConfig.logo,
    },
    login: {
      ...login,
      // 登录方式
      loginMethods:
        login?.loginMethods ??
        (publicConfig.loginTabs?.list as LoginMethods[]) ??
        [],
      // 账号 + 密码 登录方式
      passwordLoginMethods:
        login?.passwordLoginMethods ??
        publicConfig.passwordTabConfig?.enabledLoginMethods,
      // 默认登录方式
      defaultLoginMethod:
        login.defaultLoginMethod ??
        (publicConfig.loginTabs.default as LoginMethods),
      // 禁止重制密码
      disableResetPwd: !!(
        login.disableResetPwd ??
        publicConfig.ssoPageComponentDisplay?.registerBtn
      ),
      // 是否自动注册
      autoRegister:
        login.autoRegister ??
        publicConfig.ssoPageComponentDisplay.autoRegisterThenLoginHintInfo,
      // TODO 社会化登录
      // TODO 企业身份源
    },
    registe: {
      ...registe,
      registerMethods:
        registe.registerMethods ??
        (publicConfig.registerTabs?.list as RegisterMethods[]),
      defaultRegisterMethod:
        registe.defaultRegisterMethod ??
        (publicConfig.registerTabs.default as RegisterMethods),
      // 禁止注册
      disableRegister: !!(
        registe.disableRegister ??
        publicConfig.ssoPageComponentDisplay.registerBtn
      ),
    },
  }

  return mergedConfig
}

export const getConfig = () => {
  if (!mergedConfig) {
    throw new Error('Please initialize Guard Config')
  }

  return mergedConfig
}

export const useConfig = () => getConfig()
