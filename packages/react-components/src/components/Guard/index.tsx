import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ConfigProvider } from 'antd'

import { ModuleContext } from 'src/context/module/context'
import { useAppId } from '../../hooks'
import { GuardLogin } from '../Login'
import { getAuthClient, initAuthClient } from './authClient'
import { initConfig, GuardConfig, getConfig } from './config'
import { getEvents, GuardEvents, initEvents } from './event'
import './styles.less'
const PREFIX_CLS = 'authing-ant'

// import { IG2FCProps } from 'src/classes'

export enum GuardModuleType {
  LOGIN = 'login',
}

const ComponentsMapping: Record<GuardModuleType, any> = {
  [GuardModuleType.LOGIN]: GuardLogin,
}

export interface GuardProps extends GuardEvents {
  appId: string
  config?: GuardConfig
}

export const Guard: React.FC<GuardProps> = ({
  appId,
  config,
  ...guardEvents
}) => {
  const [module, setModule] = useState<GuardModuleType>(GuardModuleType.LOGIN)

  const [initData, setInitData] = useState({})
  const [initSettingEnd, setInitSettingEnd] = useState(false)
  const [guardConfig, setGuardConfig] = useState<GuardConfig>({})

  useAppId(appId)

  // TODO 初始化的 Loging
  const initGuardSetting = useCallback(async () => {
    try {
      const { config: mergedConfig, publicConfig } = await initConfig(
        appId,
        config ?? {}
      )

      setGuardConfig(mergedConfig)

      const httpClient = initGuardHttp(mergedConfig?.host!)
      httpClient.setAppId(appId)
      httpClient.setUserpoolId(publicConfig.userPoolId)

      // TODO 这部分有点小问题 等待优化
      initI18n({}, mergedConfig.lang)

      initAuthClient(config, appId)

      // getEvents().onLoad?.(getAuthClient())
    } catch (error) {
      // getEvents().onLoadError?.(error)
    }

    // 初始化 结束
    setInitSettingEnd(true)
  }, [appId, config])

  useEffect(() => {
    initGuardSetting()
  }, [initGuardSetting])

  const spin = () => 'loading.............'

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      return ComponentsMapping[module]({
        appId,
        initData,
        config: guardConfig,
      })
    } else {
      return spin
    }
  }, [appId, guardConfig, initData, initSettingEnd, module])

  return (
    // TODO 这部分缺失 Loging 态
    <ConfigProvider prefixCls={PREFIX_CLS}>
      <ModuleContext
        value={{
          module,
          changeModule: setModule,
          setInitData,
        }}
      >
        {renderModule}
      </ModuleContext>
    </ConfigProvider>
  )
}
