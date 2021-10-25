import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
} from 'src/classes'
import { AuthenticationClient, User } from '..'
import { GuardMFAInitData } from '../MFA/props'

export interface BindTotpConfig extends IG2Config {}

const defaultConfig: BindTotpConfig = {
  ...getDefaultG2Config(),
}

export const getDefaultMFAConfig = (): BindTotpConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export interface BindTotpEvents extends IG2Events {
  onLogin?: (user: User, authClient: AuthenticationClient) => void
}

export interface GuardBindTotpInitData extends GuardMFAInitData {}

export interface GuardBindTotpProps extends IG2FCProps, BindTotpEvents {
  config: Partial<BindTotpConfig>
  initData: GuardBindTotpInitData
}

export interface GuardBindTotpViewProps extends GuardBindTotpProps {
  config: BindTotpConfig
  initData: GuardBindTotpInitData
}
