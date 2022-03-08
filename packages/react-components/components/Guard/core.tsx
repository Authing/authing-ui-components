import { GuardProps } from '.'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { ConfigProvider, message, Modal } from 'antd'
import { GuardLoginView } from '../Login'
import { initGuardAuthClient } from './authClient'
import { GuardEvents, guardEventsFilter } from './event'
import { initConfig } from '../_utils/config'
import { insertStyles } from '../_utils'
import { getGuardHttp, GuardHttp, initGuardHttp } from '../_utils/guardHttp'
import { i18n, initI18n } from '..//_utils/locales'
import { IG2FCProps } from '../Type'
import { getDefaultGuardLocalConfig, GuardLocalConfig } from './config'
import { GuardModuleType } from './module'
import { GuardMFAView } from '../MFA'
import { GuardRegisterView } from '../Register'
import { GuardDownloadATView } from '../DownloadAuthenticator'
import {
  GuardStateMachine,
  initGuardStateMachine,
  useHistoryHijack,
} from './GuardModule/stateMachine'
import { GuardBindTotpView } from '../BindTotp'
import { GuardForgetPassword } from '../ForgetPassword'
import { GuardChangePassword } from '../ChangePassword'
import { GuardNeedHelpView } from '../NeedHelpView'
import { GuardCompleteInfoView } from '../CompleteInfo'
import { GuardRecoveryCodeView } from '../RecoveryCode'
import './styles.less'
import { IconFont } from '../AuthingGuard/IconFont'
import { GuardErrorView } from '../Error'
import { AuthenticationClient, GuardMode } from '..'
import { GuardSubmitSuccessView } from '../SubmitSuccess'
import {
  createAppIdContext,
  createGuardEventsContext,
  createGuardFinallyConfigContext,
  createGuardModuleContext,
  createGuardPublicConfigContext,
  createHttpClientContext,
  createInitDataContext,
} from '../_utils/context'
import { ApplicationConfig } from '../AuthingGuard/api'
import { SessionData, trackSession } from './sso'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import {
  getPublicConfig,
  useMergeDefaultConfig,
  useMergePublicConfig,
} from '../_utils/config/index'
import { getDefaultCompleteInfoConfig } from '../CompleteInfo/interface'

const PREFIX_CLS = 'authing-ant'
export enum LangMAP {
  zhCn = 'zh-CN',
  enUs = 'en-US',
}

const langMap = {
  [LangMAP.zhCn]: zhCN,
  [LangMAP.enUs]: enUS,
}

message.config({
  prefixCls: `${PREFIX_CLS}-message`,
})

const ComponentsMapping: Record<GuardModuleType, () => React.ReactNode> = {
  [GuardModuleType.ERROR]: () => <GuardErrorView />,
  [GuardModuleType.LOGIN]: () => <GuardLoginView />,
  [GuardModuleType.MFA]: () => <GuardLoginView />,
  [GuardModuleType.REGISTER]: () => <GuardLoginView />,
  [GuardModuleType.DOWNLOAD_AT]: () => <GuardLoginView />,
  [GuardModuleType.FORGET_PWD]: () => <GuardLoginView />,
  [GuardModuleType.CHANGE_PWD]: () => <GuardLoginView />,
  [GuardModuleType.BIND_TOTP]: () => <GuardLoginView />,
  [GuardModuleType.ANY_QUESTIONS]: () => <GuardLoginView />,
  [GuardModuleType.COMPLETE_INFO]: () => <GuardLoginView />,
  [GuardModuleType.RECOVERY_CODE]: () => <GuardLoginView />,
  [GuardModuleType.SUBMIT_SUCCESS]: () => <GuardLoginView />,
  [GuardModuleType.IDENTITY_BINDING]: () => <GuardLoginView />,
  [GuardModuleType.IDENTITY_BINDING_ASK]: () => <GuardNeedHelpView />,
  // [GuardModuleType.MFA]: () => <GuardMFAView />,
  // [GuardModuleType.REGISTER]: () => <GuardRegisterView />,
  // [GuardModuleType.DOWNLOAD_AT]: () => <GuardDownloadATView />,
  // [GuardModuleType.FORGET_PWD]: () => <GuardForgetPassword />,
  // [GuardModuleType.CHANGE_PWD]: () => <GuardChangePassword />,
  // [GuardModuleType.BIND_TOTP]: () => <GuardBindTotpView />,
  // [GuardModuleType.ANY_QUESTIONS]: () => <GuardNeedHelpView />,
  // [GuardModuleType.COMPLETE_INFO]: () => <GuardCompleteInfoView />,
  // [GuardModuleType.RECOVERY_CODE]: () => <GuardRecoveryCodeView />,
  // [GuardModuleType.SUBMIT_SUCCESS]: () => <GuardSubmitSuccessView />,
}

interface GuardViewProps extends GuardProps {
  config: GuardLocalConfig
  initData: any
}

interface IBaseAction<T = string, P = any> {
  type: T & string
  payload?: Partial<P>
}

interface ModuleState {
  moduleName: GuardModuleType
  initData: any
}

export const useGuardCore = (props: GuardProps, initState: ModuleState) => {
  const { appId, tenantId, config } = props

  const [events, setEvents] = useState<GuardEvents>()
  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [httpClient, setHttpClient] = useState<GuardHttp>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const { Context: GuardPublicConfigContext } = createGuardPublicConfigContext()

  const { Context: GuardHttpClientContext } = createHttpClientContext()

  const { Context: GuardAppIdContext } = createAppIdContext()

  const { Context: GuardInitDataContext } = createInitDataContext()

  const { Context: GuardEventsContext } = createGuardEventsContext()

  const { Context: GuardModuleContext } = createGuardModuleContext()

  const {
    Context: GuardFinallyConfigContext,
  } = createGuardFinallyConfigContext()

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
      // 劫持 History
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

  const loadingComponent = useMemo(() => {
    if (defaultMergedConfig)
      if (defaultMergedConfig.showLoading)
        return defaultMergedConfig?.loadingComponent

    return null
  }, [defaultMergedConfig])

  // HttpClint
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
    httpClient
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

    const events = guardEventsFilter({
      ...props,
      config: defaultMergedConfig,
    })
    setEvents(events)
  }, [props, defaultMergedConfig])

  // 状态机相关
  useEffect(() => {
    const guardStateMachine = initGuardStateMachine(onChangeModule, initState)
    setGuardStateMachine(guardStateMachine)

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

  const moduleEvents = useMemo(() => {
    if (!events && !guardStateMachine) return undefined
    return {
      changeModule: async (moduleName: GuardModuleType, initData?: any) => {
        onChangeModule(moduleName, initData)

        if (!events?.onBeforeChangeModule) {
          guardStateMachine?.next(moduleName, initData)
        } else if (await events.onBeforeChangeModule(moduleName, initData)) {
          guardStateMachine?.next(moduleName, initData)
        }
      },
      backModule: () => {
        guardStateMachine?.back()
      },
    }
  }, [events, guardStateMachine, onChangeModule])

  const moduleLoaded = useMemo(() => {
    const list = [
      appId,
      events,
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
    finallyConfig,
    httpClient,
    moduleEvents,
    publicConfig,
    authClint,
  ])

  const renderContext = useCallback(
    (children: ReactNode) => {
      if (moduleLoaded)
        return (
          <GuardFinallyConfigContext.Provider value={finallyConfig!}>
            <GuardPublicConfigContext.Provider value={publicConfig!}>
              <GuardHttpClientContext.Provider value={httpClient!}>
                <GuardAppIdContext.Provider value={appId}>
                  <GuardEventsContext.Provider value={events}>
                    <GuardModuleContext.Provider value={moduleEvents!}>
                      <GuardInitDataContext.Provider
                        value={moduleState.initData}
                      >
                        {children}
                      </GuardInitDataContext.Provider>
                    </GuardModuleContext.Provider>
                  </GuardEventsContext.Provider>
                </GuardAppIdContext.Provider>
              </GuardHttpClientContext.Provider>
            </GuardPublicConfigContext.Provider>
          </GuardFinallyConfigContext.Provider>
        )
      else return null
    },
    [
      GuardAppIdContext,
      GuardEventsContext,
      GuardFinallyConfigContext,
      GuardHttpClientContext,
      GuardInitDataContext,
      GuardModuleContext,
      GuardPublicConfigContext,
      appId,
      events,
      finallyConfig,
      httpClient,
      moduleEvents,
      moduleLoaded,
      moduleState.initData,
      publicConfig,
    ]
  )

  const renderModule = useMemo(() => {
    if (moduleLoaded) return ComponentsMapping[moduleState.moduleName]()
    else if (defaultMergedConfig) return loadingComponent
    else return null
  }, [
    defaultMergedConfig,
    loadingComponent,
    moduleLoaded,
    moduleState.moduleName,
  ])

  return {
    renderModule: renderContext(renderModule),
  }
}
