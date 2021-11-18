import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { ConfigProvider, message, Modal } from 'antd'

import { GuardLoginView } from '../Login'

import { initAuthClient } from './authClient'
import { GuardEvents, guardEventsFilter } from './event'
import { initConfig } from '../_utils/config'
import { insertStyles } from '../_utils'
import { getGuardHttp, initGuardHttp } from '../_utils/guradHttp'
import { initI18n } from '..//_utils/locales'
import { IG2FCProps } from '../Type'
import { getDefaultGuardLocalConfig, GuardLocalConfig } from './config'
import { ShieldSpin } from '../ShieldSpin'
import { GuardModuleType } from './module'
import { GuardMFAView } from '../MFA'
import { GuardRegisterView } from '../Register'
import { GuardDownloadATView } from '../DownloadAuthenticator'
import { GuardStateMachine, useHistoryHijack } from './stateMachine'
import { GuardBindTotpView } from '../BindTotp'
import { GuardForgetPassword } from '../ForgetPassword'
import { GuardChangePassword } from '../ChangePassword'
import { GuardNeedHelpView } from '../NeedHelpView'
import { GuardCompleteInfoView } from '../CompleteInfo'
import { GuardRecoveryCodeView } from '../RecoveryCode'
import './styles.less'
import { IconFont } from '../AuthingGuard/IconFont'
import { GuardErrorView } from '../Error'
import { GuardMode } from '..'
import { GuardSubmitSuccessView } from '../SubmitSuccess'

const PREFIX_CLS = 'authing-ant'

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
  // 整合一下 所有的事件
  const events = guardEventsFilter(props)

  // 初始化 Loading 标识
  const [initSettingEnd, setInitSettingEnd] = useState(false)

  const [initError, setInitError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Config
  const [GuardLocalConfig, setGuardLocalConfig] = useState<GuardLocalConfig>(
    getDefaultGuardLocalConfig()
  )

  // 状态机
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  // 劫持浏览器 History
  const [historyNext] = useHistoryHijack(guardStateMachine?.back)

  // 首页 init 数据
  const initState: ModuleState = {
    moduleName: GuardModuleType.LOGIN,
    initData: {},
  }

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

  // 切换 Module
  const onChangeModule = (moduleName: GuardModuleType, initData: any = {}) => {
    changeModule({
      type: moduleName,
      payload: {
        initData: initData ?? {},
      },
    })
  }

  // 初始化 Guard 一系列的东西
  const initGuardSetting = useCallback(async () => {
    try {
      // Rest 初始化
      const httpClient = initGuardHttp(
        config?.host ?? getDefaultGuardLocalConfig().host
      )
      httpClient.setAppId(appId)
      tenantId && httpClient.setTenantId(tenantId)

      // Config 初始化
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardLocalConfig()
      )

      httpClient.setUserpoolId(publicConfig.userPoolId)
      setGuardLocalConfig(mergedConfig)

      // TODO  国际化 这部分有点小问题 等待优化
      initI18n({}, mergedConfig.lang)

      // Authing JS SDK
      const authClient = initAuthClient(mergedConfig, appId, tenantId)

      events?.onLoad?.(authClient)

      // 状态机 初始化
      const guardStateMachine = new GuardStateMachine(onChangeModule, initState)
      guardStateMachine.setConfig(mergedConfig)
      setGuardStateMachine(guardStateMachine)
    } catch (error: any) {
      events?.onLoadError?.(error)

      setErrorMessage(error.message)
      setInitError(true)

      console.error(error)
    } finally {
      // 初始化 结束
      setInitSettingEnd(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    initGuardSetting()
    console.log('useEffect')
  }, [initGuardSetting])

  useEffect(() => {
    insertStyles(GuardLocalConfig.contentCss)
  }, [GuardLocalConfig.contentCss])

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      if (initError)
        return <GuardErrorView initData={{ messages: errorMessage }} />
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
    appId,
    errorMessage,
    events,
    GuardLocalConfig,
    guardStateMachine,
    historyNext,
    initError,
    initSettingEnd,
    moduleState.initData,
    moduleState.moduleName,
  ])

  return (
    // TODO 这部分缺失 Loging 态
    <ConfigProvider prefixCls={PREFIX_CLS}>
      {config?.mode === GuardMode.Modal ? (
        <Modal
          className="authing-g2-render-module-modal"
          closeIcon={
            <IconFont type="authing-close-line" className="g2-modal-close" />
          }
          visible={props.visible}
          onCancel={props.onClose}
          keyboard={config.escCloseable}
          maskClosable={false} //点击蒙层，是否允许关闭
          getContainer={config.target ? config.target : false}
        >
          <div className="authing-g2-render-module">{renderModule}</div>
        </Modal>
      ) : (
        <div className="authing-g2-render-module">{renderModule}</div>
      )}
    </ConfigProvider>
  )
}
