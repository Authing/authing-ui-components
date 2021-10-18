import { RegisterMethods } from 'authing-js-sdk'
import {
  IG2FCProps,
  IG2Config,
  getDefaultG2Config,
  IG2Events,
} from 'src/classes'
import {
  AuthenticationClient,
  CommonMessage,
  User,
  EmailRegisterParams,
  PhoneRegisterParams,
} from '..'
import { Agreement } from '../AuthingGuard/api'

export interface RegisterConfig extends IG2Config {
  registerMethods?: RegisterMethods[]
  defaultRegisterMethod?: RegisterMethods
  disableRegister?: boolean
  publicKey?: string
  agreementEnabled?: boolean
  agreements?: Agreement[]
}

const defaultConfig: RegisterConfig = {
  disableRegister: false,
  defaultRegisterMethod: RegisterMethods.Email,
  registerMethods: [RegisterMethods.Email, RegisterMethods.Phone],
}

export interface RegisterEvents extends IG2Events {
  onBeforeRegister?: (
    registerInfo: EmailRegisterParams | PhoneRegisterParams,
    authClient: AuthenticationClient
  ) => boolean | Promise<boolean>
  onRegister?: (user: User, authClient: AuthenticationClient) => void
  onRegisterError?: (user: User, authClient: AuthenticationClient) => void
  onRegisterTabChange?: (activeTab: RegisterMethods) => void
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

export interface GuardRegisterProps extends IG2FCProps, RegisterEvents {
  config?: RegisterConfig
}

const getDefaultConfig = (): RegisterConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export const getDefaultRegisterConfig = getDefaultConfig
