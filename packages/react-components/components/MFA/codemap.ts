import { GuardModuleAction, GuardModuleType } from '../Guard/module'

export const codeMap: Record<number, GuardModuleAction> = {
  // 待添加
  2021: {
    action: 'changeModule',
    module: GuardModuleType.LOGIN,
  },
  1700: {
    action: 'insideFix',
    message: '校验失败，组件内部自行处理',
  },
  1701: {
    action: 'insideFix',
    message: '校验失败，组件内部自行处理',
  },
  1702: {
    action: 'insideFix',
    message: '校验失败，组件内部自行处理',
  },
}
