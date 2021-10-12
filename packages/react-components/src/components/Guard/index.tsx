import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ModuleContext } from 'src/context/module/context'
import { useAppId } from '../../hooks'
import { GuardLogin } from '../Login'
import { initConfig, GuardConfig } from './config'
import { useAsyncFn } from 'react-use'

export enum GuardModuleType {
  LOGIN = 'login',
}

const ComponentsMapping: Record<
  GuardModuleType,
  (initData: object) => React.ReactNode
> = {
  [GuardModuleType.LOGIN]: GuardLogin,
}

export const Guard: React.FC<{
  appId: string
  config?: GuardConfig
}> = ({ appId, config }) => {
  const [module, setModule] = useState<GuardModuleType>(GuardModuleType.LOGIN)

  const [initData, setInitData] = useState({})
  const [initSettingEnd, setInitSettingEnd] = useState(false)

  useAppId(appId)

  // TODO 初始化的 Loging
  const initGuardSetting = useCallback(async () => {
    await initConfig(config, appId)
    setInitSettingEnd(true)
  }, [appId, config])

  useEffect(() => {
    initGuardSetting()
  }, [initGuardSetting])

  const renderModule = useMemo(() => {
    if (initSettingEnd) {
      console.log('初始化完成')
      return ComponentsMapping[module]({
        appId,
        ...initData,
      })
    } else {
      return 'loading.............'
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
