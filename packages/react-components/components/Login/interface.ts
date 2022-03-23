import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
  IG2FCViewProps,
} from '../Type'
import { SocialConnectionProvider } from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'
import { Agreement, PasswordLoginMethods } from '../AuthingGuard/api'
import {
  PasswordLoginParams,
  LDAPLoginParams,
  ADLoginParams,
  PhoneCodeLoginParams,
  AuthenticationClient,
  User,
} from '..'
import { LoginMethods } from '../AuthingGuard/types'

export interface LoginConfig extends IG2Config {
  autoRegister?: boolean
  disableResetPwd?: boolean
  disableRegister?: boolean
  defaultLoginMethod?: LoginMethods
  loginMethods?: LoginMethods[]
  passwordLoginMethods?: PasswordLoginMethods[]
  socialConnections?: SocialConnectionProvider[]
  socialConnectionsBtnShape?: 'default' | 'button' | 'icon'
  enterpriseConnections?: string[]
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
  publicKey?: string
  agreementEnabled?: boolean
  agreements?: Agreement[]
}

export interface LoginEvents extends IG2Events {
  onLogin?: (user: User, authClient: AuthenticationClient) => void
  onLoginError?: (errorMessages: any) => void
  onLoginTabChange?: (activeTab: LoginMethods) => void
  onBeforeLogin?: (
    loginInfo:
      | PasswordLoginParams
      | LDAPLoginParams
      | ADLoginParams
      | PhoneCodeLoginParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
}

export interface GuardLoginProps extends IG2FCProps, LoginEvents {
  config?: Partial<LoginConfig>
}
export interface GuardLoginViewProps extends GuardLoginProps, IG2FCViewProps {
  config: LoginConfig
}

export const getDefaultLoginConfig = (): LoginConfig => ({
  ...getDefaultG2Config(),
})
