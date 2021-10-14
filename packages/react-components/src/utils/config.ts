import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import { IG2Config } from 'src/classes'
import { ApplicationConfig } from 'src/components/AuthingGuard/api'
import { getDefaultLoginConfig, LoginConfig } from 'src/components/Login/props'
import {
  RegisterConfig,
  getDefaultRegisterConfig,
} from 'src/components/Register/props'
import { GuardHttp } from './guradHttp'
import { AuthingResponse } from './http'

export interface GuardConfig extends RegisterConfig, LoginConfig {}

let defaultConfig: GuardConfig

// TODO appId
let publicConfig: ApplicationConfig

export const getDefaultConfig = (): GuardConfig => {
  if (!defaultConfig) {
    defaultConfig = {
      ...getDefaultLoginConfig(),
      ...getDefaultRegisterConfig(),
    }
  }

  return defaultConfig
}

export const initConfig = async (
  appId: string,
  config: GuardConfig,
  defaultConfig: GuardConfig = getDefaultConfig()
): Promise<{ config: GuardConfig; publicConfig: ApplicationConfig }> => {
  if (!publicConfig)
    await getPublicConfig(appId, config.host ?? getDefaultConfig().host!)
  return {
    config: {
      ...mergeConfig(config, defaultConfig),
      _publicConfig_: publicConfig,
    },
    publicConfig,
  }
}

const mergeConfig = (
  config: GuardConfig,
  defaultConfig: GuardConfig
): IG2Config => {
  const mergedPublicConfig: GuardConfig = {
    ...config,
    title: config.title ?? publicConfig.name,
    logo: config.logo ?? publicConfig.logo,
    loginMethods:
      config?.loginMethods ??
      (publicConfig.loginTabs?.list as LoginMethods[]) ??
      [],
    passwordLoginMethods:
      config?.passwordLoginMethods ??
      publicConfig.passwordTabConfig?.enabledLoginMethods,
    // 默认登录方式
    defaultLoginMethod:
      config.defaultLoginMethod ??
      (publicConfig.loginTabs.default as LoginMethods),
    // 禁止重制密码
    disableResetPwd: !!(
      config.disableResetPwd ??
      publicConfig.ssoPageComponentDisplay?.registerBtn
    ),
    // 是否自动注册
    autoRegister:
      config.autoRegister ??
      publicConfig.ssoPageComponentDisplay.autoRegisterThenLoginHintInfo,
    registerMethods:
      config.registerMethods ??
      (publicConfig.registerTabs?.list as RegisterMethods[]),
    defaultRegisterMethod:
      config.defaultRegisterMethod ??
      (publicConfig.registerTabs.default as RegisterMethods),
    // 禁止注册
    disableRegister: !!(
      config.disableRegister ?? publicConfig.ssoPageComponentDisplay.registerBtn
    ),
    // publicKey
    publicKey: config.publicKey ?? publicConfig.publicKey,
  }

  return {
    ...defaultConfig,
    ...mergedPublicConfig,
  }
}

const getPublicConfig = async (
  appId: string,
  host: string
): Promise<ApplicationConfig> => {
  let res: AuthingResponse<ApplicationConfig>

  const guardHttp = new GuardHttp(host)

  try {
    res = await guardHttp.get<ApplicationConfig>(
      `/api/v2/applications/${appId}/public-config`
    )
  } catch (error) {
    console.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data)
    throw new Error(res?.message ?? 'Please check your config')

  publicConfig = res.data

  return publicConfig
}
