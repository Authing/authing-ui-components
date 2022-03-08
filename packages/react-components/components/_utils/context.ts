import React, { useContext } from 'react'
import { GuardEvents, GuardLocalConfig, GuardModuleType } from '..'
import { ApplicationConfig } from '../AuthingGuard/api'
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

export const useGuardPublicConfig = () => useContext(GuardPublicConfigContext)

export const useGuardHttpClient = () => useContext(GuardHttpClientContext)

export const useGuardAppId = () => useContext(GuardAppIdContext)

export function useGuardInitData<T>(): T {
  const data = useContext(GuardInitDataContext)
  return data as T
}

export const useGuardEvents = () => useContext(GuardEventsContext)

export const useGuardModule = () => useContext(GuardModuleContext)

export const useGuardFinallyConfig = () => useContext(GuardFinallyConfigContext)
