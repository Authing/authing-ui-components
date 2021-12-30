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
import { ShieldSpin } from '../ShieldSpin'
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
}

// 首页 init 数据
const initState: ModuleState = {
  moduleName: GuardModuleType.LOGIN,
  initData: {},
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
    const events = guardEventsFilter(props)
    setEvents(events)
  }, [props])

  // 状态机相关
  useEffect(() => {
    const guardStateMachine = initGuardStateMachine(onChangeModule, initState)
    setGuardStateMachine(guardStateMachine)
  }, [])

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
        __changeModule: (moduleName, initData) => {
          historyNext(initData)
          guardStateMachine?.next(moduleName, initData)
        },
      })
    } else {
      return (
        <div className="g2-init-setting-loading">
          <ShieldSpin size={100} />
        </div>
      )
    }
  }, [
    initSettingEnd,
    GuardLocalConfig,
    initError,
    errorData?.message,
    moduleState.moduleName,
    moduleState.initData,
    appId,
    events,
    historyNext,
    guardStateMachine,
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
            getContainer={config.target ? config.target : false}
          >
            <div className="authing-g2-render-module">{renderModule}</div>
          </Modal>
        ) : (
          <div className="authing-g2-render-module">{renderModule}</div>
        )}
      </Context.Provider>
    </ConfigProvider>
  )
}
