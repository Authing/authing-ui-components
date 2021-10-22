import { GuardConfig } from './config'
import { GuardModuleType } from './module'

export interface ModuleState {
  moduleName: GuardModuleType
  initData?: any
}

export enum ActionType {
  ChangeModule = 'ChangeModule',
  Back = 'Back',
}

export interface StateMachineLog {
  action: ActionType
  date: number
  dataSource: ModuleState
}

export type ChangeModuleEvent = (module: ModuleState) => void
export class GuardStateMachine {
  // 计数器
  private order: number = 0

  // 总体的配置信息
  private config: GuardConfig

  // 历史记录
  private moduleStateHistory: ModuleState[] = []

  private changeMouleEvent: ChangeModuleEvent

  // Log
  private stateMachineLog: Record<number, StateMachineLog> = {}

  constructor(
    changeMouleEvent: ChangeModuleEvent,
    initData: ModuleState,
    initConfig: GuardConfig
  ) {
    this.changeMouleEvent = changeMouleEvent

    this.config = initConfig

    this.historyPush(initData)
  }

  next(nextModelu: GuardModuleType, initData?: any) {
    const moduleData: ModuleState = {
      moduleName: nextModelu,
      initData,
    }

    this.changeMouleEvent(moduleData)

    this.historyPush(moduleData)
  }

  back() {
    if (this.moduleStateHistory.length <= 1) return

    const backModule = this.moduleStateHistory[1]
    this.changeMouleEvent(backModule)

    this.moduleStateHistory.splice(0, 1)
  }

  // 业务终点 Log 发送
  end() {
    console.log('业务终点 Log', JSON.stringify(this.stateMachineLog))
    console.log('业务终点 Config', JSON.stringify(this.config))

    // TODO 请求
  }

  historyPush(data: ModuleState) {
    this.moduleStateHistory.unshift(data)

    this.stateMachineLog[this.order++] = {
      action: ActionType.ChangeModule,
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
}
