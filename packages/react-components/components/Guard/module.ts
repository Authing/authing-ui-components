export enum GuardModuleType {
  ERROR = 'error',
  LOGIN = 'login',
  REGISTER = 'register',
  MFA = 'mfa',
  FORGET_PWD = 'forgetPassword',
  FORCED_PASSWORD_RESET = 'forcedPasswordReset',
  FIRST_LOGIN_PASSWORD = 'firstLoginPassword',
  DOWNLOAD_AT = 'downloadAT',
  BIND_TOTP = 'bindTotp',
  ANY_QUESTIONS = 'anyQuestions',
  LOGIN_COMPLETE_INFO = 'loginCompleteInfo',
  REGISTER_PASSWORD = 'registerPassword',
  REGISTER_COMPLETE_INFO = 'registerCompleteInfo',
  RECOVERY_CODE = 'recoveryCode',
  SUBMIT_SUCCESS = 'submitSuccess',
  IDENTITY_BINDING_ASK = 'identityBindingAsk',
  IDENTITY_BINDING = 'identityBinding',
}
export interface GuardModuleAction {
  action: string
  module?: GuardModuleType
  message?: string
  initData?: any
}
