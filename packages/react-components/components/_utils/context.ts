import React, { useContext } from 'react'
import { GuardEvents, GuardLocalConfig, GuardModuleType } from '..'
import { ApplicationConfig } from '../AuthingGuard/api'
import { ModuleState } from '../Guard/GuardModule/stateMachine'
import { GuardHttp } from './guardHttp'

const GuardFinallyConfigContext = React.createContext<GuardLocalConfig>(
  {} as GuardLocalConfig
)

export const createGuardFinallyConfigContext = () => {
  const Provider = GuardFinallyConfigContext.Provider
  const Consumer = GuardFinallyConfigContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardFinallyConfigContext,
  }
}

const GuardDefaultMergedConfigContext = React.createContext<GuardLocalConfig>(
  {} as GuardLocalConfig
)

export const createGuardDefaultMergedConfigContext = () => {
  const Provider = GuardDefaultMergedConfigContext.Provider
  const Consumer = GuardDefaultMergedConfigContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardDefaultMergedConfigContext,
  }
}

const GuardPublicConfigContext = React.createContext<ApplicationConfig>(
  {} as ApplicationConfig
)

export const createGuardPublicConfigContext = () => {
  const Provider = GuardPublicConfigContext.Provider
  const Consumer = GuardPublicConfigContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardPublicConfigContext,
  }
}

const GuardHttpClientContext = React.createContext<GuardHttp>({} as GuardHttp)

export const createHttpClientContext = () => {
  const Provider = GuardHttpClientContext.Provider
  const Consumer = GuardHttpClientContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardHttpClientContext,
  }
}

const GuardAppIdContext = React.createContext<string>('')

export const createAppIdContext = () => {
  const Provider = GuardAppIdContext.Provider
  const Consumer = GuardAppIdContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardAppIdContext,
  }
}

const GuardInitDataContext = React.createContext<any>({})

export const createInitDataContext = () => {
  const Provider = GuardInitDataContext.Provider
  const Consumer = GuardInitDataContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardInitDataContext,
  }
}

const GuardCurrentModuleContext = React.createContext<ModuleState>(
  {} as ModuleState
)

export const createGuardCurrentModuleContext = () => {
  const Provider = GuardCurrentModuleContext.Provider
  const Consumer = GuardCurrentModuleContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardCurrentModuleContext,
  }
}

const GuardEventsContext = React.createContext<
  Partial<GuardEvents> | undefined
>(undefined)

export const createGuardEventsContext = () => {
  const Provider = GuardEventsContext.Provider
  const Consumer = GuardEventsContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardEventsContext,
  }
}

const GuardModuleContext = React.createContext<{
  changeModule?: (moduleName: GuardModuleType, initData?: any) => Promise<void>
  backModule?: () => void
}>({})

export const createGuardModuleContext = () => {
  const Provider = GuardModuleContext.Provider
  const Consumer = GuardModuleContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardModuleContext,
  }
}

const GuardContextLoaded = React.createContext<boolean>(false)

export const createGuardContextLoaded = () => {
  const Provider = GuardContextLoaded.Provider
  const Consumer = GuardContextLoaded.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardContextLoaded,
  }
}

const GuardIsAuthFlowContext = React.createContext<boolean>(false)

export const createGuardIsAuthFlowContext = () => {
  const Provider = GuardIsAuthFlowContext.Provider
  const Consumer = GuardIsAuthFlowContext.Consumer

  return {
    Provider,
    Consumer,
    Context: GuardIsAuthFlowContext,
  }
}

export const useGuardPublicConfig = () => useContext(GuardPublicConfigContext)

export const useGuardHttpClient = () => useContext(GuardHttpClientContext)

export const useGuardDefaultMergedConfig = () =>
  useContext(GuardDefaultMergedConfigContext)

export const useGuardAppId = () => useContext(GuardAppIdContext)

export function useGuardInitData<T>(): T {
  const data = useContext(GuardInitDataContext)
  return data as T
}

export const useGuardCurrentModule = () => useContext(GuardCurrentModuleContext)

export const useGuardEvents = () => useContext(GuardEventsContext)

export const useGuardModule = () => useContext(GuardModuleContext)

export const useGuardFinallyConfig = () => useContext(GuardFinallyConfigContext)

export const useGuardContextLoaded = () => useContext(GuardContextLoaded)

export const useGuardIsAuthFlow = () => useContext(GuardIsAuthFlowContext)
