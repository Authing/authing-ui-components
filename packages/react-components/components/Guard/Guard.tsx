import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { ConfigProvider, Modal } from 'antd'

import { GuardLoginView } from '../Login'

import { initAuthClient } from './authClient'
import { GuardEvents, guardEventsFilter } from './event'
import { initConfig, GuardConfig } from '../_utils/config'
import { initGuardHttp } from '../_utils/guradHttp'
import { initI18n } from '..//_utils/locales'
import { GuardMode, IG2FCProps } from '../Type'
import { getDefaultGuardConfig } from './config'
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
import './styles.less'
import { IconFont } from '../AuthingGuard/IconFont'

const PREFIX_CLS = 'authing-ant'

const ComponentsMapping: Record<
  GuardModuleType,
  (props: GuardViewProps) => React.ReactNode
> = {
  [GuardModuleType.ERROR]: (props) => <div>Todo Error Module</div>,
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
}

export interface GuardProps extends GuardEvents, IG2FCProps {
  config?: Partial<GuardConfig>
  visible?: boolean
}

interface GuardViewProps extends GuardProps {
  config: GuardConfig
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
  const { appId, config, onLoad, onLoadError } = props

  // 整合一下 所有的事件
  const events = guardEventsFilter(props)

  // 初始化 Loading 标识
  const [initSettingEnd, setInitSettingEnd] = useState(false)

  // Config
  const [guardConfig, setGuardConfig] = useState<GuardConfig>(
    getDefaultGuardConfig()
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
      // Config 初始化
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardConfig()
      )

      setGuardConfig(mergedConfig)

      // Rest 初始化
      const httpClient = initGuardHttp(mergedConfig?.host!)
      httpClient.setAppId(appId)
      httpClient.setUserpoolId(publicConfig.userPoolId)

      // TODO  国际化 这部分有点小问题 等待优化
      initI18n({}, mergedConfig.lang)

      // Authing JS SDK
      const authClient = initAuthClient(mergedConfig, appId)

      onLoad?.(authClient)

      // 状态机 初始化
      const guardStateMachine = new GuardStateMachine(onChangeModule, initState)
      guardStateMachine.setConfig(mergedConfig)
      setGuardStateMachine(guardStateMachine)

      // 初始化 结束
      setInitSettingEnd(true)
    } catch (error) {
      onLoadError?.(error)

      console.error(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, config, onLoad, onLoadError])

  useEffect(() => {
    initGuardSetting()
  }, [initGuardSetting])

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      return ComponentsMapping[moduleState.moduleName]({
        appId,
        initData: moduleState.initData,
        config: guardConfig,
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
    events,
    guardConfig,
    guardStateMachine,
    historyNext,
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
          maskClosable={true} //点击蒙层，是否允许关闭
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
