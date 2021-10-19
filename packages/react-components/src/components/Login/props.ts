import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
  IG2FCViewProps,
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
  autoRegister: boolean
  disableResetPwd: boolean
  defaultLoginMethod: LoginMethods
  loginMethods: LoginMethods[]
  passwordLoginMethods: PasswordLoginMethods[]
  socialConnections?: SocialConnectionProvider[]
  enterpriseConnections?: string[]
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
  publicKey?: string
}

const defaultConfig: LoginConfig = {
  ...getDefaultG2Config(),
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
  onLoginTabChange?: (activeTab: LoginMethods) => void
  onBeforeLogin?: (
    loginInfo:
      | PasswordLoginParams
      | LDAPLoginParams
      | ADLoginParams
      | PhoneCodeLoginParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
  // pwd 开头的是重置密码的场景用的
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
}

export interface GuardLoginProps extends IG2FCProps, LoginEvents {
  config?: Partial<LoginConfig>
}
export interface GuardLoginViewProps extends GuardLoginProps, IG2FCViewProps {
  config: LoginConfig
}

export const getDefaultLoginConfig = (): LoginConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})
