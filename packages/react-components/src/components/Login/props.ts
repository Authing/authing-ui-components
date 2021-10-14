import { getDefaultG2Config, IG2Config, IG2FCProps } from 'src/classes'
import { LoginMethods, SocialConnectionProvider } from 'authing-js-sdk'
import { QrCodeAuthenticationClient } from 'authing-js-sdk/build/main/lib/authentication/QrCodeAuthenticationClient'
import { PasswordLoginMethods } from '../AuthingGuard/api'

export interface LoginConfig extends IG2Config {
  loginMethods?: LoginMethods[]
  defaultLoginMethod?: LoginMethods
  socialConnections?: SocialConnectionProvider[]
  passwordLoginMethods?: PasswordLoginMethods[]
  enterpriseConnections?: string[]
  autoRegister?: boolean
  disableResetPwd?: boolean
  qrCodeScanOptions?: Parameters<QrCodeAuthenticationClient['startScanning']>[1]
  _publicConfig_?: any
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

export interface LoginEvents {
  onLogin: () => void
}

export interface GuardLoginProps extends IG2FCProps, LoginEvents {
  config?: LoginConfig
}

export const getDefaultLoginConfig = (): LoginConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})
