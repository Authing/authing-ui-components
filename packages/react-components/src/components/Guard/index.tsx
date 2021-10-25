import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { ConfigProvider } from 'antd'

import { GuardLoginView } from '../Login'

import { initAuthClient } from './authClient'
import { GuardEvents, guardEventsFilter } from './event'
import { initConfig, GuardConfig } from 'src/utils/config'
import { initGuardHttp } from 'src/utils/guradHttp'
import { initI18n } from 'src/locales'
import { IG2FCProps } from 'src/classes'
import { getDefaultGuardConfig } from './config'
import { Spin } from '../Spin'
import { GuardModuleType } from './module'
import { GuardMFAView } from '../MFA'
import './styles.less'
import { GuardRegisterView } from '../Register'
import { GuardDownloadATView } from '../DownloadAuthenticator'
import { GuardStateMachine } from './stateMachine'
import { GuardBindTotpView } from '../BindTotp'

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
  [GuardModuleType.FORGETPASSWORD]: (props) => (
    <div>Todo forgetPassword Module</div>
  ),
  [GuardModuleType.BIND_TOTP]: (props) => <GuardBindTotpView {...props} />,
}

export interface GuardProps extends GuardEvents, IG2FCProps {
  config?: Partial<GuardConfig>
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
  const [initSettingEnd, setInitSettingEnd] = useState(false)
  const [guardConfig, setGuardConfig] = useState<GuardConfig>(
    getDefaultGuardConfig()
  )
  // const [
  //   guardStateMachine,
  //   setGuardStateMachine,
  // ] = useState<GuardStateMachine>()

  const initState: ModuleState = {
    moduleName: GuardModuleType.LOGIN,
    initData: {},
  }

  const moduleReducer: (
    state: ModuleState,
    action: IBaseAction<GuardModuleType, ModuleState>
  ) => ModuleState = (state, { type, payload }) => {
    return {
      moduleName: type,
      initData: payload?.initData,
    }
  }

  const [moduleState, changeModule] = useReducer(moduleReducer, initState)

  const events = guardEventsFilter(props)

  // 切换 module
  const onChangeModule = (moduleName: GuardModuleType, initData: any = {}) => {
    changeModule({
      type: moduleName,
      payload: {
        initData: initData ?? {},
      },
    })
  }

  // const guardStateMachine = new GuardStateMachine(onChangeModule, initState)

  const initGuardSetting = useCallback(async () => {
    console.log('init Guard setting')
    try {
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {},
        getDefaultGuardConfig()
      )

      setGuardConfig(mergedConfig)

      const httpClient = initGuardHttp(mergedConfig?.host!)
      httpClient.setAppId(appId)
      httpClient.setUserpoolId(publicConfig.userPoolId)

      // TODO 这部分有点小问题 等待优化
      initI18n({}, mergedConfig.lang)

      const authClient = initAuthClient(mergedConfig, appId)
      // setClient(authClient)
      onLoad?.(authClient)

      // guardStateMachine.setConfig(mergedConfig)

      // // 初始化 Guard 状态机
      // setGuardStateMachine(
      //   new GuardStateMachine(onChangeModule, initState, mergedConfig)
      // )

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
        __changeModule: onChangeModule,
        // __codePaser: codePaser,
      })
    } else {
      return <Spin />
    }
  }, [
    appId,
    events,
    guardConfig,
    initSettingEnd,
    moduleState.initData,
    moduleState.moduleName,
  ])

  return (
    // TODO 这部分缺失 Loging 态
    <ConfigProvider prefixCls={PREFIX_CLS}>
      <div className="authing-g2-render-module">{renderModule}</div>
    </ConfigProvider>
  )
}
