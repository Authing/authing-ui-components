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

export interface GuardConfig {
  target?: string | HTMLElement
  mode?: Mode
  nonce?: number
  timestamp?: number
  title?: string
  logo?: string
  contentCss?: string
  loginMethods?: LoginMethods[]
  socialConnections?: SocialConnections[]
  enterpriseConnections?: string[]
  defaultLoginMethod?: LoginMethods
  autoRegister?: boolean
  clickCloseable?: boolean
  escCloseAble?: boolean
  isSSO?: boolean
  appId?: string
  appDomain?: string
  appType?: AppType
  scope?: string
  useSelfWxapp?: boolean
  apiHost?: string
}
