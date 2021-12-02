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
  RECOVERY_CODE = 'recoveryCode',
  SUBMIT_SUCCESS = 'submitSuccess',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
  initData?: any
}