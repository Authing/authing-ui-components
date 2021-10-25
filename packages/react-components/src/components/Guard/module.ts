export enum GuardModuleType {
  ERROR = 'error',
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
  FORGETPASSWORD = 'forgetPassword',
  DOWNLOAD_AT = 'downloadAT',
  BIND_TOTP = 'bindTotp',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
}
