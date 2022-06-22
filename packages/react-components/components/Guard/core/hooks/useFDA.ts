import { useEffect, useMemo, useState } from 'react'
import { updateFlowHandle } from '../../../_utils/flowHandleStorage'
import { GuardEvents } from '../../event'
import {
  GuardStateMachine,
  initGuardStateMachine,
  ModuleState,
} from '../../GuardModule/stateMachine'
import { GuardModuleType } from '../../module'
import { ChangeModuleCore } from './useModule'

/**
 * 初始化 FDA ，后续 Guard 渲染全部按照 FDA API 执行
 * @param onChangeModule FDA 内部更新组件核心方法
 * @param initState 初始化状态
 * @returns { guardStateMachine,setGuardStateMachine }
 */
export default function useFDA(
  onChangeModule: ChangeModuleCore,
  initState: ModuleState,
  events?: GuardEvents,
  authFlow?: boolean
) {
  const [
    guardStateMachine,
    setGuardStateMachine,
  ] = useState<GuardStateMachine>()

  const [isAuthFlow, setIsAuthFlow] = useState(true)

  /**
   * 初始化状态机
   */
  useEffect(() => {
    // 实例状态机 传入核心渲染 changeModule 方法
    const guardStateMachine = initGuardStateMachine(onChangeModule, initState)
    setGuardStateMachine(guardStateMachine)
    return () => {
      guardStateMachine.uninstallPopstate()
    }
  }, [initState, onChangeModule])

  /**
   * 状态机中断处理
   *
   * 部分手机端浏览器目前不支持 iframe 嵌套情况，FE 侧记录 flowHandle 状态机渲染状态流程发送 Sever 。
   */
  useEffect(() => {
    if (initState.initData?.flowHandle) {
      updateFlowHandle(initState.initData.flowHandle)
    }
  }, [initState.initData])

  /**
   * 组件调用切换方法
   */
  const moduleEvents = useMemo(() => {
    if (!events && !guardStateMachine) return undefined
    return {
      changeModule: async (moduleName: GuardModuleType, initData?: any) => {
        guardStateMachine?.next(moduleName, initData)
      },
      backModule: () => {
        guardStateMachine?.back()
      },
    }
  }, [events, guardStateMachine])

  // 初始化 Guard auth flow
  useEffect(() => {
    if (typeof authFlow === 'undefined') return

    setIsAuthFlow(!Boolean(authFlow))
  }, [authFlow])

  return {
    isAuthFlow,
    guardStateMachine,
    setGuardStateMachine,
    moduleEvents,
  }
}
