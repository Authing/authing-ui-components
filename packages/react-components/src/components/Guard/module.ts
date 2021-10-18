export enum GuardModuleType {
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
}
export interface GuardModuleAction {
  action: string
  module: GuardModuleType
}
