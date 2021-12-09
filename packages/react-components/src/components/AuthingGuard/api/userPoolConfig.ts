import { Lang, Protocol } from '../../../components/AuthingGuard/types'
import { SocialConnectionProvider } from 'authing-js-sdk'

export interface OIDCConnectionConfig {
  issuerUrl: string
  authorizationEdpoint: string
  responseType: string
  mode: OIDCConnectionMode
  clientId: string
  clientSecret: string
  scopes: string
  redirectUri: string
}

export interface IOAuthConnectionConfig {
  authEndPoint: string
  tokenEndPoint: string
  scope: string
  clientId: string
  clientSecret: string
  authUrlTemplate: string
  codeToTokenScript: string
  tokenToUserInfoScript: string
  tokenToUserInfoScriptFuncId: string
  codeToTokenScriptFuncId: string
  authUrl?: string // 根据模板拼接出来的授权 url
}

export interface IAzureAdConnectionConfig {
  microsoftAzureAdDomain: string
  clientId: string
  syncUserProfileOnLogin: string
  emailVerifiedDefault: boolean
  authorizationUrl: string
  callbackUrl: string
}

export enum OIDCConnectionMode {
  FRONT_CHANNEL = 'FRONT_CHANNEL',
  BACK_CHANNEL = 'BACK_CHANNEL',
}

export interface ISamlConnectionConfig {
  signInEndPoint: string
  samlRequest?: string

  // saml assertion 验签公钥

  samlIdpCert: string

  // saml request 验签公钥

  samlSpCert: string

  // saml request 签名私钥

  samlSpKey: string

  signOutEndPoint: string

  signSamlRequest: boolean

  signatureAlgorithm: string

  digestAlgorithm: string

  protocolBinding: string
}

export interface ICasConnectionConfig {
  casConnectionLoginUrl: string
}
export interface SocialConnectionItem {
  name: string
  displayName: string
  logo: string
  description: string
  identifier: string
  provider: SocialConnectionProvider
  authorizationUrl: string
  tooltip: Record<Lang, string>
}

export interface EnterpriseConnectionItem {
  id: string
  createdAt: Date
  updatedAt: Date
  userPoolId: string
  protocol: Protocol
  identifier: string
  displayName: string
  logo: string
  enabled: boolean
  config:
    | OIDCConnectionConfig
    | ISamlConnectionConfig
    | ICasConnectionConfig
    | IAzureAdConnectionConfig
    | IOAuthConnectionConfig
}

export interface UserPoolConfig {
  name: string
  logo: string
  socialConnections: SocialConnectionItem[]
  enterpriseConnections: EnterpriseConnectionItem[]
}

// export const fetchUserPoolConfig = (userPoolId: string) =>
//   requestClient.get<UserPoolConfig>(
//     `/api/v2/userpools/${userPoolId}/public-config`
//   )
