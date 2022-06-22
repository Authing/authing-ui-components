import { useReducer, useCallback } from 'react'
import { GuardEvents } from '../../event'
import { ModuleState } from '../../GuardModule/stateMachine'
import { GuardModuleType } from '../../module'

interface IBaseAction<T = string, P = any> {
  type: T & string
  payload?: Partial<P>
}

export interface ChangeModuleCore {
  (type: GuardModuleType, initData?: any): Promise<void>
}

// modules 定义
const moduleReducer: (
  state: ModuleState,
  action: IBaseAction<GuardModuleType, ModuleState>
) => ModuleState = (state, { type, payload }) => {
  return {
    moduleName: type,
    initData: payload?.initData,
  }
}

/**
 * Guard 组件渲染状态
 * @param initializeState 初始化数据
 * @param events Guard 事件对象
 * @returns moduleState 组件当前渲染状态，onChangeModule 切换状态方法
 */
export default function useModule(
  initializeState: ModuleState,
  events: GuardEvents = {}
) {
  // 核心控制组件渲染
  const [moduleState, _changeModule] = useReducer(
    moduleReducer,
    initializeState
  )

  /**
   * 是否允许跳转
   */
  const validateChangeModule: (
    type: GuardModuleType,
    initData: any
  ) => Promise<Promise<void> | boolean> = async (type, initData) => {
    if (events.onBeforeChangeModule) {
      return await events.onBeforeChangeModule(type, initData)
    }
    return true
  }

  /**
   * 切换组件当前渲染状态
   */
  const onChangeModule: ChangeModuleCore = useCallback(
    async (type: GuardModuleType, initData: any = {}) => {
      const pass = await validateChangeModule(type, initData)
      if (pass) {
        _changeModule({
          type,
          payload: {
            initData: initData ?? {},
          },
        })
      }
    },
    [events]
  )

  return {
    moduleState,
    onChangeModule,
  }
}
