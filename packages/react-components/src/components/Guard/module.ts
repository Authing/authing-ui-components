export enum GuardModuleType {
  ERROR = 'error',
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
  FORGETPASSWORD = 'forgetPassword',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
}
