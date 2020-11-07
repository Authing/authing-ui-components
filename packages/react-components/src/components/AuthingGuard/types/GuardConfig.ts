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

export interface UserConfig {
  mode?: Mode
  logo?: string
  nonce?: number
  appId?: string
  scope?: string
  title?: string
  isSSO?: boolean
  apiHost?: string
  appType?: AppType
  timestamp?: number
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
