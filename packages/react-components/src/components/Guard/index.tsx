import React, { useState } from 'react'
import { ModuleContext } from 'src/context/module/context'
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

  return (
    <>
      <ModuleContext
        value={{
          module,
          changeModule: setModule,
          setInitData,
        }}
      >
        {ComponentsMapping[module]({
          appId,
          ...initData,
        })}
      </ModuleContext>
    </>
  )
}
