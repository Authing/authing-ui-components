import { GuardModuleAction, GuardModuleType } from '../Guard/module'

export const codeMap: Record<number, GuardModuleAction> = {
  1636: {
    action: 'changeModule',
    module: GuardModuleType.MFA,
  },
  2333: {
    action: 'message',
    message: '密码错误',
  },
}
