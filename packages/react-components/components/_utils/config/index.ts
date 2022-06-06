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
      washRegisterMethods(publicConfig.registerTabsConfig).registerMethods,
    // 默认注册方式
    defaultRegisterMethod:
      config.defaultRegisterMethod ??
      (washRegisterMethods(publicConfig.registerTabsConfig)
        .defaultRegisterMethod as NewRegisterMethods),
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

// 注册方式组合
const washRegisterMethods = (
  registerTabsConfig: ApplicationConfig['registerTabsConfig']
) => {
  let {
    default: defaultRegisterMethod, //默认注册方式是list子集 但支持渲染的注册方式是由list+registerTypeConfig组合的方式(为了后续扩展) 组合出的注册方式是list的父集
    list,
    registerTypeConfig: {
      emailRegisterType = [NewRegisterMethods.Email],
      phoneRegisterType = [NewRegisterMethods.Phone],
    },
  } = registerTabsConfig
  let registerMethods: NewRegisterMethods[] = []
  if (list.length > 0) {
    // 开启邮箱注册
    if (list.includes('email')) {
      registerMethods.push(...emailRegisterType)
    }
    // 开启手机号注册
    if (list.includes('phone')) {
      registerMethods.push(...phoneRegisterType)
    }
  }
  //默认注册方式
  defaultRegisterMethod =
    registerMethods.find((item: string) =>
      item.includes(defaultRegisterMethod)
    ) || defaultRegisterMethod

  return { registerMethods, defaultRegisterMethod }
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
  appId?: string,
  config?: GuardLocalConfig,
  httpClient?: GuardHttp,
  setError?: any
) => {
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  const initPublicConfig = useCallback(async () => {
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
  }, [appId, httpClient, setError])

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
