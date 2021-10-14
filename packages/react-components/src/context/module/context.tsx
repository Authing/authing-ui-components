import React, { FC } from 'react'
import { GuardModuleType } from 'src/components/Guard/module'
import { createBaseContext } from '../base'

export interface IModuleContext {
  module: string
  changeModule: React.Dispatch<GuardModuleType>
  setInitData: React.Dispatch<any>
}

const [Context, useBaseContext] = createBaseContext<IModuleContext>()

export const useModule: () => IModuleContext = () => {
  const guardContext = useBaseContext()

  return guardContext
}

export const ModuleContext: FC<{
  value: IModuleContext
}> = ({ children = null, value }) => {
  return <Context.Provider value={value}>{children}</Context.Provider>
}
