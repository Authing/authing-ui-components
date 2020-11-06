import { requestClient } from './http'
import { SocialConnections, Protocol } from '@/components/AuthingGuard/types'

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

export interface OidcClientMetadata {
  grant_types: string[]
  client_id: string
  redirect_uris: string[]
  scope: string
  response_types: ResponseType[]
}

export interface SocialConnectionItem {
  name: string
  logo: string
  description: string
  provider: SocialConnections
  authorizationUrl: string
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
}

export interface UserPoolConfig {
  socialConnections: SocialConnectionItem[]
  enterpriseConnections: EnterpriseConnectionItem[]
}

export const fetchUserPoolConfig = (userPoolId: string) =>
  requestClient.get<UserPoolConfig>(
    `/api/v2/userpools/${userPoolId}/public-config`
  )
