import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ModuleContext } from 'src/context/module/context'
import { useAppId } from '../../hooks'
import { GuardLogin } from '../Login'
import { getAuthClient, initAuthClient } from './authClient'
import { initConfig, GuardConfig } from './config'
import { getEvents, GuardEvents, initEvents } from './event'

export enum GuardModuleType {
  LOGIN = 'login',
}

const ComponentsMapping: Record<
  GuardModuleType,
  (initData: object) => React.ReactNode
> = {
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

  useAppId(appId)

  // TODO 初始化的 Loging
  const initGuardSetting = useCallback(async () => {
    try {
      initEvents(guardEvents)
      await initConfig(config, appId)
      initAuthClient(config, appId)

      getEvents().onLoad?.(getAuthClient())
    } catch (error) {
      getEvents().onLoadError?.(error)
    }

    // 初始化 结束
    setInitSettingEnd(true)
  }, [appId, config, guardEvents])

  useEffect(() => {
    initGuardSetting()
  }, [initGuardSetting])

  const spin = () => 'loading.............'

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      return ComponentsMapping[module]({
        appId,
        ...initData,
      })
    } else {
      return spin
    }
  }, [appId, initData, initSettingEnd, module])

  return (
    // TODO 这部分缺失 Loging 态
    <>
      <ModuleContext
        value={{
          module,
          changeModule: setModule,
          setInitData,
        }}
      >
        {renderModule}
      </ModuleContext>
    </>
  )
}
