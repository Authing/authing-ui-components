import {
  EnterpriseConnectionItem,
  SocialConnectionItem,
} from '@/components/AuthingGuard/api'

export enum Mode {
  Normal = 'normal',
  Modal = 'modal',
}

export enum LoginMethods {
  PhoneCode = 'phone-code',
  Password = 'password',
  WxMinQr = 'wechat-miniprogram-qrcode',
  AppQr = 'app-qrcode',
  LDAP = 'ldap',
}

export enum RegisterMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum GuardScenes {
  Login,
  Register,
  RestPassword,
  MfaVerify,
}

export enum ResetPwdMethods {
  Email = 'email',
  Phone = 'phone',
}

export enum SocialConnections {
  WxMinQr = 'wechat:miniprogram:qrconnect',
  WxMinApp = 'wechat:miniprogram:app-launch',
  WxWCorpQr = 'wechatwork:corp:qrconnect',
  WxWSPQr = 'wechatwork:service-provider:qrconnect',
  WxWSPAuth = 'wechatwork:service-provider:authorization',
  WxMobile = 'wechat:mobile',
  WxMinDefault = 'wechat:miniprogram:default',
  Alipay = 'alipay',
  WxWebAuth = 'wechat:webpage-authorization',
  Dingtalk = 'dingtalk',
  Weibo = 'weibo',
  Qq = 'qq',
  WxPc = 'wechat:pc',
  Google = 'google',
  Github = 'github',
}

export enum AppType {
  OAUTH = 'oauth',
  OIDC = 'oidc',
}

export enum Protocol {
  OIDC = "oidc",
  OAUTH = "oauth",
  SAML = "saml",
  LDAP = "ldap",
  AD = "ad",
  CAS = "cas",
  AZURE_AD = "azure-ad",
}

export interface GuardConfig {
  target?: string | HTMLElement
  mode?: Mode
  nonce?: number
  timestamp?: number
  title?: string
  logo?: string
  contentCss?: string
  loginMethods?: LoginMethods[]
  registerMethods?: RegisterMethods[]
  socialConnections?: SocialConnections[]
  enterpriseConnections?: string[]
  defaultLoginMethod?: LoginMethods
  defaultRegisterMethod?: RegisterMethods
  autoRegister?: boolean
  clickCloseable?: boolean
  escCloseable?: boolean
  isSSO?: boolean
  appId?: string
  appDomain?: string
  appType?: AppType
  scope?: string
  useSelfWxapp?: boolean
  apiHost?: string
  defaultScenes?: GuardScenes
}

export interface ProcessedGuardConfig extends GuardConfig {
  enterpriseConnectionObjs: EnterpriseConnectionItem[]
  socialConnectionObjs: SocialConnectionItem[]
}
