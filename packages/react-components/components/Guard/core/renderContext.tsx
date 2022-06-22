import { GuardProps } from '..'
import React, { useEffect, useMemo, useState } from 'react'
import { useInitGuardAuthClient } from '../authClient'
import { GuardModuleType } from '../module'

import { ModuleState } from '../GuardModule/stateMachine'
import { AuthenticationClient } from '../..'
import { ApplicationConfig } from '../../AuthingGuard/api'
import { SessionData, trackSession } from '../sso'
import { getPublicConfig, useGuardPageConfig } from '../../_utils/config'
import { initI18n } from '../../_utils/locales'
import { useGuardXContext } from '../../_utils/context'
import { useGuardIconfont } from '../../IconFont/useGuardIconfont'
import { useInitGuardAppendConfig } from './useAppendConfig'
import { useInitAppId } from '../../_utils/initAppId'
import useModule from './hooks/useModule'
import useConfig from './hooks/useConfig'
import useEvents from './hooks/useEvents'
import useFDA from './hooks/useFDA'
import useHttp from './hooks/useHttp'

export const RenderContext: React.FC<{
  guardProps: GuardProps
  initState: ModuleState
}> = ({ guardProps, initState, children }) => {
  const { tenantId, config } = guardProps

  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()
  const [cdnBase, setCdnBase] = useState<string>()
  const [error, setError] = useState()

  /**
   * 初始化 appId
   */
  const appId = useInitAppId(guardProps.appId, guardProps.authClient, setError)

  /**
   * 初始化配置 初始化配置需要请求数据
   */
  const { defaultMergedConfig, finallyConfig } = useConfig({
    appId,
    getHttpClient: () => httpClient,
    setError,
    userConfig: config,
  })

  /**
   * 初始化相关的Events
   */
  const { events } = useEvents(
    guardProps,
    defaultMergedConfig?.openEventsMapping
  )

  /**
   * appendConfig 相关 根据传入的 appendConfig处理
   * TODO: appendConfig看上去是 props 传入的，没查到参数
   */
  useInitGuardAppendConfig(appId, guardProps.appendConfig)

  /**
   * 控制核心渲染状态 & 更新视图方法
   */
  const { moduleState, onChangeModule } = useModule(initState, events)

  /**
   * 状态机相关
   * moduleEvents 提供给下层组件调用状态机切换能力
   */
  const { isAuthFlow, moduleEvents } = useFDA(
    onChangeModule,
    initState,
    events,
    finallyConfig?.__unAuthFlow__
  )

  /**
   * 初始化请求相关内容(fetch)
   */
  const { httpClient } = useHttp(
    appId,
    tenantId,
    defaultMergedConfig,
    finallyConfig?.host
  )

  /**
   * HOC Context 组件
   */
  const { Provider } = useGuardXContext()

  // TODO: 当前页面的配置 是否显示可切换？
  const guardPageConfig = useGuardPageConfig(appId, httpClient, setError)

  // TODO: SDK 相关，即将干掉 不额外抽离了
  const sdkClient = useInitGuardAuthClient({
    config: finallyConfig,
    appId,
    tenantId,
    setError,
    authClient: guardProps.authClient,
  })

  // iconfont TODO: 插入的svg作用是什么？ 调用iconfont吗 为什么要这种方式.
  const iconfontLoaded = useGuardIconfont(cdnBase)

  // TODO: SSO 登录逻辑梳理
  useEffect(() => {
    if (!config?.isSSO || !authClint || !events || !httpClient) return

    trackSession().then((sessionData) => {
      // 这个接口没有 code, data, 直接返回了数据
      let typedData = (sessionData as unknown) as SessionData
      if (typedData.userInfo) {
        events?.onLogin?.(typedData.userInfo, authClint!)
      }
    })
  }, [appId, authClint, config?.isSSO, events, httpClient])

  // TODO: I18n抽离
  useEffect(() => {
    // TODO  国际化 这部分有点小问题 等待优化
    initI18n({}, config?.lang)
  }, [config?.lang])

  //  TODO: cdnbase 相关 这个svg是干嘛的没搞明白
  useEffect(() => {
    if (!appId) return

    const publicConfig = getPublicConfig(appId)

    if (!publicConfig) return

    setPublicConfig(publicConfig)

    setCdnBase(publicConfig.cdnBase)
  }, [appId, finallyConfig])

  // AuthClient
  useEffect(() => {
    setAuthClint(sdkClient)
  }, [sdkClient])

  const contextLoaded = useMemo(() => {
    const list = [
      appId,
      events,
      defaultMergedConfig,
      finallyConfig,
      httpClient,
      moduleEvents,
      publicConfig,
      authClint,
      guardPageConfig,
      iconfontLoaded,
    ]

    return !list.includes(undefined) && !list.includes(false)
  }, [
    appId,
    events,
    defaultMergedConfig,
    finallyConfig,
    httpClient,
    moduleEvents,
    publicConfig,
    authClint,
    guardPageConfig,
    iconfontLoaded,
  ])

  /**
   * 派发 onLoad 事件
   */
  useEffect(() => {
    if (!contextLoaded) return

    events?.onLoad?.(authClint!)
  }, [authClint, contextLoaded, events])

  const contextValues = useMemo(
    () =>
      contextLoaded
        ? {
            contextLoaded,
            isAuthFlow,
            defaultMergedConfig,
            finallyConfig,
            publicConfig,
            httpClient,
            appId,
            tenantId,
            events,
            ...moduleEvents,
            initData: moduleState.initData,
            currentModule: moduleState,
            guardPageConfig,
          }
        : {
            defaultMergedConfig,
          },
    [
      appId,
      contextLoaded,
      defaultMergedConfig,
      events,
      finallyConfig,
      guardPageConfig,
      httpClient,
      isAuthFlow,
      moduleEvents,
      moduleState,
      publicConfig,
      tenantId,
    ]
  )

  /**
   * 正常渲染
   */
  const renderContext = useMemo(() => {
    if (!contextValues) return null

    return <Provider value={contextValues}>{children}</Provider>
  }, [Provider, children, contextValues])

  /**
   * 非正常渲染
   */
  const renderErrorContext = useMemo(() => {
    return (
      <Provider
        value={{
          contextLoaded: true,
          defaultMergedConfig,
          initData: {
            error: error,
          },
          currentModule: {
            moduleName: GuardModuleType.ERROR,
            initData: {
              error,
            },
          },
        }}
      >
        {children}
      </Provider>
    )
  }, [Provider, children, defaultMergedConfig, error])

  /**
   * 渲染节点
   */
  const render = useMemo(() => {
    if (error) return renderErrorContext

    if (contextLoaded || Boolean(defaultMergedConfig)) return renderContext

    return null
  }, [
    contextLoaded,
    defaultMergedConfig,
    error,
    renderContext,
    renderErrorContext,
  ])

  return render
}
