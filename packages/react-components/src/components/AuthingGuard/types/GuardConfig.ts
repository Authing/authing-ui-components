import { AuthenticationClient, CommonMessage, User } from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'

import {
  SocialConnectionItem,
  EnterpriseConnectionItem,
} from '@/components/AuthingGuard/api'

export enum Mode {
  Modal = 'modal',
  Normal = 'normal',
}

export enum LoginMethods {
  LDAP = 'ldap',
  AppQr = 'app-qrcode',
  Password = 'password',
  PhoneCode = 'phone-code',
  WxMinQr = 'wechat-miniprogram-qrcode',
}

export enum RegisterMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum GuardScenes {
  Login,
  Register,
  MfaVerify,
  RestPassword,
}

export enum ResetPwdMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum SocialConnections {
  Qq = 'qq',
  Weibo = 'weibo',
  Alipay = 'alipay',
  Github = 'github',
  Google = 'google',
  WxPc = 'wechat:pc',
  Dingtalk = 'dingtalk',
  WxMobile = 'wechat:mobile',
  WxWCorpQr = 'wechatwork:corp:qrconnect',
  WxMinQr = 'wechat:miniprogram:qrconnect',
  WxWebAuth = 'wechat:webpage-authorization',
  WxMinApp = 'wechat:miniprogram:app-launch',
  WxMinDefault = 'wechat:miniprogram:default',
  WxWSPQr = 'wechatwork:service-provider:qrconnect',
  WxWSPAuth = 'wechatwork:service-provider:authorization',
}

export enum AppType {
  OAUTH = 'oauth',
  OIDC = 'oidc',
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

export interface GuardEventsHandler {
  onLoad?: (authClient: AuthenticationClient) => void
  onLoadError?: (error: CommonMessage) => void
  onLogin?: (user: User, authClient: AuthenticationClient) => void
  onLoginError?: (
    user: User,
    authClient: AuthenticationClient
  ) => void
  onRegister?: (
    user: User,
    authClient: AuthenticationClient
  ) => void
  onRegisterError?: (
    user: User,
    authClient: AuthenticationClient
  ) => void
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
  mode?: Mode
  logo?: string
  appId?: string
  scope?: string
  title?: string
  isSSO?: boolean
  apiHost?: string
  appType?: AppType
  appDomain?: string
  contentCss?: string
  escCloseable?: boolean
  autoRegister?: boolean
  clickCloseable?: boolean
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
