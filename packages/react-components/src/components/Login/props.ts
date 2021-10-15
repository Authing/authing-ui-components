import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
} from 'src/classes'
import { CommonMessage, SocialConnectionProvider } from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'
import { PasswordLoginMethods } from '../AuthingGuard/api'
import {
  PasswordLoginParams,
  LDAPLoginParams,
  ADLoginParams,
  PhoneCodeLoginParams,
  AuthenticationClient,
  LoginMethods,
  User,
} from '..'

export interface LoginConfig extends IG2Config {
  loginMethods?: LoginMethods[]
  defaultLoginMethod?: LoginMethods
  socialConnections?: SocialConnectionProvider[]
  passwordLoginMethods?: PasswordLoginMethods[]
  enterpriseConnections?: string[]
  autoRegister?: boolean
  disableResetPwd?: boolean
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
  publicKey?: string
}

const defaultConfig: LoginConfig = {
  autoRegister: false,
  disableResetPwd: false,
  defaultLoginMethod: LoginMethods.Password,
  loginMethods: [LoginMethods.Password, LoginMethods.PhoneCode],
  passwordLoginMethods: [
    'email-password',
    'username-password',
    'phone-password',
  ],
}

export interface LoginEvents extends IG2Events {
  onLogin?: (user: User, authClient: AuthenticationClient) => void
  onLoginError?: (user: User, authClient: AuthenticationClient) => void
  onBeforeLogin?: (
    loginInfo:
      | PasswordLoginParams
      | LDAPLoginParams
      | ADLoginParams
      | PhoneCodeLoginParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
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
  onLoginTabChange?: (activeTab: LoginMethods) => void
}

export interface GuardLoginViewProps extends IG2FCProps, LoginEvents {
  config?: LoginConfig
}

export const getDefaultLoginConfig = (): LoginConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})
