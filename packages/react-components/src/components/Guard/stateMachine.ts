import { GuardConfig } from './config'
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
export class GuardStateMachine {
  // 计数器
  private order: number = 0

  // 总体的配置信息
  private config: Partial<GuardConfig> = {}

  // 历史记录
  private moduleStateHistory: ModuleState[] = []

  private changeMouleEvent: ChangeModuleEvent

  // Log
  private stateMachineLog: Record<number, StateMachineLog> = {}

  constructor(changeMouleEvent: ChangeModuleEvent, initData: ModuleState) {
    this.changeMouleEvent = changeMouleEvent

    this.historyPush(initData, ActionType.Init)
    console.log('history', this.moduleStateHistory)
    console.log('log', this.stateMachineLog)
  }

  // next = (nextModelu: GuardModuleType, initData: any) => {
  //   const moduleData: ModuleState = {
  //     moduleName: nextModelu,
  //     initData,
  //   }

  //   this.changeMouleEvent(nextModelu, initData)

  //   this.historyPush(moduleData)
  // }

  // next = (back: number) => {
  //   if (back !== -1) return
  // }

  next(nextModelu: GuardModuleType, initData: any) {
    const moduleData: ModuleState = {
      moduleName: nextModelu,
      initData,
    }

    this.changeMouleEvent(nextModelu, initData)

    this.historyPush(moduleData)
  }

  back = () => {
    if (this.moduleStateHistory.length <= 1) return

    const backModule = this.moduleStateHistory[1]
    this.changeMouleEvent(backModule.moduleName, backModule.initData)

    this.moduleStateHistory.splice(0, 1)
  }

  // 业务终点 Log 发送
  end = () => {
    console.log('业务终点 Log', JSON.stringify(this.stateMachineLog))
    console.log('业务终点 Config', JSON.stringify(this.config))

    // TODO 请求
  }

  historyPush(
    data: ModuleState,
    actionType: ActionType = ActionType.ChangeModule
  ) {
    this.moduleStateHistory.unshift(data)

    this.stateMachineLog[this.order++] = {
      action: actionType,
      date: new Date().getTime(),
      dataSource: data,
    }

    if (this.moduleStateHistory.length > 10)
      this.moduleStateHistory.splice(10, this.moduleStateHistory.length - 10)
  }

  historyBack(data: ModuleState) {
    if (this.moduleStateHistory.length <= 1) return

    this.moduleStateHistory.splice(0, 1)

    this.stateMachineLog[this.order++] = {
      action: ActionType.Back,
      date: new Date().getTime(),
      dataSource: data,
    }
  }

  setConfig(config: GuardConfig) {
    this.config = config
  }
}
