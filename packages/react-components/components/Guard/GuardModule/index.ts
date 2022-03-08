import { useReducer } from 'react'
import { GuardModuleType } from '..'
import { ModuleState } from './stateMachine'

interface IBaseAction<T = string, P = any> {
  type: T & string
  payload?: Partial<P>
}
