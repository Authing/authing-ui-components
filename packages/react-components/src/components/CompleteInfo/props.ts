import { AuthenticationClient, CommonMessage, User } from 'authing-js-sdk'
import {
  getDefaultG2Config,
  IG2Config,
  IG2Events,
  IG2FCProps,
} from 'src/classes'

export interface CompleteInfoConfig extends IG2Config {}

const defaultConfig: CompleteInfoConfig = {
  ...getDefaultG2Config(),
}

export const getDefaultLoginConfig = (): CompleteInfoConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export interface CompleteInfoEvents extends IG2Events {
  onRegisterInfoCompleted?: (
    user: User,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
  onRegisterInfoCompletedError?: (
    error: CommonMessage,
    udfs: {
      definition: any
      value: any
    }[],
    authClient: AuthenticationClient
  ) => void
}

export interface GuardCompleteInfoProps extends IG2FCProps, CompleteInfoEvents {
  config: Partial<CompleteInfoConfig>
}

export interface GuardCompleteInfoViewProps extends GuardCompleteInfoProps {
  config: CompleteInfoConfig
}
