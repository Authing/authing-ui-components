import { useReducer } from 'react'
import { GuardModuleType } from '..'
import { ModuleState } from './stateMachine'

interface IBaseAction<T = string, P = any> {
  type: T & string
  payload?: Partial<P>
}

export const useGuardModule = () => {}

export const useInitGuardModule = (initState: ModuleState) => {
  const moduleReducer: (
    state: ModuleState,
    action: IBaseAction<GuardModuleType, ModuleState>
  ) => ModuleState = (_, { type, payload }) => {
    return {
      moduleName: type,
      initData: payload?.initData,
    }
  }

  const [moduleState, changeModuleState] = useReducer(moduleReducer, initState)
}
