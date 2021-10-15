export enum GuardModuleType {
  LOGIN = 'login',
  MFA = 'mfa',
}
export interface GuardModuleAction {
  action: string
  module: GuardModuleType
}
