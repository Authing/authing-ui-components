import { LoginMethods } from 'authing-js-sdk'
import { ApplicationConfig } from '../../AuthingGuard/api'
import { assembledRequestHost as utilAssembledRequestHost } from '..'
import { GuardComponentConfig, GuardLocalConfig } from '../../Guard/config'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthingResponse } from '../http'
import { GuardHttp } from '../guardHttp'
import { corsVerification } from '../corsVerification'
import { Logger } from '../logger'
import { NewRegisterMethods } from '../../Type'
import { GuardPageConfig } from '../../Type'

let publicConfigMap: Record<string, ApplicationConfig> = {}

export const getPublicConfig = (appId: string) => publicConfigMap?.[appId]

export const setPublicConfig = (appId: string, config: ApplicationConfig) => {
  return (publicConfigMap[appId] = config)
}

/**
 * 请求 Server 获得当前 AppID 开启的 Guard 配置
 * @param appId
 * @param httpClient
 * @returns
 */
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

  httpClient.setUserpoolId(res.data.userPoolId)

  return getPublicConfig(appId)
}

/**
 * 合并 config
 * @param defaultConfig Guard 默认配置
 * @param config 组件传入配置
 * @returns
 */
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
      (publicConfig.registerTabs?.list as NewRegisterMethods[]),
    defaultRegisterMethod:
      config.defaultRegisterMethod ??
      (publicConfig.registerTabs.default as NewRegisterMethods),
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

/**
 * 合并最终 Guard 配置
 * @param appId
 * @param config  useMergeDefaultConfig 合并后的用户侧传入 props 和默认配置
 * @param httpClient
 * @param setError 错误函数
 * @returns
 */
export const useMergePublicConfig = (
  appId?: string,
  config?: GuardLocalConfig,
  // httpClient?: GuardHttp,
  getHttpClient?: () => GuardHttp | undefined,
  setError?: any
) => {
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  const initPublicConfig = useCallback(async () => {
    const httpClient = getHttpClient && getHttpClient()

    if (httpClient && appId) {
      if (!getPublicConfig(appId)) {
        try {
          await requestPublicConfig(appId, httpClient)
        } catch (error) {
          setError(error)
        }
      }

      setPublicConfig(getPublicConfig(appId))
    }
  }, [appId, getHttpClient, setError])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  return useMemo(() => {
    if (publicConfig && config) {
      return {
        ...mergedPublicConfig(config, publicConfig),
        host: assembledRequestHost(config, publicConfig),
      }
    }
  }, [config, publicConfig])
}

let pageConfigMap: Record<string, GuardPageConfig> = {}

export const getPageConfig = (appId: string) => pageConfigMap?.[appId]

export const setPageConfig = (appId: string, config: GuardPageConfig) =>
  (pageConfigMap[appId] = config)

export const requestGuardPageConfig = async (
  appId: string,
  httpClient: GuardHttp
): Promise<GuardPageConfig> => {
  let res: AuthingResponse<GuardPageConfig>

  const { get } = httpClient

  try {
    res = await get<GuardPageConfig>(
      `/api/v2/applications/${appId}/components-public-config/guard`
    )
  } catch (error) {
    Logger.error('Please check your config or network')
    throw new Error('Please check your config or network')
  }

  if (res.code !== 200 || !res.data) {
    Logger.error(res?.message ?? 'Please check your config')
    throw new Error(res?.message ?? 'Please check your config')
  }

  setPageConfig(appId, res.data)

  return getPageConfig(appId)
}

export const useGuardPageConfig = (
  appId?: string,
  httpClient?: GuardHttp,
  serError?: any
) => {
  const [pageConfig, setPageConfig] = useState<GuardPageConfig>()

  const initPublicConfig = useCallback(async () => {
    if (httpClient && appId) {
      if (!getPageConfig(appId)) {
        try {
          await requestGuardPageConfig(appId, httpClient)
        } catch (error) {
          serError(error)
        }
      }

      setPageConfig(getPageConfig(appId))
    }
  }, [appId, httpClient, serError])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  if (pageConfig) {
    return pageConfig
  }
}
