import { AuthenticationClient, CommonMessage, User } from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'

import {
  SocialConnectionItem,
  EnterpriseConnectionItem,
} from '../../../components/AuthingGuard/api'

export type { AuthenticationClient, CommonMessage, User } from 'authing-js-sdk'

export enum GuardMode {
  Modal = 'modal',
  Normal = 'normal',
}

export enum LoginMethods {
  LDAP = 'ldap',
  AppQr = 'app-qrcode',
  Password = 'password',
  PhoneCode = 'phone-code',
  WxMinQr = 'wechat-miniprogram-qrcode', // 对应社会化登录的 wechat:miniprogram:qrconnect(小程序扫码登录)
  AD = 'ad', // 对应企业身份源的 Windows AD 登录
}

export enum RegisterMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum GuardScenes {
  Login = 'login',
  Register = 'register',
  MfaVerify = 'mfaVerify',
  RestPassword = 'restPassword',
}

export enum ResetPwdMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum SocialConnections {
  Qq = 'qq',
  Weibo = 'weibo',
  // Alipay = 'alipay',
  Github = 'github',
  Google = 'google',
  WxPc = 'wechat:pc',
  Dingtalk = 'dingtalk',
  // WxMobile = 'wechat:mobile',
  WxWCorpQr = 'wechatwork:corp:qrconnect',
  // WxMinQr = 'wechat:miniprogram:qrconnect',
  // WxWebAuth = 'wechat:webpage-authorization',
  // WxMinApp = 'wechat:miniprogram:app-launch',
  // WxMinDefault = 'wechat:miniprogram:default',
  WxWSPQr = 'wechatwork:service-provider:qrconnect',
  WxWSPAuth = 'wechatwork:service-provider:authorization',
}

export enum Protocol {
  AD = 'ad',
  CAS = 'cas',
  LDAP = 'ldap',
  OIDC = 'oidc',
  SAML = 'saml',
  OAUTH = 'oauth',
  AZURE_AD = 'azure-ad',
}

// export enum GuardEventsKebab {
//   // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
//   Load = 'load',
//   // 加载失败
//   LoadError = 'load-error',
//   // 用户登录成功
//   Login = 'login',
//   // 用户登录失败
//   LoginError = 'login-error',
//   // 注册成功
//   Register = 'register',
//   // 注册失败
//   RegisterError = 'register-error',
//   // 忘记密码邮件发送成功
//   PwdEmailSend = 'pwd-email-send',
//   // 忘记密码邮件发送失败
//   PwdEmailSendError = 'pwd-email-send-error',
//   // 忘记密码手机验证码发送成功
//   PwdPhoneSend = 'pwd-phone-send',
//   // 忘记密码手机验证码发送失败
//   PwdPhoneSendError = 'pwd-phone-send-error',
//   // 重置密码成功
//   PwdReset = 'pwd-reset',
//   // 重置密码失败
//   PwdResetError = 'pwd-reset-error',
//   // 表单关闭事件
//   Close = 'close',
// }

// export interface GuardEventsCamelCase {
//   // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
//   [GuardEvents.Load]: 'onLoad'
//   // 加载失败
//   [GuardEvents.LoadError]: 'onLoadError'
//   // 用户登录成功
//   [GuardEvents.Login]: 'onLogin'
//   // 用户登录失败
//   [GuardEvents.LoginError]: 'onLoginError'
//   // 注册成功
//   [GuardEvents.Register]: 'onRegister'
//   // 注册失败
//   [GuardEvents.RegisterError]: 'onRegisterError'
//   // 忘记密码邮件发送成功
//   [GuardEvents.PwdEmailSend]: 'onPwdEmailSend'
//   // 忘记密码邮件发送失败
//   [GuardEvents.PwdEmailSendError]: 'onPwdEmailSendError'
//   // 忘记密码手机验证码发送成功
//   [GuardEvents.PwdPhoneSend]: 'onPwdPhoneSend'
//   // 忘记密码手机验证码发送失败
//   [GuardEvents.PwdPhoneSendError]: 'onPwdPhoneSendError'
//   // 重置密码成功
//   [GuardEvents.PwdReset]: 'onPwdReset'
//   // 重置密码失败
//   [GuardEvents.PwdResetError]: 'onPwdResetError'
//   // 表单关闭事件
//   [GuardEvents.Close]: 'onClose'
// }

// export enum GuardEvents {
//   // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
//   Load = 'onLoad',
//   // 加载失败
//   LoadError = 'onLoadError',
//   // 用户登录成功
//   Login = 'onLogin',
//   // 用户登录失败
//   LoginError = 'onLoginError',
//   // 注册成功
//   Register = 'onRegister',
//   // 注册失败
//   RegisterError = 'onRegisterError',
//   // 忘记密码邮件发送成功
//   PwdEmailSend = 'onPwdEmailSend',
//   // 忘记密码邮件发送失败
//   PwdEmailSendError = 'onPwdEmailSendError',
//   // 忘记密码手机验证码发送成功
//   PwdPhoneSend = 'onPwdPhoneSend',
//   // 忘记密码手机验证码发送失败
//   PwdPhoneSendError = 'onPwdPhoneSendError',
//   // 重置密码成功
//   PwdReset = 'onPwdReset',
//   // 重置密码失败
//   PwdResetError = 'onPwdResetError',
//   // 表单关闭事件
//   Close = 'onClose',
// }

export const GuardEventsCamelToKebabMap = {
  onLoad: 'load',
  onLoadError: 'load-error',
  onLogin: 'login',
  onLoginError: 'login-error',
  onRegister: 'register',
  onRegisterError: 'register-error',
  onPwdEmailSend: 'pwd-email-send',
  onPwdEmailSendError: 'pwd-email-send-error',
  onPwdPhoneSend: 'pwd-phone-send',
  onPwdPhoneSendError: 'pwd-phone-send-error',
  onPwdReset: 'pwd-reset',
  onPwdResetError: 'pwd-reset-error',
  onClose: 'close',
} as const

export interface GuardEventsHandlerKebab {
  // 加载完成，userPool 配置和应用配置（如果有 appId）加载完成
  load: GuardEventsHandler['onLoad']
  // 加载失败
  'load-error': GuardEventsHandler['onLoadError']
  // 用户登录成功
  login: GuardEventsHandler['onLogin']
  // 用户登录失败
  'login-error': GuardEventsHandler['onLoginError']
  // 注册成功
  register: GuardEventsHandler['onRegister']
  // 注册失败
  'register-error': GuardEventsHandler['onRegisterError']
  // 忘记密码邮件发送成功
  'pwd-email-send': GuardEventsHandler['onPwdEmailSend']
  // 忘记密码邮件发送失败
  'pwd-email-send-error': GuardEventsHandler['onPwdEmailSendError']
  // 忘记密码手机验证码发送成功
  'pwd-phone-send': GuardEventsHandler['onPwdPhoneSend']
  // 忘记密码手机验证码发送失败
  'pwd-phone-send-error': GuardEventsHandler['onPwdPhoneSendError']
  // 重置密码成功
  'pwd-reset': GuardEventsHandler['onPwdReset']
  // 重置密码失败
  'pwd-reset-error': GuardEventsHandler['onPwdResetError']
  // 表单关闭事件
  close: GuardEventsHandler['onClose']
}

export interface GuardEventsHandler {
  onLoad?: (authClient: AuthenticationClient) => void
  onLoadError?: (error: CommonMessage) => void
  onLogin?: (user: User, authClient: AuthenticationClient) => void
  onLoginError?: (user: User, authClient: AuthenticationClient) => void
  onRegister?: (user: User, authClient: AuthenticationClient) => void
  onRegisterError?: (user: User, authClient: AuthenticationClient) => void
  onPwdEmailSend?: (authClient: AuthenticationClient) => void
  onPwdEmailSendError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onPwdPhoneSend?: (authClient: AuthenticationClient) => void
  onPwdPhoneSendError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onPwdReset?: (authClient: AuthenticationClient) => void
  onPwdResetError?: (
    error: CommonMessage,
    authClient: AuthenticationClient
  ) => void
  onClose?: () => void
}

export interface UserConfig {
  logo?: string
  title?: string
  zIndex?: number
  isSSO?: boolean
  mode?: GuardMode
  apiHost?: string
  appDomain?: string
  contentCss?: string
  text?: {
    loginBtn?: {
      normal?: string
      loading?: string
    }
    registerBtn?: {
      normal?: string
      loading?: string
    }
    // 登录 tab
    loginTabs?: Partial<Record<LoginMethods, string>>
  }
  escCloseable?: boolean
  autoRegister?: boolean
  clickCloseable?: boolean
  disableResetPwd?: boolean
  disableRegister?: boolean
  defaultScenes?: GuardScenes
  loginMethods?: LoginMethods[]
  target?: string | HTMLElement
  enterpriseConnections?: string[]
  defaultLoginMethod?: LoginMethods
  registerMethods?: RegisterMethods[]
  socialConnections?: SocialConnections[]
  defaultRegisterMethod?: RegisterMethods
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
}

export interface GuardConfig extends UserConfig {
  socialConnectionObjs: SocialConnectionItem[]
  enterpriseConnectionObjs: EnterpriseConnectionItem[]
}
