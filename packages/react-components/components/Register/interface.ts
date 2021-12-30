import { RegisterMethods } from 'authing-js-sdk'
import { IG2FCProps, IG2Config, getDefaultG2Config, IG2Events } from '../Type'
import {
  AuthenticationClient,
  User,
  EmailRegisterParams,
  PhoneRegisterParams,
} from '..'
import { Agreement } from '../AuthingGuard/api'

export interface RegisterConfig extends IG2Config {
  disableRegister: boolean
  registerMethods: RegisterMethods[]
  defaultRegisterMethod: RegisterMethods
  publicKey?: string
  agreementEnabled?: boolean
  agreements?: Agreement[]
  registeContext?: any
}

const defaultConfig: RegisterConfig = {
  ...getDefaultG2Config(),
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
  onRegisterError?: (error: any) => void
  onRegisterTabChange?: (activeTab: RegisterMethods) => void
}

export interface GuardRegisterProps extends IG2FCProps, RegisterEvents {
  config?: Partial<RegisterConfig>
}

export interface GuardRegisterViewProps extends GuardRegisterProps {
  config: RegisterConfig
}

const getDefaultConfig = (): RegisterConfig => ({
  ...getDefaultG2Config(),
  ...defaultConfig,
})

export const getDefaultRegisterConfig = getDefaultConfig
