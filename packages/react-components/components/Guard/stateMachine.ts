import { useEffect } from 'react'
import { GuardComponentConifg, GuardLocalConfig } from './config'
import { GuardModuleType } from './module'

export interface ModuleState {
  moduleName: GuardModuleType
  initData?: any
}

export enum ActionType {
  ChangeModule = 'ChangeModule',
  Back = 'Back',
  Init = 'Init',
}

export interface StateMachineLog {
  action: ActionType
  date: number
  dataSource: ModuleState
}

export type ChangeModuleEvent = (
  nextModelu: GuardModuleType,
  initData?: any
) => void

let guardStateMachine: GuardStateMachine

export class GuardStateMachine {
  // 计数器
  private order: number = 0

  // 总体的配置信息
  private config: GuardComponentConifg = {}

  // 历史记录
  private moduleStateHistory: ModuleState[] = []

  private changeMouleEvent: ChangeModuleEvent

  // Log
  private stateMachineLog: Record<number, StateMachineLog> = {}

  constructor(changeMouleEvent: ChangeModuleEvent, initData: ModuleState) {
    this.changeMouleEvent = changeMouleEvent

    this.historyPush(initData, ActionType.Init)
  }
  globalWindow = (): Window | undefined =>
    typeof window !== undefined ? window : undefined

  next = (nextModelu: GuardModuleType, initData: any) => {
    const moduleData: ModuleState = {
      moduleName: nextModelu,
      initData,
    }
    this.changeMouleEvent(nextModelu, initData)
    // 快照history
    if (
      moduleData.moduleName === this.moduleStateHistory.slice(-1)[0].moduleName
    ) {
      window.history.back()
    } else {
      this.historyPush(moduleData)
    }
    console.log('next Log', this.stateMachineLog)
    console.log('next History', this.moduleStateHistory)
  }

  back = (initData: any = {}) => {
    if (this.moduleStateHistory.length <= 1) return

    const backModule = this.moduleStateHistory[1]
    this.changeMouleEvent(backModule.moduleName, {
      ...initData,
      ...backModule.initData,
    })
    this.moduleStateHistory.splice(0, 1)
    console.log('back Log', this.stateMachineLog)
  }

  // 业务终点 Log 发送
  end = () => {
    console.log('业务终点 Log', this.stateMachineLog)

    // TODO 请求
  }

  historyPush = (
    data: ModuleState,
    actionType: ActionType = ActionType.ChangeModule
  ) => {
    this.moduleStateHistory.unshift(data)

    this.stateMachineLog[this.order++] = {
      action: actionType,
      date: new Date().getTime(),
      dataSource: data,
    }

    if (this.moduleStateHistory.length > 10)
      this.moduleStateHistory.splice(10, this.moduleStateHistory.length - 10)
  }

  historyBack = (data: ModuleState) => {
    if (this.moduleStateHistory.length <= 1) return

    this.moduleStateHistory.splice(0, 1)

    this.stateMachineLog[this.order++] = {
      action: ActionType.Back,
      date: new Date().getTime(),
      dataSource: data,
    }
  }

  setConfig = (config: GuardLocalConfig) => {
    this.config = config
  }
}

export const useHistoryHijack = (back?: () => void) => {
  const next = (state: any = {}) => {
    window?.history.pushState(state, '', window?.location.href)
  }

  useEffect(() => {
    const onPopstate = () => {
      back?.()
    }
    back && window?.addEventListener('popstate', onPopstate)

    return () => {
      back && window.removeEventListener('popstate', onPopstate)
    }
  }, [back])

  return [next]
}

export const initGuardStateMachine = (
  changeMouleEvent: ChangeModuleEvent,
  initData: ModuleState
) => {
  guardStateMachine = new GuardStateMachine(changeMouleEvent, initData)
  return guardStateMachine
}

export const getGuardStateMachine = () => {
  if (!guardStateMachine) throw new Error('Please initialize GuardStateMachine')

  return guardStateMachine
}

export const useGuardStateMachine = () => getGuardStateMachine()
