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
import { getGuardHttp, GuardHttp, initGuardHttp } from '../_utils/guradHttp'
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
} from './stateMachine'
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
import { createGuardContext } from '../_utils/context'
import { ApplicationConfig } from '../AuthingGuard/api'
import { SessionData, trackSession } from './sso'
import zhCN from 'antd/lib/locale/zh_CN'
import enUS from 'antd/lib/locale/en_US'
import 'moment/locale/zh-cn'
import { GuardIdentityBindingAskView } from '../IdentityBindingAsk'
import { GuardIdentityBindingView } from '../IdentityBinding'
import {
  ChangeModuleApiCodeMapping,
  CodeAction,
} from '../_utils/responseManagement/interface'
import { AuthingResponse } from '../_utils/http'

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

const ComponentsMapping: Record<
  GuardModuleType,
  (props: GuardViewProps) => React.ReactNode
> = {
  [GuardModuleType.ERROR]: (props) => <GuardErrorView {...props} />,
  [GuardModuleType.LOGIN]: (props) => <GuardLoginView {...props} />,
  [GuardModuleType.MFA]: (props) => <GuardMFAView {...props} />,
  [GuardModuleType.REGISTER]: (props) => <GuardRegisterView {...props} />,
  [GuardModuleType.DOWNLOAD_AT]: (props) => <GuardDownloadATView {...props} />,
  [GuardModuleType.FORGET_PWD]: (props) => <GuardForgetPassword {...props} />,
  [GuardModuleType.CHANGE_PWD]: (props) => <GuardChangePassword {...props} />,
  [GuardModuleType.BIND_TOTP]: (props) => <GuardBindTotpView {...props} />,
  [GuardModuleType.ANY_QUESTIONS]: (props) => <GuardNeedHelpView {...props} />,
  [GuardModuleType.COMPLETE_INFO]: (props) => (
    <GuardCompleteInfoView {...props} />
  ),
  [GuardModuleType.RECOVERY_CODE]: (props) => (
    <GuardRecoveryCodeView {...props} />
  ),
  [GuardModuleType.SUBMIT_SUCCESS]: (props) => (
    <GuardSubmitSuccessView {...props} />
  ),
  [GuardModuleType.IDENTITY_BINDING_ASK]: (props) => (
    <GuardIdentityBindingAskView {...props} />
  ),
  [GuardModuleType.IDENTITY_BINDING]: (props) => (
    <GuardIdentityBindingView {...props} />
  ),
}

export interface GuardProps extends GuardEvents, IG2FCProps {
  tenantId?: string
  config?: Partial<GuardLocalConfig>
  visible?: boolean
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

export const Guard = (props: GuardProps) => {
  const { appId, tenantId, config } = props

  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: config?.defaultScenes ?? GuardModuleType.LOGIN,
    initData: config?.defaultInitData ?? {},
  }

  // 初始化 Loading 标识
  const [initSettingEnd, setInitSettingEnd] = useState(false)

  const [initError, setInitError] = useState(false)
  const [errorData, setErrorData] = useState<any>()

  // Config
  const [GuardLocalConfig, setGuardLocalConfig] = useState<GuardLocalConfig>()

  const [events, setEvents] = useState<GuardEvents>()
  const [authClint, setAuthClint] = useState<AuthenticationClient>()
  const [httpClint, setHttpClint] = useState<GuardHttp>()
  const [publicConfig, setPublicConfig] = useState<ApplicationConfig>()

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const { Context } = createGuardContext()

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

  const __changeModule = useCallback(
    async (moduleName: GuardModuleType, initData: any = {}) => {
      if (!events?.onBeforeChangeModule) {
        historyNext(moduleName)
        guardStateMachine?.next(moduleName, initData)
      } else if (await events.onBeforeChangeModule(moduleName, initData)) {
        historyNext(moduleName)
        guardStateMachine?.next(moduleName, initData)
      }
    },
    [events, guardStateMachine, historyNext]
  )

  // HttpClint
  useEffect(() => {
    if (!appId) return

    const httpClient = initGuardHttp(
      config?.host ?? getDefaultGuardLocalConfig().host
    )
    httpClient.setAppId(appId)
    tenantId && httpClient.setTenantId(tenantId)
    setHttpClint(httpClient)
  }, [appId, config?.host, tenantId])

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

  // 初始化 history state 为了身份源监听 popstate 生效 很无语 😓
  useEffect(() => {
    window.history.pushState(initState.moduleName, '', window.location.href)
  }, [initState.moduleName])

  useEffect(() => {
    if (httpClint && GuardLocalConfig && GuardLocalConfig.__appHost__) {
      httpClint?.setBaseUrl(GuardLocalConfig.__appHost__)
    }
  }, [GuardLocalConfig, httpClint])

  // I18n
  useEffect(() => {
    // TODO  国际化 这部分有点小问题 等待优化
    initI18n({}, config?.lang)
  }, [config?.lang])

  // AuthClient
  useEffect(() => {
    if (appId && GuardLocalConfig) {
      const authClint = initGuardAuthClient(GuardLocalConfig, appId, tenantId)
      setAuthClint(authClint)
    }
  }, [GuardLocalConfig, appId, tenantId])

  // initEvents
  useEffect(() => {
    if (!!GuardLocalConfig) {
      const events = guardEventsFilter(
        { ...props },
        GuardLocalConfig.openEventsMapping
      )
      setEvents(events)
    }
  }, [props, GuardLocalConfig])

  // 状态机相关
  useEffect(() => {
    const guardStateMachine = initGuardStateMachine(onChangeModule, initState)
    setGuardStateMachine(guardStateMachine)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 初始化 ErrorCode 拦截器
  useEffect(() => {
    if (!httpClint) return
    // 错误码处理回调 切换 module 和 错误信息提示
    const errorCodeCb = (code: CodeAction, res: AuthingResponse) => {
      const codeActionMapping = {
        [CodeAction.CHANGE_MODULE]: (res: AuthingResponse) => {
          const nextModule = ChangeModuleApiCodeMapping[res.apiCode!]

          const nextData = res.data

          __changeModule(nextModule, nextData)
        },
        [CodeAction.RENDER_MESSAGE]: (res: AuthingResponse) => {
          message.error(res.messages)
        },
      }

      const codeAction = codeActionMapping[code]

      codeAction(res)
    }
    // 设置响应拦截器（初始化拦截器 将错误处理回调传入拦截器）
    httpClint?.initErrorCodeInterceptor(errorCodeCb)
  }, [__changeModule, httpClint])

  // 设置 config
  useEffect(() => {
    if (guardStateMachine && GuardLocalConfig)
      guardStateMachine.setConfig(GuardLocalConfig)
  }, [GuardLocalConfig, guardStateMachine])

  const initPublicConfig = useCallback(async () => {
    if (!config && !appId) return
    try {
      // Config 初始化
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardLocalConfig()
      )
      setGuardLocalConfig(mergedConfig)
      setPublicConfig(publicConfig)

      getGuardHttp().setUserpoolId(publicConfig.userPoolId)
    } catch (error: any) {
      console.error(error)
      setErrorData(error)
      setInitError(true)
    } finally {
      // 初始化 结束
      setInitSettingEnd(true)
    }
  }, [appId, config])

  useEffect(() => {
    initPublicConfig()
  }, [initPublicConfig])

  useEffect(() => {
    if (GuardLocalConfig && GuardLocalConfig.contentCss)
      insertStyles(GuardLocalConfig.contentCss)
  }, [GuardLocalConfig])

  useEffect(() => {
    if (GuardLocalConfig && authClint) events?.onLoad?.(authClint)
  }, [GuardLocalConfig, authClint, events])

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
        appId,
        initData: moduleState.initData,
        config: GuardLocalConfig,
        ...events,
        __changeModule: __changeModule,
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
    __changeModule,
  ])

  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      locale={langMap[i18n.language as LangMAP]}
    >
      <Context.Provider value={publicConfig}>
        {config?.mode === GuardMode.Modal ? (
          <Modal
            className="authing-g2-render-module-modal"
            closeIcon={
              <IconFont type="authing-close-line" className="g2-modal-close" />
            }
            visible={props.visible}
            onCancel={props.onClose}
            keyboard={config.escCloseable}
            maskClosable={false} // 点击蒙层，是否允许关闭
            closable={config.clickCloseable} //是否显示右上角的关闭按钮
            getContainer={config.target ? config.target : false}
          >
            <div className="authing-g2-render-module" id="custom-css">
              {renderModule}
            </div>
          </Modal>
        ) : (
          <div className="authing-g2-render-module" id="custom-css">
            {renderModule}
          </div>
        )}
      </Context.Provider>
    </ConfigProvider>
  )
}
