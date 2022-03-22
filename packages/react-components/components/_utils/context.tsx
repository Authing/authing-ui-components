import React, { useContext } from 'react'
import { GuardEvents, GuardLocalConfig, GuardModuleType } from '..'
import { ApplicationConfig } from '../AuthingGuard/api'
import { ModuleState } from '../Guard/GuardModule/stateMachine'
import { GuardHttp } from './guardHttp'

export interface IGuardContext {
  finallyConfig: GuardLocalConfig

  defaultMergedConfig: GuardLocalConfig

  publicConfig: ApplicationConfig

  httpClient: GuardHttp

  appId: string

  initData: any

  currentModule: ModuleState

  events: Partial<GuardEvents>

  changeModule?: (moduleName: GuardModuleType, initData?: any) => Promise<void>

  backModule?: () => void

  isAuthFlow: boolean

  contextLoaded: boolean
}

const DefaultGuardX: IGuardContext = {
  finallyConfig: {} as GuardLocalConfig,

  defaultMergedConfig: {} as GuardLocalConfig,

  publicConfig: {} as ApplicationConfig,

  httpClient: {} as GuardHttp,

  appId: '',

  initData: {},

  currentModule: {} as ModuleState,

  events: {} as Partial<GuardEvents>,

  isAuthFlow: false,

  contextLoaded: false,
}

const GuardXContext = React.createContext<IGuardContext>(DefaultGuardX)

export const createGuardXContext = () => {
  const Provider = GuardXContext.Provider
  const Consumer = GuardXContext.Consumer

  const guardXProvider: React.FC<{ value: Partial<IGuardContext> }> = ({
    value,
    children,
  }) => {
    return (
      <Provider
        value={{
          ...DefaultGuardX,
          ...value,
        }}
      >
        {children}
      </Provider>
    )
  }

  return {
    Provider: guardXProvider,
    Consumer,
  }
}

export const useGuardPublicConfig = () => useContext(GuardXContext).publicConfig

export const useGuardHttpClient = () => useContext(GuardXContext).httpClient

export const useGuardDefaultMergedConfig = () =>
  useContext(GuardXContext).defaultMergedConfig

export const useGuardAppId = () => useContext(GuardXContext).appId

export function useGuardInitData<T>(): T {
  const { initData } = useContext(GuardXContext)
  return initData as T
}

export const useGuardCurrentModule = () =>
  useContext(GuardXContext).currentModule

export const useGuardEvents = () => useContext(GuardXContext).events

export const useGuardModule = () => {
  const guardX = useContext(GuardXContext)

  return {
    changeModule: guardX.changeModule,
    backModule: guardX.backModule,
  }
}

export const useGuardFinallyConfig = () =>
  useContext(GuardXContext).finallyConfig

export const useGuardContextLoaded = () =>
  useContext(GuardXContext).contextLoaded

export const useGuardIsAuthFlow = () => useContext(GuardXContext).isAuthFlow
