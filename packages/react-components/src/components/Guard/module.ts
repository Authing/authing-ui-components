export enum GuardModuleType {
  LOGIN = 'login',
  MFA = 'mfa',
}

interface GuardModuleAction {
  action: string
  module: GuardModuleType
}

export const moduleCodeMap: Record<number, GuardModuleAction> = {
  1636: {
    action: 'move',
    module: GuardModuleType.MFA,
  },
}
