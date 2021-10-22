export enum GuardModuleType {
  ERROR = 'error',
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
  FORGETPASSWORD = 'forgetPassword',
  DOWNLOAD_AT = 'downloadAT',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
}
