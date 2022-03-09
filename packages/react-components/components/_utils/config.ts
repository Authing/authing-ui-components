import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import { IG2Config } from '../Type'
import { ApplicationConfig } from '../AuthingGuard/api'
import { getGuardHttp } from './guardHttp'
import { AuthingResponse } from './http'
import { GuardComponentConfig, GuardLocalConfig } from '../Guard/config'
import { corsVerification } from './corsVerification'

let publicConfigMap: Record<string, ApplicationConfig> = {}

const getPublicConfig = (appId: string) => publicConfigMap?.[appId]

const setPublicConfig = (appId: string, config: ApplicationConfig) =>
  (publicConfigMap[appId] = config)

export const initConfig = async (
  appId: string,
  config: Partial<IG2Config>,
  defaultConfig: IG2Config
): Promise<{ config: GuardLocalConfig; publicConfig: ApplicationConfig }> => {
  if (!getPublicConfig(appId)) await requestPublicConfig(appId)
  const mergedConfig = mergeConfig(
    config,
    defaultConfig,
    getPublicConfig(appId)
  )

  return {
    config: {
      ...mergedConfig,
      // 请求地址 拼装
      // __appHost__: config?.__internalRequest__
      //   ? mergedConfig?.host
      //   : assembledRequestHost(
      //       getPublicConfig(appId).requestHostname,
      //       mergedConfig?.host!
      //     ),
    },
    publicConfig: getPublicConfig(appId),
  }
}

const mergeConfig = (
  config: GuardComponentConfig,
  defaultConfig: IG2Config,
  publicConfig: ApplicationConfig
): GuardLocalConfig => {
  const mergedPublicConfig: GuardLocalConfig = {
    ...defaultConfig,
    ...config,
    title: config.title ?? publicConfig.name,
    logo: !!config.logo ? config.logo : publicConfig.logo,
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
      !publicConfig.ssoPageComponentDisplay?.forgetPasswordBtn
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
    contentCss: config.contentCss ?? publicConfig.css,
  }

  return mergedPublicConfig
}

const requestPublicConfig = async (
  appId: string
): Promise<ApplicationConfig> => {
  let res: AuthingResponse<ApplicationConfig>

  const { get } = getGuardHttp()

  try {
    res = await get<ApplicationConfig>(
      `/api/v2/applications/${appId}/public-config`
    )
  } catch (error) {
    console.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data)
    throw new Error(res?.message ?? 'Please check your config')

  corsVerification(res.data.allowedOrigins, res.data.corsWhitelist)

  setPublicConfig(appId, res.data)

  return getPublicConfig(appId)
}
