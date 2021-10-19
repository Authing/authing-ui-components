import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import { IG2Config } from 'src/classes'
import { ApplicationConfig } from 'src/components/AuthingGuard/api'
import { LoginConfig } from 'src/components/Login/props'
import { RegisterConfig } from 'src/components/Register/props'
import { assembledAppHost } from '.'
import { GuardHttp } from './guradHttp'
import { AuthingResponse } from './http'

export interface GuardConfig extends RegisterConfig, LoginConfig {}

let publicConfigMap: Record<string, ApplicationConfig> = {}

const getPublicConfig = (appId: string) => publicConfigMap?.[appId]

const setPublicConfig = (appId: string, config: ApplicationConfig) =>
  (publicConfigMap[appId] = config)

export const initConfig = async (
  appId: string,
  config: Partial<IG2Config>,
  defaultConfig: IG2Config
): Promise<{ config: GuardConfig; publicConfig: ApplicationConfig }> => {
  if (!getPublicConfig(appId))
    await requestPublicConfig(appId, config.host ?? defaultConfig.host)
  const mergedConfig = mergeConfig(
    config,
    defaultConfig,
    getPublicConfig(appId)
  )

  return {
    config: {
      ...mergedConfig,
      __publicConfig__: getPublicConfig(appId),
      __appHost__: assembledAppHost(
        getPublicConfig(appId).identifier,
        mergedConfig?.host!
      ),
    },
    publicConfig: getPublicConfig(appId),
  }
}

const mergeConfig = (
  config: Partial<GuardConfig>,
  defaultConfig: IG2Config,
  publicConfig: ApplicationConfig
): GuardConfig => {
  const mergedPublicConfig: GuardConfig = {
    ...defaultConfig,
    ...config,
    title: config.title ?? publicConfig.name,
    logo: config.logo ?? publicConfig.logo,
    loginMethods:
      config?.loginMethods ??
      (publicConfig.loginTabs?.list as LoginMethods[]) ??
      [],
    passwordLoginMethods:
      config?.passwordLoginMethods ??
      publicConfig.passwordTabConfig?.enabledLoginMethods ??
      [],
    // 默认登录方式
    defaultLoginMethod:
      config.defaultLoginMethod ??
      (publicConfig.loginTabs.default as LoginMethods),
    // 禁止重制密码
    disableResetPwd: !!(
      config.disableResetPwd ??
      !publicConfig.ssoPageComponentDisplay?.registerBtn
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
      config.disableRegister ??
      !publicConfig.ssoPageComponentDisplay.registerBtn
    ),
    // publicKey
    publicKey: config.publicKey ?? publicConfig.publicKey,
    // 注册协议
    agreementEnabled: config.agreementEnabled ?? publicConfig.agreementEnabled,
    agreements: config.agreements ?? publicConfig.agreements,
  }

  return mergedPublicConfig
}

const requestPublicConfig = async (
  appId: string,
  host: string
): Promise<ApplicationConfig> => {
  let res: AuthingResponse<ApplicationConfig>

  const guardHttp = new GuardHttp(host)
  guardHttp.setAppId(appId)

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

  setPublicConfig(appId, res.data)

  return getPublicConfig(appId)
}
