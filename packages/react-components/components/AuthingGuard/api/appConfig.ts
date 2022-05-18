import {
  Lang,
  LoginMethods,
  Protocol,
} from '../../../components/AuthingGuard/types'
import {
  IAzureAdConnectionConfig,
  ICasConnectionConfig,
  IOAuthConnectionConfig,
  ISamlConnectionConfig,
  OIDCConnectionConfig,
  SocialConnectionItem,
} from './userPoolConfig'
import { i18n } from '../../_utils/locales'
import { requestClient } from '../../_utils/http'
import { PasswordStrength } from '../../_utils'

export enum ApplicationMfaType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  // OTP = 'OTP',
  // FACE = 'FACE',
  // FINGERPRINT = 'FINGERPRINT',
}

export const ApplicationMfaTypeLabel: () => Record<
  ApplicationMfaType,
  string
> = () => ({
  [ApplicationMfaType.SMS]: i18n.t('common.SMS'),
  [ApplicationMfaType.EMAIL]: i18n.t('common.EmailVerification'),
})

export type QrcodeTabsSettings = Record<
  LoginMethods,
  Array<{
    id: string
    title: string
    isDefault?: boolean
  }>
>

export interface OidcClientMetadata {
  grant_types: string[]
  client_id: string
  redirect_uris: string[]
  scope: string
  response_types: ResponseType[]
}
export interface InternalExtendsField {
  type: 'internal'
  name: string
  label: string
  inputType: string
  required: boolean
  validateRules: any[]
}

export interface UserExtendsField {
  type: 'user'
  id: string
  name: string
  label: string
  inputType: string
  required: boolean
  validateRules: any[]
}

export type ExtendsField = InternalExtendsField | UserExtendsField

export interface ApplicationPasswordTabConfig {
  enabledLoginMethods?: PasswordLoginMethods[]
}

export interface ApplicationVerifyCodeTabConfig {
  enabledLoginMethods: VerifyLoginMethods[]
}

export interface Agreement {
  id: number
  title: string
  required: boolean
  lang: Lang
  availableAt?: number
}

export type PasswordLoginMethods =
  | 'username-password'
  | 'email-password'
  | 'phone-password'

export type VerifyLoginMethods = 'email-code' | 'phone-code'

export type ComplateFiledsPlace = 'register' | 'login'
export interface ApplicationConfig {
  id: string
  allowedOrigins: string[]
  corsWhitelist: string[]
  cdnBase: string
  userPoolId: string
  rootUserPoolId: string
  publicKey: string
  internationalSmsConfig?: {
    enabled: boolean
    defaultISOType: string
  }
  // 登录框自定义 css 代码
  css: string
  customLoading?: string
  name: string
  logo: string
  description?: string
  redirectUris: string[]
  registerDisabled: boolean
  registerTabs: {
    list: string[]
    default: string
    title: { [x: string]: string }
  }

  qrcodeTabsSettings: QrcodeTabsSettings

  loginTabs: {
    list: string[]
    default: string
    defaultV2?: string
    title: { [x: string]: string }
  }
  socialConnections: SocialConnectionItem[]

  complateFiledsPlace: ComplateFiledsPlace[]
  extendsFieldsEnabled: boolean
  extendsFields: ExtendsField[]

  identifier: string
  requestHostname: string
  identityProviders: {
    identifier: string
    protocol: Protocol
    displayName: string
    logo: string
    config:
      | ISamlConnectionConfig
      | OIDCConnectionConfig
      | ICasConnectionConfig
      | IAzureAdConnectionConfig
      | IOAuthConnectionConfig
  }[]

  ssoPageComponentDisplay: {
    autoRegisterThenLoginHintInfo: boolean
    forgetPasswordBtn: boolean
    idpBtns: boolean
    loginBtn: boolean
    loginByPhoneCodeTab: boolean
    loginByUserPasswordTab: boolean
    loginMethodNav: boolean
    phoneCodeInput: boolean
    registerBtn: boolean
    registerByEmailTab: boolean
    registerByPhoneTab: boolean
    registerMethodNav: boolean
    socialLoginBtns: boolean
    userPasswordInput: boolean
    wxMpScanTab: boolean
  }

  protocol: Protocol
  oidcConfig: OidcClientMetadata
  passwordTabConfig: ApplicationPasswordTabConfig
  verifyCodeTabConfig?: ApplicationVerifyCodeTabConfig

  agreementEnabled: boolean
  agreements: Agreement[]
  customPasswordStrength: any
  passwordStrength: PasswordStrength
  verifyCodeLength: number
  websocket: string
  welcomeMessage: any

  skipComplateFileds: boolean
}

export const fetchAppConfig = (appId: string) =>
  requestClient.get<ApplicationConfig>(
    `/api/v2/applications/${appId}/public-config`,
    {
      credentials: 'include',
    }
  )
