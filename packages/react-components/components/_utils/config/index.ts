import { LoginMethods, RegisterMethods } from 'authing-js-sdk'
import { ApplicationConfig } from '../../AuthingGuard/api'
import { assembledRequestHost as utilAssembledRequestHost } from '..'
import { GuardComponentConfig, GuardLocalConfig } from '../../Guard/config'
import { useCallback, useEffect, useState } from 'react'
import { AuthingResponse } from '../http'
import { GuardHttp } from '../guardHttp'
import { corsVerification } from '../corsVerification'
import { Logger } from '../logger'

let publicConfigMap: Record<string, ApplicationConfig> = {}

export const getPublicConfig = (appId: string) => publicConfigMap?.[appId]

export const setPublicConfig = (appId: string, config: ApplicationConfig) =>
  (publicConfigMap[appId] = config)

const requestPublicConfig = async (
  appId: string,
  httpClient: GuardHttp
): Promise<ApplicationConfig> => {
  let res: AuthingResponse<ApplicationConfig>

  const { get } = httpClient

  try {
    res = await get<ApplicationConfig>(
      `/api/v2/applications/${appId}/public-config`
    )
  } catch (error) {
    Logger.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data) {
    Logger.error(res?.message ?? 'Please check your config')
    throw new Error(res?.message ?? 'Please check your config')
  }

  corsVerification(res.data.allowedOrigins, res.data.corsWhitelist)

  setPublicConfig(appId, res.data)

  return getPublicConfig(appId)
}

export const useMergeDefaultConfig = (
  defaultConfig: GuardLocalConfig,
  config?: GuardComponentConfig
): GuardLocalConfig | undefined => {
  const [mergedConfig, setMergedConfig] = useState<GuardLocalConfig>()

  useEffect(() => {
    setMergedConfig({
      ...defaultConfig,
      ...config,
    })
  }, [defaultConfig, config])

  return mergedConfig
}

const mergedPublicConfig = (
  config: GuardLocalConfig,
  publicConfig: ApplicationConfig
): GuardLocalConfig => {
  const mergedPublicConfig: GuardLocalConfig = {
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

// host 拼接
const assembledRequestHost = (
  config: GuardLocalConfig,
  publicConfig: ApplicationConfig
) => {
  const host = config?.__internalRequest__
    ? config?.host
    : utilAssembledRequestHost(publicConfig.requestHostname, config?.host!)

  return host
}

export const useMergePublicConfig = (
  appId: string,
  config?: GuardLocalConfig,
  httpClient?: GuardHttp,
  serError?: any
) => {
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  const initPublicConfig = useCallback(async () => {
    if (httpClient && appId)
      if (!getPublicConfig(appId)) {
        try {
          await requestPublicConfig(appId, httpClient)
        } catch (error) {
          serError(error)
        }
      }

    setPublicConfig(getPublicConfig(appId))
  }, [appId, httpClient, serError])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  if (publicConfig && config) {
    return {
      ...mergedPublicConfig(config, publicConfig),
      host: assembledRequestHost(config, publicConfig),
    }
  }
}
