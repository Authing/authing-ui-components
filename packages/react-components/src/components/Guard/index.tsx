import React, { useMemo, useState } from 'react'
import { ModuleContext } from 'src/context/module/context'
import { useAppId } from '../../hooks'
import { GuardLogin } from '../Login'

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
  config?: any
}> = ({ appId }) => {
  const [module, setModule] = useState<GuardModuleType>(GuardModuleType.LOGIN)

  const [initData, setInitData] = useState({})

  useAppId(appId)

  const renderModule = useMemo(
    () =>
      ComponentsMapping[module]({
        appId,
        ...initData,
      }),
    [appId, initData, module]
  )

  return (
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
