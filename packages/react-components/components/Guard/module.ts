export enum GuardModuleType {
  ERROR = 'error',
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
  FORGET_PWD = 'forgetPassword',
  CHANGE_PWD = 'changePassword',
  DOWNLOAD_AT = 'downloadAT',
  BIND_TOTP = 'bindTotp',
  ANY_QUESTIONS = 'anyQuestions',
  COMPLETE_INFO = 'completeInfo',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
}
