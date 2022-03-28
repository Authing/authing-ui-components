import { GuardProps } from '..'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { initGuardAuthClient } from '../authClient'
import { GuardEvents, guardEventsFilter } from '../event'
import { insertStyles } from '../../_utils'
import { getDefaultGuardLocalConfig } from '../config'
import { GuardModuleType } from '../module'

import {
  GuardStateMachine,
  initGuardStateMachine,
  ModuleState,
  useHistoryHijack,
} from '../GuardModule/stateMachine'
import { AuthenticationClient } from '../..'
import { ApplicationConfig } from '../../AuthingGuard/api'
import { SessionData, trackSession } from '../sso'
import {
  getPublicConfig,
  useMergeDefaultConfig,
  useMergePublicConfig,
} from '../../_utils/config/index'
import { GuardHttp, initGuardHttp } from '../../_utils/guardHttp'
import { initI18n } from '../../_utils/locales'
import { createGuardXContext } from '../../_utils/context'

interface IBaseAction<T = string, P = any> {
  type: T & string
  payload?: Partial<P>
}

export const RenderContext: React.FC<{
  guardProps: GuardProps
  initState: ModuleState
}> = ({ guardProps, initState, children }) => {
  const { appId, tenantId, config } = guardProps

  const [events, setEvents] = useState<GuardEvents>()
  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [httpClient, setHttpClient] = useState<GuardHttp>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()
  const [error, serError] = useState()
  const [isAuthFlow, setIsAuthFlow] = useState(true)

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const { Provider } = createGuardXContext()

  // 劫持浏览器 History
  const [historyNext] = useHistoryHijack(guardStateMachine?.back)

  // modules 定义
  const moduleReducer: (
    state: ModuleState,
    action: IBaseAction<GuardModuleType, ModuleState>
  ) => ModuleState = (state, { type, payload }) => {
    return {
      moduleName: type,
      initData: payload?.initData,
    }
  }

  // Modules Reducer
  const [moduleState, changeModule] = useReducer(moduleReducer, initState)

  // Change Module
  const onChangeModule = useCallback(
    (moduleName: GuardModuleType, initData: any = {}) => {
      historyNext(moduleName)

      changeModule({
        type: moduleName,
        payload: {
          initData: initData ?? {},
        },
      })
    },
    [historyNext]
  )

  // 合并默认值
  const defaultMergedConfig = useMergeDefaultConfig(
    getDefaultGuardLocalConfig(),
    config
  )

  // HttpClient
  useEffect(() => {
    if (!appId || !defaultMergedConfig) return

    const httpClient = initGuardHttp(defaultMergedConfig.host)

    httpClient.setAppId(appId)

    tenantId && httpClient.setTenantId(tenantId)

    setHttpClient(httpClient)
  }, [appId, defaultMergedConfig, tenantId])

  const finallyConfig = useMergePublicConfig(
    appId,
    defaultMergedConfig,
    httpClient,
    serError
  )

  // SSO 登录
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

  useEffect(() => {
    if (httpClient && finallyConfig) {
      httpClient?.setBaseUrl(finallyConfig.host)
    }
  }, [finallyConfig, httpClient])

  // I18n
  useEffect(() => {
    // TODO  国际化 这部分有点小问题 等待优化
    initI18n({}, config?.lang)
  }, [config?.lang])

  useEffect(() => {
    if (!appId) return

    const publicConfig = getPublicConfig(appId)

    if (!publicConfig) return

    setPublicConfig(publicConfig)
  }, [appId, finallyConfig])

  // AuthClient
  useEffect(() => {
    if (appId && finallyConfig && publicConfig) {
      const authClint = initGuardAuthClient(
        finallyConfig,
        appId,
        publicConfig?.websocket,
        tenantId
      )
      setAuthClint(authClint)
    }
  }, [appId, finallyConfig, publicConfig, tenantId])

  // initEvents
  useEffect(() => {
    if (!defaultMergedConfig) return

    const events = guardEventsFilter(
      {
        ...guardProps,
      },
      defaultMergedConfig?.openEventsMapping
    )
    setEvents(events)
  }, [guardProps, defaultMergedConfig])

  // 状态机相关
  useEffect(() => {
    const guardStateMachine = initGuardStateMachine(onChangeModule, initState)
    setGuardStateMachine(guardStateMachine)

    // TODO 这里有一个循环依赖问题，藏的有点深 待优化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 自定义 CSS 处理
  useEffect(() => {
    if (finallyConfig && finallyConfig.contentCss)
      insertStyles(finallyConfig.contentCss)
  }, [finallyConfig])

  // TODO 触发 onLoad 事件
  useEffect(() => {
    if (!authClint) return
    events?.onLoad?.(authClint)
  }, [authClint, events])

  // 是否使用 Guard auth flow
  useEffect(() => {
    if (!finallyConfig) return

    setIsAuthFlow(!Boolean(finallyConfig?.__unAuthFlow__))
  }, [finallyConfig])

  const moduleEvents = useMemo(() => {
    if (!events && !guardStateMachine) return undefined
    return {
      changeModule: async (moduleName: GuardModuleType, initData?: any) => {
        // 单体组件处理
        if (finallyConfig?.__singleComponent__) {
          events?.__changeModule?.(moduleName, initData)
        } else {
          // onChangeModule(moduleName, initData)

          if (!events?.onBeforeChangeModule) {
            guardStateMachine?.next(moduleName, initData)
          } else if (await events.onBeforeChangeModule(moduleName, initData)) {
            guardStateMachine?.next(moduleName, initData)
          }
        }
      },
      backModule: () => {
        guardStateMachine?.back()
      },
    }
  }, [events, finallyConfig?.__singleComponent__, guardStateMachine])

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
    ]

    return !list.includes(undefined)
  }, [
    appId,
    events,
    defaultMergedConfig,
    finallyConfig,
    httpClient,
    moduleEvents,
    publicConfig,
    authClint,
  ])

  const contextValues = useMemo(
    () => ({
      contextLoaded,
      isAuthFlow,
      defaultMergedConfig,
      finallyConfig,
      publicConfig,
      httpClient,
      appId,
      events,
      ...moduleEvents,
      initData: moduleState.initData,
      currentModule: moduleState,
    }),
    [
      appId,
      contextLoaded,
      defaultMergedConfig,
      events,
      finallyConfig,
      httpClient,
      isAuthFlow,
      moduleEvents,
      moduleState,
      publicConfig,
    ]
  )

  const renderContext = useMemo(() => {
    return <Provider value={contextValues}>{children}</Provider>
  }, [Provider, children, contextValues])

  const renderLoadingContext = useMemo(() => {
    return <Provider value={contextValues}>{children}</Provider>
  }, [Provider, children, contextValues])

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

  const render = useMemo(() => {
    if (error) return renderErrorContext

    if (contextLoaded) return renderLoadingContext
    else if (defaultMergedConfig) return renderContext
    else return null
  }, [
    contextLoaded,
    defaultMergedConfig,
    error,
    renderContext,
    renderErrorContext,
    renderLoadingContext,
  ])

  return render
}