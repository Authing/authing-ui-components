import { getDefaultG2Config, IG2Config, IG2Events, IG2FCProps } from '../Type'
import { AuthenticationClient, User } from '..'

export interface RecoveryCodeConfig extends IG2Config {}

const defaultConfig: RecoveryCodeConfig = {
  ...getDefaultG2Config(),
}

export const getDefaultRecoveryCodeConfig = (): RecoveryCodeConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export interface RecoveryCodeEvents extends IG2Events {
  onLogin?: (user: User, authClient: AuthenticationClient) => void
}

export interface GuardRecoveryCodeInitData {
  mfaToken: string
}

export interface GuardRecoveryCodeProps extends IG2FCProps, RecoveryCodeEvents {
  config: Partial<RecoveryCodeConfig>
  initData: GuardRecoveryCodeInitData
}

export interface GuardRecoveryCodeViewProps extends GuardRecoveryCodeProps {
  config: RecoveryCodeConfig
  initData: GuardRecoveryCodeInitData
}
