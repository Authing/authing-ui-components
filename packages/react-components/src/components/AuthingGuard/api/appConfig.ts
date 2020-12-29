import { requestClient } from './http'
import { Protocol } from '../../../components/AuthingGuard/types'
import {
  IAzureAdConnectionConfig,
  ICasConnectionConfig,
  ISamlConnectionConfig,
  OIDCConnectionConfig,
  SocialConnectionItem,
} from './userPoolConfig'

export enum ApplicationMfaType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  // OTP = 'OTP',
  // FACE = 'FACE',
  // FINGERPRINT = 'FINGERPRINT',
}

export const ApplicationMfaTypeLabel: Record<ApplicationMfaType, string> = {
  [ApplicationMfaType.SMS]: '短信验证码验证',
  [ApplicationMfaType.EMAIL]: '电子邮箱验证',
}

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
}

export interface UserExtendsField {
  type: 'user'
  id: string
  name: string
  label: string
  inputType: string
}

export type ExtendsField = InternalExtendsField | UserExtendsField

export interface ApplicationConfig {
  id: string
  cdnBase: string
  userPoolId: string
  rootUserPoolId: string
  publicKey: string
  // 登录框自定义 css 代码
  css: string
  name: string
  logo: string
  redirectUris: string[]
  registerDisabled: boolean
  registerTabs: {
    list: string[]
    default: string
    title: { [x: string]: string }
  }
  loginTabs: {
    list: string[]
    default: string
    title: { [x: string]: string }
  }
  socialConnections: SocialConnectionItem[]

  extendsFieldsEnabled: boolean
  extendsFields: ExtendsField[]

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
}

export const fetchAppConfig = (appId: string) =>
  requestClient.get<ApplicationConfig>(
    `/api/v2/applications/${appId}/public-config`
  )
