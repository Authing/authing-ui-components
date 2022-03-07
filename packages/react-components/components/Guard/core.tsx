import { GuardProps } from '.'
import React, {
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
  createGuardModuleContext,
  createHttpClientContext,
  createInitDataContext,
  createPublicConfigContext,
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
  [GuardModuleType.MFA]: () => <GuardMFAView />,
  [GuardModuleType.REGISTER]: () => <GuardRegisterView />,
  [GuardModuleType.DOWNLOAD_AT]: () => <GuardDownloadATView />,
  [GuardModuleType.FORGET_PWD]: () => <GuardForgetPassword />,
  [GuardModuleType.CHANGE_PWD]: () => <GuardChangePassword />,
  [GuardModuleType.BIND_TOTP]: () => <GuardBindTotpView />,
  [GuardModuleType.ANY_QUESTIONS]: () => <GuardNeedHelpView />,
  [GuardModuleType.COMPLETE_INFO]: () => <GuardCompleteInfoView />,
  [GuardModuleType.RECOVERY_CODE]: () => <GuardRecoveryCodeView />,
  [GuardModuleType.SUBMIT_SUCCESS]: () => <GuardSubmitSuccessView />,
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

export const useGuardCore1 = (props: GuardProps, initState: ModuleState) => {
  const { appId, tenantId, config } = props

  const [events, setEvents] = useState<GuardEvents>()
  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [httpClint, setHttpClint] = useState<GuardHttp>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const { Context: GuardPublicConfigContext } = createPublicConfigContext()

  const { Context: guardHttpClientContext } = createHttpClientContext()

  const { Context: guardAppIdContext } = createAppIdContext()

  const { Context: guardInitDataContext } = createInitDataContext()

  const { Context: guardEventsContext } = createGuardEventsContext()

  const { Context: guardModuleContext } = createGuardModuleContext()

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
  const onChangeModule = (moduleName: GuardModuleType, initData: any = {}) => {
    changeModule({
      type: moduleName,
      payload: {
        initData: initData ?? {},
      },
    })
  }

  // 合并默认值
  const defaultMergedConfig = useMergeDefaultConfig(
    getDefaultGuardLocalConfig(),
    config
  )

  // HttpClint
  useEffect(() => {
    if (!appId || !defaultMergedConfig) return

    const httpClient = initGuardHttp(defaultMergedConfig.host)

    httpClient.setAppId(appId)

    tenantId && httpClient.setTenantId(tenantId)

    setHttpClint(httpClient)
  }, [appId, defaultMergedConfig, tenantId])

  const finallyConfig = useMergePublicConfig(appId, defaultMergedConfig)

  // SSO 登录
  useEffect(() => {
    if (!config?.isSSO || !authClint || !events || !httpClint) return

    trackSession().then((sessionData) => {
      // 这个接口没有 code, data, 直接返回了数据
      let typedData = (sessionData as unknown) as SessionData
      if (typedData.userInfo) {
        events?.onLogin?.(typedData.userInfo, authClint!)
      }
    })
  }, [appId, authClint, config?.isSSO, events, httpClint])

  useEffect(() => {
    if (httpClint && finallyConfig) {
      httpClint?.setBaseUrl(finallyConfig.host)
    }
  }, [finallyConfig, httpClint])

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
  }, [appId])

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
  useEffect(() => {
    if (initError) {
      events?.onLoadError?.(errorData)
    }
  }, [errorData, events, initError])

  const renderModule = useMemo(() => {
    if (initError)
      return <GuardErrorView initData={{ messages: errorData?.message }} />
    if (initSettingEnd && GuardLocalConfig) {
      return ComponentsMapping[moduleState.moduleName]({
        __changeModule: async (moduleName, initData) => {
          if (!events?.onBeforeChangeModule) {
            historyNext(moduleName)
            guardStateMachine?.next(moduleName, initData)
          } else if (await events.onBeforeChangeModule(moduleName, initData)) {
            historyNext(moduleName)
            guardStateMachine?.next(moduleName, initData)
          }
        },
      })
    } else {
      return GuardLocalConfig?.showLoading
        ? GuardLocalConfig?.loadingComponent
        : null
    }
  }, [
    initError,
    errorData?.message,
    initSettingEnd,
    GuardLocalConfig,
    moduleState.moduleName,
    moduleState.initData,
    appId,
    events,
    historyNext,
    guardStateMachine,
  ])

  return {
    renderModule: (
      <Context.Provider value={publicConfig}>{renderModule}</Context.Provider>
    ),
  }
}
