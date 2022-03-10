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
import {
  createAppIdContext,
  createGuardContextLoaded,
  createGuardCurrentModuleContext,
  createGuardDefaultMergedConfigContext,
  createGuardEventsContext,
  createGuardFinallyConfigContext,
  createGuardIsAuthFlowContext,
  createGuardModuleContext,
  createGuardPublicConfigContext,
  createHttpClientContext,
  createInitDataContext,
} from '../../_utils/context'
import { ApplicationConfig } from '../../AuthingGuard/api'
import { SessionData, trackSession } from '../sso'
import {
  getPublicConfig,
  useMergeDefaultConfig,
  useMergePublicConfig,
} from '../../_utils/config/index'
import { GuardHttp, initGuardHttp } from '../../_utils/guardHttp'
import { initI18n } from '../../_utils/locales'

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
  const [isAuthFlow, setIsAuthFlow] = useState(false)

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const { Context: GuardPublicConfigContext } = createGuardPublicConfigContext()

  const { Context: GuardHttpClientContext } = createHttpClientContext()

  const {
    Context: GuardDefaultMergedConfigContext,
  } = createGuardDefaultMergedConfigContext()

  const { Context: GuardAppIdContext } = createAppIdContext()

  const { Context: GuardInitDataContext } = createInitDataContext()

  const {
    Context: GuardCurrentModuleContext,
  } = createGuardCurrentModuleContext()

  const { Context: GuardEventsContext } = createGuardEventsContext()

  const { Context: GuardModuleContext } = createGuardModuleContext()

  const {
    Context: GuardFinallyConfigContext,
  } = createGuardFinallyConfigContext()

  const { Context: GuardContextLoaded } = createGuardContextLoaded()

  const { Context: GuardIsAuthFlowContext } = createGuardIsAuthFlowContext()

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
      // 劫持 History
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
    initI18n({}, defaultMergedConfig?.lang)
  }, [defaultMergedConfig?.lang])

  useEffect(() => {
    if (!appId) return

    const publicConfig = getPublicConfig(appId)

    if (!publicConfig) return

    setPublicConfig(publicConfig)
  }, [appId, finallyConfig])

  // AuthClient
  useEffect(() => {
    if (appId && finallyConfig && publicConfig?.websocket) {
      const authClint = initGuardAuthClient(
        finallyConfig,
        appId,
        publicConfig?.websocket,
        tenantId
      )
      setAuthClint(authClint)
    }
  }, [appId, finallyConfig, publicConfig?.websocket, tenantId])

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

    // TODO 这里有一个循环调用问题，藏的有点深 待优化
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

    setIsAuthFlow(Boolean(finallyConfig?.__isAuthFlow__))
  }, [finallyConfig])

  const moduleEvents = useMemo(() => {
    if (!events && !guardStateMachine) return undefined
    return {
      changeModule: async (moduleName: GuardModuleType, initData?: any) => {
        // 单体组件处理
        if (finallyConfig?.__singleComponent__) {
          events?.__changeModule?.(moduleName, initData)
        } else {
          onChangeModule(moduleName, initData)

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
  }, [
    events,
    finallyConfig?.__singleComponent__,
    guardStateMachine,
    onChangeModule,
  ])

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

  // TODO 目前这种形式 一个变动会导致所有的 Context 都会渲染，应该搞成高阶组件的形式 待优化
  const renderContext = useMemo(() => {
    if (error) {
      return (
        <GuardContextLoaded.Provider value={true}>
          <GuardDefaultMergedConfigContext.Provider
            value={defaultMergedConfig!}
          >
            <GuardInitDataContext.Provider
              value={{
                error: error,
              }}
            >
              <GuardCurrentModuleContext.Provider
                value={{
                  moduleName: GuardModuleType.ERROR,
                  initData: {
                    error,
                  },
                }}
              >
                {children}
              </GuardCurrentModuleContext.Provider>
            </GuardInitDataContext.Provider>
          </GuardDefaultMergedConfigContext.Provider>
        </GuardContextLoaded.Provider>
      )
    }
    if (contextLoaded)
      return (
        <GuardContextLoaded.Provider value={contextLoaded}>
          <GuardIsAuthFlowContext.Provider value={isAuthFlow}>
            <GuardDefaultMergedConfigContext.Provider
              value={defaultMergedConfig!}
            >
              <GuardFinallyConfigContext.Provider value={finallyConfig!}>
                <GuardPublicConfigContext.Provider value={publicConfig!}>
                  <GuardHttpClientContext.Provider value={httpClient!}>
                    <GuardAppIdContext.Provider value={appId}>
                      <GuardEventsContext.Provider value={events}>
                        <GuardModuleContext.Provider value={moduleEvents!}>
                          <GuardInitDataContext.Provider
                            value={moduleState.initData}
                          >
                            <GuardCurrentModuleContext.Provider
                              value={moduleState}
                            >
                              {children}
                            </GuardCurrentModuleContext.Provider>
                          </GuardInitDataContext.Provider>
                        </GuardModuleContext.Provider>
                      </GuardEventsContext.Provider>
                    </GuardAppIdContext.Provider>
                  </GuardHttpClientContext.Provider>
                </GuardPublicConfigContext.Provider>
              </GuardFinallyConfigContext.Provider>
            </GuardDefaultMergedConfigContext.Provider>
          </GuardIsAuthFlowContext.Provider>
        </GuardContextLoaded.Provider>
      )
    // 只有极少的情况才会使用这个阶段，比如 Loading 组件
    else if (defaultMergedConfig)
      return (
        <GuardContextLoaded.Provider value={false}>
          <GuardDefaultMergedConfigContext.Provider value={defaultMergedConfig}>
            {children}
          </GuardDefaultMergedConfigContext.Provider>
        </GuardContextLoaded.Provider>
      )
    else return null
  }, [
    GuardAppIdContext,
    GuardContextLoaded,
    GuardCurrentModuleContext,
    GuardDefaultMergedConfigContext,
    GuardEventsContext,
    GuardFinallyConfigContext,
    GuardHttpClientContext,
    GuardInitDataContext,
    GuardIsAuthFlowContext,
    GuardModuleContext,
    GuardPublicConfigContext,
    appId,
    children,
    contextLoaded,
    defaultMergedConfig,
    error,
    events,
    finallyConfig,
    httpClient,
    isAuthFlow,
    moduleEvents,
    moduleState,
    publicConfig,
  ])

  return renderContext
}
